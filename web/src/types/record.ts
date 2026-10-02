export type RecordType =
  | "xray"
  | "photo"
  | "prescription"
  | "treatment"
  | "diagnosis_note"
  | "document"
  | "invoice";

export interface DentalRecord {
  id: string;
  patientId: string;
  appointmentId: string;
  treatmentId: string;
  recordType: RecordType;
  title: string;
  description: string;
  fileUrl: string;
  date: string;
  doctor: string;
  clinic: string;
  visibility: "patient" | "clinic" | "shared";
}
