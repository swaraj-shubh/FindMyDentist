import { SLOT_TIMES } from "@/lib/constants";
import { addDays, formatDate, formatTime, parseISODate, toISODate } from "@/lib/utils";
import { ServiceError } from "../http";
import { newId } from "../csv/table";
import { appointmentsRepo, sortByDateTime } from "../repositories/appointments";
import { clinicsRepo } from "../repositories/clinics";
import { dentistsRepo } from "../repositories/dentists";
import { patientsRepo } from "../repositories/patients";
import { notify, notifyClinic } from "./notification-service";
import type { BookingInput } from "@/lib/validations/booking";
import type { Appointment } from "@/types/appointment";
import type { User } from "@/types/user";

const ACTIVE = new Set(["scheduled", "confirmed"]);

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Open slots per day for the next `days` days. Sundays closed; past and taken slots removed. */
export async function getAvailability(dentistId: string, days = 14) {
  const today = toISODate();
  const taken = await appointmentsRepo.where((a) => a.dentistId === dentistId && ACTIVE.has(a.status) && a.date >= today);
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(today, i);
    const closed = parseISODate(date).getDay() === 0;
    const slots: string[] = closed
      ? []
      : SLOT_TIMES.filter((t) => !taken.some((a) => a.date === date && a.time === t) && (date > today || t > nowHHMM()));
    return { date, closed, slots };
  });
}

/** Each clinic keeps its own patient profile; FMD links them through the shared user id. */
export async function ensurePatientProfile(user: User, clinicId: string) {
  const existing = (await patientsRepo.where((p) => p.userId === user.id && p.clinicId === clinicId))[0];
  if (existing) return existing;
  const template = (await patientsRepo.where((p) => p.userId === user.id))[0];
  return patientsRepo.insert({
    id: newId("p"),
    userId: user.id,
    clinicId,
    name: user.name,
    dob: template?.dob ?? "",
    gender: template?.gender ?? "other",
    phone: template?.phone ?? "",
    email: user.email,
    bloodGroup: template?.bloodGroup ?? "",
    emergencyContact: template?.emergencyContact ?? "",
    allergies: template?.allergies ?? [],
    medicalHistory: template?.medicalHistory ?? [],
    createdAt: new Date().toISOString(),
  });
}

export async function createBooking(user: User, input: BookingInput): Promise<Appointment> {
  const dentist = await dentistsRepo.get(input.dentistId);
  if (!dentist) throw new ServiceError("This dentist is no longer available.", 404);
  const clinic = await clinicsRepo.get(dentist.clinicId);
  if (!clinic) throw new ServiceError("This clinic is no longer listed.", 404);

  const day = (await getAvailability(dentist.id, 31)).find((d) => d.date === input.date);
  if (!day) throw new ServiceError("Please choose a date within the next 30 days.");
  if (day.closed) throw new ServiceError("The clinic is closed on that day.");
  if (!day.slots.includes(input.time)) throw new ServiceError("That time was just taken. Please pick another slot.", 409);

  const patient = await ensurePatientProfile(user, clinic.id);
  const appointment = await appointmentsRepo.insert({
    id: newId("a"),
    patientId: patient.id,
    dentistId: dentist.id,
    clinicId: clinic.id,
    date: input.date,
    time: input.time,
    duration: 30,
    status: "scheduled",
    appointmentType: input.appointmentType,
    reason: input.reason || "Consultation",
    chair: 1,
    createdAt: new Date().toISOString(),
  });

  const when = `${formatDate(input.date, { day: "numeric", month: "short" })} at ${formatTime(input.time)}`;
  await notify(user.id, {
    type: "appointment",
    title: "Appointment requested",
    message: `${dentist.name} · ${when}. The clinic will confirm shortly.`,
    href: `/appointments/${appointment.id}`,
  });
  await notifyClinic(clinic.id, {
    type: "appointment",
    title: "New online booking",
    message: `${user.name} booked ${dentist.name} for ${when}.`,
    href: "/clinic/appointments",
  });
  return appointment;
}

export async function getUserAppointments(userId: string) {
  const profiles = await patientsRepo.where((p) => p.userId === userId);
  const ids = new Set(profiles.map((p) => p.id));
  const [appts, dentists, clinics] = await Promise.all([
    appointmentsRepo.where((a) => ids.has(a.patientId)),
    dentistsRepo.all(),
    clinicsRepo.all(),
  ]);
  return appts.sort(sortByDateTime).map((a) => ({
    ...a,
    dentist: dentists.find((d) => d.id === a.dentistId)!,
    clinic: clinics.find((c) => c.id === a.clinicId)!,
  }));
}

export type UserAppointment = Awaited<ReturnType<typeof getUserAppointments>>[number];

export async function cancelUserAppointment(user: User, id: string) {
  const appt = (await getUserAppointments(user.id)).find((a) => a.id === id);
  if (!appt) throw new ServiceError("Appointment not found.", 404);
  if (!ACTIVE.has(appt.status)) throw new ServiceError("Only upcoming appointments can be cancelled.");
  await appointmentsRepo.update(id, { status: "cancelled" });
  await notifyClinic(appt.clinicId, {
    type: "appointment",
    title: "Appointment cancelled",
    message: `${user.name} cancelled ${formatDate(appt.date, { day: "numeric", month: "short" })} at ${formatTime(appt.time)}.`,
    href: "/clinic/appointments",
  });
}
