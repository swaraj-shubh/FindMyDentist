import { defineTable } from "../csv/table";
import type { Patient } from "@/types/patient";

export const patientsRepo = defineTable<Patient>("patients");

export async function getPatientByUserId(userId: string) {
  return (await patientsRepo.where((p) => p.userId === userId))[0] ?? null;
}

export async function searchPatients(clinicId: string, q = "") {
  const term = q.trim().toLowerCase();
  return patientsRepo.where(
    (p) =>
      p.clinicId === clinicId &&
      (!term || [p.name, p.phone, p.email, p.id].some((f) => f.toLowerCase().includes(term))),
  );
}
