import { addDays, formatDate, formatTime, toISODate } from "@/lib/utils";
import { ServiceError } from "../http";
import { newId } from "../csv/table";
import { appointmentsRepo, sortByDateTime } from "../repositories/appointments";
import { billsRepo } from "../repositories/bills";
import { clinicsRepo, messagesRepo } from "../repositories/clinics";
import { dentistsRepo } from "../repositories/dentists";
import { patientsRepo, searchPatients } from "../repositories/patients";
import { recordsRepo } from "../repositories/records";
import { treatmentsRepo } from "../repositories/treatments";
import { notify } from "./notification-service";
import type { z } from "zod";
import type { billSchema, clinicAppointmentSchema, treatmentSchema } from "@/lib/validations/clinic";
import type { newPatientSchema, newRecordSchema } from "@/lib/validations/patient";
import type { Appointment, AppointmentStatus } from "@/types/appointment";
import type { BillItem } from "@/types/billing";
import type { Patient, Treatment } from "@/types/patient";
import type { RecordType } from "@/types/record";
import type { User } from "@/types/user";

/** Tenant boundary: every clinic query is scoped by the signed-in user's clinic. */
export async function getClinicForUser(user: User) {
  const clinic = await clinicsRepo.get(user.clinicId || "c001");
  if (!clinic) throw new ServiceError("No clinic linked to this account.", 403);
  return clinic;
}

async function ownedPatient(clinicId: string, patientId: string) {
  const p = await patientsRepo.get(patientId);
  if (!p || p.clinicId !== clinicId) throw new ServiceError("Patient not found.", 404);
  return p;
}

async function lookups(clinicId: string) {
  const [patients, dentists] = await Promise.all([
    patientsRepo.where((p) => p.clinicId === clinicId),
    dentistsRepo.where((d) => d.clinicId === clinicId),
  ]);
  return { patients, dentists };
}

export type ScheduleItem = Appointment & { patient: Patient | undefined; dentistName: string };

export async function getSchedule(clinicId: string, from: string, to = from): Promise<ScheduleItem[]> {
  const [appts, { patients, dentists }] = await Promise.all([
    appointmentsRepo.where((a) => a.clinicId === clinicId && a.date >= from && a.date <= to),
    lookups(clinicId),
  ]);
  return appts.sort(sortByDateTime).map((a) => ({
    ...a,
    patient: patients.find((p) => p.id === a.patientId),
    dentistName: dentists.find((d) => d.id === a.dentistId)?.name ?? "—",
  }));
}

export async function getDashboard(clinicId: string) {
  const today = toISODate();
  const [schedule, bills, messages] = await Promise.all([
    getSchedule(clinicId, today),
    billsRepo.where((b) => b.clinicId === clinicId),
    messagesRepo.where((m) => m.clinicId === clinicId && m.sender === "patient" && !m.read),
  ]);
  const active = schedule.filter((a) => a.status !== "cancelled");
  return {
    schedule,
    metrics: {
      appointments: active.length,
      patients: new Set(active.filter((a) => a.status !== "no_show").map((a) => a.patientId)).size,
      pending: schedule.filter((a) => a.status === "scheduled").length,
      revenue: bills.filter((b) => b.status === "paid" && b.paidAt.startsWith(today)).reduce((s, b) => s + b.total, 0),
      outstanding: bills.filter((b) => b.status === "pending" || b.status === "overdue").reduce((s, b) => s + b.total, 0),
      unreadMessages: messages.length,
    },
    upcoming: (await getSchedule(clinicId, addDays(today, 1), addDays(today, 7))).filter((a) => a.status === "scheduled").slice(0, 5),
  };
}

export async function updateAppointment(clinicId: string, id: string, patch: { status?: AppointmentStatus; date?: string; time?: string }) {
  const appt = await appointmentsRepo.get(id);
  if (!appt || appt.clinicId !== clinicId) throw new ServiceError("Appointment not found.", 404);
  if (patch.date && patch.time) {
    const clash = await appointmentsRepo.where(
      (a) => a.id !== id && a.dentistId === appt.dentistId && a.date === patch.date && a.time === patch.time && ["scheduled", "confirmed"].includes(a.status),
    );
    if (clash.length) throw new ServiceError("The dentist already has an appointment at that time.", 409);
  }
  const updated = await appointmentsRepo.update(id, patch);
  const patient = await patientsRepo.get(appt.patientId);
  if (patient?.userId && (patch.status === "confirmed" || patch.status === "cancelled" || patch.date)) {
    const when = `${formatDate(updated!.date, { day: "numeric", month: "short" })} at ${formatTime(updated!.time)}`;
    await notify(patient.userId, {
      type: "appointment",
      title: patch.date ? "Appointment rescheduled" : patch.status === "confirmed" ? "Appointment confirmed" : "Appointment cancelled by clinic",
      message: `Your appointment is ${patch.status === "cancelled" ? "cancelled" : `on ${when}`}.`,
      href: `/appointments/${id}`,
    });
  }
  return updated;
}

export async function createClinicAppointment(clinicId: string, input: z.infer<typeof clinicAppointmentSchema>) {
  await ownedPatient(clinicId, input.patientId);
  const dentist = await dentistsRepo.get(input.dentistId);
  if (!dentist || dentist.clinicId !== clinicId) throw new ServiceError("Choose a dentist from this clinic.");
  const clash = await appointmentsRepo.where(
    (a) => a.dentistId === input.dentistId && a.date === input.date && a.time === input.time && ["scheduled", "confirmed"].includes(a.status),
  );
  if (clash.length) throw new ServiceError("The dentist already has an appointment at that time.", 409);
  return appointmentsRepo.insert({ ...input, id: newId("a"), clinicId, status: "confirmed", createdAt: new Date().toISOString() });
}

// ─── Patients ────────────────────────────────────────────────────────────────

export async function listPatients(clinicId: string, q = "") {
  const [patients, appts, treatments] = await Promise.all([
    searchPatients(clinicId, q),
    appointmentsRepo.where((a) => a.clinicId === clinicId),
    treatmentsRepo.where((t) => t.clinicId === clinicId),
  ]);
  const today = toISODate();
  return patients.map((p) => {
    const mine = appts.filter((a) => a.patientId === p.id).sort(sortByDateTime);
    const past = mine.filter((a) => a.date <= today && a.status === "completed");
    const next = mine.find((a) => a.date >= today && ["scheduled", "confirmed"].includes(a.status));
    const tx = treatments.filter((t) => t.patientId === p.id);
    const current = tx.find((t) => t.status === "in_progress") ?? tx.find((t) => t.status === "planned") ?? tx.at(-1);
    return {
      ...p,
      lastVisit: past.at(-1)?.date ?? "",
      nextVisit: next?.date ?? "",
      treatment: current?.treatment ?? "",
      dentistId: current?.dentistId ?? mine.at(-1)?.dentistId ?? "",
      status: tx.some((t) => t.status === "in_progress" || t.status === "planned") ? ("active" as const) : ("completed" as const),
    };
  });
}

export type PatientRow = Awaited<ReturnType<typeof listPatients>>[number];

export async function getPatientDetail(clinicId: string, patientId: string) {
  const patient = await ownedPatient(clinicId, patientId);
  const [appointments, treatments, records, bills, messages, dentists] = await Promise.all([
    appointmentsRepo.where((a) => a.patientId === patientId),
    treatmentsRepo.where((t) => t.patientId === patientId),
    recordsRepo.where((r) => r.patientId === patientId),
    billsRepo.where((b) => b.patientId === patientId),
    messagesRepo.where((m) => m.patientId === patientId && m.clinicId === clinicId),
    dentistsRepo.where((d) => d.clinicId === clinicId),
  ]);
  const today = toISODate();
  appointments.sort(sortByDateTime);
  return {
    patient,
    dentists,
    appointments,
    upcoming: appointments.find((a) => a.date >= today && ["scheduled", "confirmed"].includes(a.status)) ?? null,
    treatments,
    records: records.sort((a, b) => b.date.localeCompare(a.date)),
    bills: bills.sort((a, b) => b.date.localeCompare(a.date)),
    messages: messages.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  };
}

export async function addPatient(clinicId: string, input: z.infer<typeof newPatientSchema>) {
  const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
  return patientsRepo.insert({
    id: newId("p"),
    userId: "",
    clinicId,
    name: input.name,
    dob: input.dob,
    gender: input.gender,
    phone: input.phone,
    email: input.email,
    bloodGroup: "",
    emergencyContact: "",
    allergies: split(input.allergies),
    medicalHistory: split(input.medicalHistory),
    createdAt: new Date().toISOString(),
  });
}

export async function addRecord(clinicId: string, user: User, input: z.infer<typeof newRecordSchema>) {
  const patient = await ownedPatient(clinicId, input.patientId);
  const clinic = await clinicsRepo.get(clinicId);
  const record = await recordsRepo.insert({
    id: newId("r"),
    patientId: patient.id,
    appointmentId: "",
    treatmentId: input.treatmentId,
    recordType: input.recordType as RecordType,
    title: input.title,
    description: input.description,
    fileUrl: "",
    date: toISODate(),
    doctor: user.name,
    clinic: clinic?.name ?? "",
    visibility: "shared",
  });
  if (patient.userId)
    await notify(patient.userId, { type: "record", title: "New record added", message: `${clinic?.name} added “${input.title}” to your records.`, href: `/records/${record.id}` });
  return record;
}

// ─── Treatments ─────────────────────────────────────────────────────────────

export async function listTreatments(clinicId: string) {
  const [treatments, { patients, dentists }] = await Promise.all([treatmentsRepo.where((t) => t.clinicId === clinicId), lookups(clinicId)]);
  const order = { in_progress: 0, planned: 1, completed: 2, cancelled: 3 };
  return treatments
    .sort((a, b) => order[a.status] - order[b.status] || b.startDate.localeCompare(a.startDate))
    .map((t) => ({ ...t, patientName: patients.find((p) => p.id === t.patientId)?.name ?? "—", dentistName: dentists.find((d) => d.id === t.dentistId)?.name ?? "—" }));
}

export async function createTreatment(clinicId: string, input: z.infer<typeof treatmentSchema>) {
  await ownedPatient(clinicId, input.patientId);
  const today = toISODate();
  return treatmentsRepo.insert({
    id: newId("t"),
    clinicId,
    patientId: input.patientId,
    dentistId: input.dentistId,
    treatment: input.treatment,
    tooth: input.tooth,
    status: "planned",
    startDate: today,
    completionDate: "",
    cost: input.cost,
    notes: input.notes,
    warrantyMonths: input.warrantyMonths,
    steps: input.steps.map((label) => ({ label, status: "pending" as const, date: "" })),
  });
}

/** Moves the plan forward one step; completing the last step completes the treatment. */
export async function updateTreatment(clinicId: string, id: string, action: "advance" | "cancel") {
  const t = await treatmentsRepo.get(id);
  if (!t || t.clinicId !== clinicId) throw new ServiceError("Treatment not found.", 404);
  if (t.status === "completed" || t.status === "cancelled") throw new ServiceError("This treatment is already closed.");
  const today = toISODate();
  if (action === "cancel") return treatmentsRepo.update(id, { status: "cancelled" });

  const steps = t.steps.map((s) => ({ ...s }));
  const current = steps.findIndex((s) => s.status === "current");
  if (current >= 0) {
    steps[current] = { ...steps[current], status: "done", date: steps[current].date || today };
    if (steps[current + 1]) steps[current + 1] = { ...steps[current + 1], status: "current", date: today };
  } else {
    const firstPending = steps.findIndex((s) => s.status === "pending");
    if (firstPending >= 0) steps[firstPending] = { ...steps[firstPending], status: "current", date: today };
  }
  const done = steps.every((s) => s.status === "done");
  const patch: Partial<Treatment> = { steps, status: done ? "completed" : "in_progress", completionDate: done ? today : "" };
  const updated = await treatmentsRepo.update(id, patch);
  const patient = await patientsRepo.get(t.patientId);
  if (patient?.userId && done)
    await notify(patient.userId, {
      type: "record",
      title: "Treatment completed",
      message: t.warrantyMonths ? `${t.treatment} is complete — your ${t.warrantyMonths}-month digital warranty is in Records.` : `${t.treatment} is complete.`,
      href: "/records",
    });
  return updated;
}

// ─── Billing ────────────────────────────────────────────────────────────────

export async function listBills(clinicId: string) {
  const [bills, { patients }] = await Promise.all([billsRepo.where((b) => b.clinicId === clinicId), lookups(clinicId)]);
  const today = toISODate();
  const rows = bills
    .sort((a, b) => b.date.localeCompare(a.date) || b.invoiceNumber.localeCompare(a.invoiceNumber))
    .map((b) => ({ ...b, patientName: patients.find((p) => p.id === b.patientId)?.name ?? "—" }));
  return {
    bills: rows,
    metrics: {
      revenueToday: bills.filter((b) => b.status === "paid" && b.paidAt.startsWith(today)).reduce((s, b) => s + b.total, 0),
      revenueMonth: bills.filter((b) => b.status === "paid" && b.paidAt.slice(0, 7) === today.slice(0, 7)).reduce((s, b) => s + b.total, 0),
      outstanding: bills.filter((b) => b.status === "pending" || b.status === "overdue").reduce((s, b) => s + b.total, 0),
      overdue: bills.filter((b) => b.status === "overdue").length,
    },
  };
}

export type BillRow = Awaited<ReturnType<typeof listBills>>["bills"][number];

export async function createBill(clinicId: string, input: z.infer<typeof billSchema>) {
  await ownedPatient(clinicId, input.patientId);
  const all = await billsRepo.all();
  const next = Math.max(1000, ...all.map((b) => Number(b.invoiceNumber.replace(/\D/g, "")) || 0)) + 1;
  const items: BillItem[] = input.items;
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  if (input.discount > subtotal) throw new ServiceError("Discount can't exceed the subtotal.");
  return billsRepo.insert({
    id: newId("b"),
    patientId: input.patientId,
    clinicId,
    appointmentId: input.appointmentId,
    invoiceNumber: `INV-${next}`,
    items,
    subtotal,
    discount: input.discount,
    tax: input.tax,
    total: subtotal - input.discount + input.tax,
    status: "pending",
    date: toISODate(),
    paidAt: "",
    paymentMethod: "",
  });
}

// ponytail: "mark paid" records the method only; a real payment gateway + reconciliation replaces this.
export async function markBillPaid(clinicId: string, id: string, paymentMethod: string) {
  const bill = await billsRepo.get(id);
  if (!bill || bill.clinicId !== clinicId) throw new ServiceError("Invoice not found.", 404);
  if (bill.status === "paid") throw new ServiceError("This invoice is already paid.");
  return billsRepo.update(id, { status: "paid", paidAt: `${toISODate()}T${new Date().toTimeString().slice(0, 8)}`, paymentMethod });
}

// ─── Messages ───────────────────────────────────────────────────────────────

export async function listThreads(clinicId: string) {
  const [messages, patients] = await Promise.all([messagesRepo.where((m) => m.clinicId === clinicId), patientsRepo.where((p) => p.clinicId === clinicId)]);
  const byPatient = new Map<string, typeof messages>();
  for (const m of messages.sort((a, b) => a.createdAt.localeCompare(b.createdAt))) byPatient.set(m.patientId, [...(byPatient.get(m.patientId) ?? []), m]);
  return [...byPatient.entries()]
    .map(([patientId, msgs]) => ({
      patient: patients.find((p) => p.id === patientId)!,
      messages: msgs,
      unread: msgs.filter((m) => m.sender === "patient" && !m.read).length,
      last: msgs.at(-1)!,
    }))
    .filter((t) => t.patient)
    .sort((a, b) => b.last.createdAt.localeCompare(a.last.createdAt));
}

export type Thread = Awaited<ReturnType<typeof listThreads>>[number];

export async function sendMessage(clinicId: string, patientId: string, body: string) {
  const patient = await ownedPatient(clinicId, patientId);
  const unread = await messagesRepo.where((m) => m.patientId === patientId && m.clinicId === clinicId && !m.read);
  for (const m of unread) await messagesRepo.update(m.id, { read: true });
  const msg = await messagesRepo.insert({ id: newId("m"), clinicId, patientId, sender: "clinic", body, createdAt: new Date().toISOString(), read: true });
  if (patient.userId) await notify(patient.userId, { type: "appointment", title: "Message from your clinic", message: body.slice(0, 120), href: "/appointments" });
  return msg;
}

// ─── Analytics ──────────────────────────────────────────────────────────────

export async function getAnalytics(clinicId: string, days = 30) {
  const today = toISODate();
  const from = addDays(today, -days + 1);
  const [appts, bills, treatments, dentists] = await Promise.all([
    appointmentsRepo.where((a) => a.clinicId === clinicId && a.date >= from && a.date <= today),
    billsRepo.where((b) => b.clinicId === clinicId && b.status === "paid" && b.paidAt.slice(0, 10) >= from),
    treatmentsRepo.where((t) => t.clinicId === clinicId),
    dentistsRepo.where((d) => d.clinicId === clinicId),
  ]);
  const daily = Array.from({ length: days }, (_, i) => {
    const date = addDays(from, i);
    return {
      date,
      revenue: bills.filter((b) => b.paidAt.startsWith(date)).reduce((s, b) => s + b.total, 0),
      appointments: appts.filter((a) => a.date === date && a.status !== "cancelled").length,
    };
  });
  const statusCounts = (["completed", "confirmed", "scheduled", "no_show", "cancelled"] as const).map((status) => ({
    status,
    count: appts.filter((a) => a.status === status).length,
  }));
  const byDentist = dentists.map((d) => ({
    name: d.name,
    appointments: appts.filter((a) => a.dentistId === d.id && a.status === "completed").length,
  }));
  const decided = appts.filter((a) => ["completed", "no_show"].includes(a.status)).length || 1;
  return {
    daily,
    statusCounts,
    byDentist,
    totals: {
      revenue: bills.reduce((s, b) => s + b.total, 0),
      appointments: appts.filter((a) => a.status !== "cancelled").length,
      noShowRate: appts.filter((a) => a.status === "no_show").length / decided,
      activeTreatments: treatments.filter((t) => t.status === "in_progress").length,
    },
  };
}
