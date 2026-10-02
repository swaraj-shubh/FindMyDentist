import { defineTable } from "../csv/table";
import type { Appointment, AppointmentStatus } from "@/types/appointment";

export const appointmentsRepo = defineTable<Appointment>("appointments", {
  numbers: ["duration", "chair"],
});

export function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  return appointmentsRepo.update(id, { status });
}

export const sortByDateTime = (a: Appointment, b: Appointment) =>
  `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);
