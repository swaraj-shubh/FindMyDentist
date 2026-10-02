import { z } from "zod";

export const clinicAppointmentSchema = z.object({
  patientId: z.string().min(1, "Choose a patient"),
  dentistId: z.string().min(1, "Choose a dentist"),
  date: z.iso.date(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.coerce.number().int().min(15).max(240).default(30),
  appointmentType: z.enum(["in_person", "video", "follow_up", "procedure"]),
  reason: z.string().trim().min(2, "Add a reason").max(200),
  chair: z.coerce.number().int().min(1).max(10).default(1),
});

export const appointmentUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["scheduled", "confirmed", "completed", "cancelled", "no_show"]).optional(),
  date: z.iso.date().optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export const treatmentSchema = z.object({
  patientId: z.string().min(1),
  dentistId: z.string().min(1),
  treatment: z.string().trim().min(2).max(120),
  tooth: z.string().trim().max(40).default(""),
  cost: z.coerce.number().min(0).max(10_000_000),
  steps: z.array(z.string().trim().min(1)).min(1).max(10),
  notes: z.string().trim().max(500).default(""),
  warrantyMonths: z.coerce.number().int().min(0).max(120).default(0),
});

export const treatmentUpdateSchema = z.object({
  id: z.string().min(1),
  /** Advance the plan: completes the current step and starts the next. */
  action: z.enum(["advance", "cancel"]),
});

export const billSchema = z.object({
  patientId: z.string().min(1, "Choose a patient"),
  appointmentId: z.string().default(""),
  items: z
    .array(z.object({ description: z.string().trim().min(1), qty: z.coerce.number().int().min(1), price: z.coerce.number().min(0) }))
    .min(1, "Add at least one line item"),
  discount: z.coerce.number().min(0).default(0),
  tax: z.coerce.number().min(0).default(0),
});

export const billUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.literal("paid"),
  paymentMethod: z.enum(["UPI", "Card", "Cash", "Bank transfer"]),
});

export const messageSchema = z.object({
  patientId: z.string().min(1),
  body: z.string().trim().min(1).max(1000),
});
