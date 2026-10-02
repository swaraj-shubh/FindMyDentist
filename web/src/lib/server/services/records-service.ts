import { ServiceError } from "../http";
import { patientsRepo } from "../repositories/patients";
import { recordsRepo } from "../repositories/records";
import { treatmentsRepo } from "../repositories/treatments";
import { dentistsRepo } from "../repositories/dentists";
import { clinicsRepo } from "../repositories/clinics";

/** All records across every clinic profile linked to this FMD user — the patient-owned vault. */
export async function getUserRecords(userId: string) {
  const profiles = await patientsRepo.where((p) => p.userId === userId);
  const ids = new Set(profiles.map((p) => p.id));
  const records = await recordsRepo.where((r) => ids.has(r.patientId) && r.visibility !== "clinic");
  return records.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getUserTreatments(userId: string) {
  const profiles = await patientsRepo.where((p) => p.userId === userId);
  const ids = new Set(profiles.map((p) => p.id));
  const [treatments, dentists, clinics] = await Promise.all([
    treatmentsRepo.where((t) => ids.has(t.patientId)),
    dentistsRepo.all(),
    clinicsRepo.all(),
  ]);
  return treatments.map((t) => ({
    ...t,
    dentist: dentists.find((d) => d.id === t.dentistId),
    clinic: clinics.find((c) => c.id === t.clinicId),
  }));
}

export async function getUserRecord(userId: string, recordId: string) {
  const records = await getUserRecords(userId);
  const record = records.find((r) => r.id === recordId);
  if (!record) throw new ServiceError("Record not found.", 404);
  // The episode: every record that belongs to the same treatment, oldest first.
  const episode = record.treatmentId
    ? records.filter((r) => r.treatmentId === record.treatmentId).sort((a, b) => a.date.localeCompare(b.date))
    : [record];
  const treatment = record.treatmentId ? await treatmentsRepo.get(record.treatmentId) : null;
  return { record, episode, treatment };
}
