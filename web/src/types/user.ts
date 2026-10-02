export type UserRole = "patient" | "dentist" | "student" | "faculty" | "clinic";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  city: string;
  specialty: string;
  /** Dentists and clinic staff belong to a clinic. */
  clinicId: string;
  /** Academic level for students/faculty (BDS, MDS, Faculty). */
  level: string;
  onboarded: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: "appointment" | "record" | "community" | "academic" | "billing" | "system";
  title: string;
  message: string;
  href: string;
  read: boolean;
  createdAt: string;
}
