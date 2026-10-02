import { z } from "zod";

export const newPatientSchema = z.object({
  name: z.string().trim().min(2, "Enter the patient's full name").max(80),
  dob: z.iso.date("Enter a valid date of birth"),
  gender: z.enum(["female", "male", "other"]),
  phone: z.string().trim().regex(/^\+?[\d\s-]{8,16}$/, "Enter a valid phone number"),
  email: z.union([z.literal(""), z.email("Enter a valid email")]).default(""),
  allergies: z.string().trim().max(200).default(""),
  medicalHistory: z.string().trim().max(400).default(""),
});

export const newRecordSchema = z.object({
  patientId: z.string().min(1),
  recordType: z.enum(["xray", "photo", "prescription", "treatment", "diagnosis_note", "document"]),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).default(""),
  treatmentId: z.string().default(""),
});

export type NewPatientInput = z.infer<typeof newPatientSchema>;
