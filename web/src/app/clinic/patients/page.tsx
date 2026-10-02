import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { NewPatientDialog } from "@/components/clinic/clinic-dialogs";
import { PatientTable } from "@/components/clinic/patient-table";
import { dentistsRepo } from "@/lib/server/repositories/dentists";
import { getClinicForUser, listPatients } from "@/lib/server/services/clinic-service";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Patients" };

export default async function PatientsPage() {
  const user = await requireUser("/clinic/patients");
  const clinic = await getClinicForUser(user);
  const [patients, dentists] = await Promise.all([listPatients(clinic.id), dentistsRepo.where((d) => d.clinicId === clinic.id)]);
  return (
    <div className="space-y-6">
      <PageHeader title="Patients" description={`${patients.length} registered at ${clinic.name}`} actions={<NewPatientDialog trigger={<Button><UserPlus />Add patient</Button>} />} />
      <PatientTable patients={patients} dentists={dentists.map((d) => ({ id: d.id, name: d.name }))} />
    </div>
  );
}
