import { z } from "zod";

export const bookingSchema = z.object({
  dentistId: z.string().min(1),
  date: z.iso.date(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  appointmentType: z.enum(["in_person", "video"]),
  reason: z.string().trim().max(300).default(""),
});

export const cancelSchema = z.object({ id: z.string().min(1), action: z.literal("cancel") });

export type BookingInput = z.infer<typeof bookingSchema>;
