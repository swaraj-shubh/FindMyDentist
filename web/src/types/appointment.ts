export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
export type AppointmentType = "in_person" | "video" | "follow_up" | "procedure";

export interface Appointment {
  id: string;
  patientId: string;
  dentistId: string;
  clinicId: string;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  appointmentType: AppointmentType;
  reason: string;
  chair: number;
  createdAt: string;
}
