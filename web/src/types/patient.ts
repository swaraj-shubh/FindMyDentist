export interface Patient {
  id: string;
  userId: string;
  clinicId: string;
  name: string;
  dob: string;
  gender: "female" | "male" | "other";
  phone: string;
  email: string;
  bloodGroup: string;
  emergencyContact: string;
  allergies: string[];
  medicalHistory: string[];
  createdAt: string;
}

export type TreatmentStatus = "planned" | "in_progress" | "completed" | "cancelled";
export type StepStatus = "done" | "current" | "pending";

export interface TreatmentStep {
  label: string;
  status: StepStatus;
  date: string;
}

export interface Treatment {
  id: string;
  patientId: string;
  dentistId: string;
  clinicId: string;
  treatment: string;
  tooth: string;
  status: TreatmentStatus;
  startDate: string;
  completionDate: string;
  cost: number;
  notes: string;
  warrantyMonths: number;
  steps: TreatmentStep[];
}
