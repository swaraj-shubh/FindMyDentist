import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { AdvanceTreatmentButton, NewTreatmentDialog } from "@/components/clinic/treatment-actions";
import { TreatmentTimeline } from "@/components/clinic/treatment-timeline";
import { dentistsRepo } from "@/lib/server/repositories/dentists";
import { getClinicForUser, listPatients, listTreatments } from "@/lib/server/services/clinic-service";
import { requireUser } from "@/lib/server/session";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Treatments" };

export default async function TreatmentsPage() {
  const user = await requireUser("/clinic/treatments");
  const clinic = await getClinicForUser(user);
  const [treatments, patients, dentists] = await Promise.all([listTreatments(clinic.id), listPatients(clinic.id), dentistsRepo.where((d) => d.clinicId === clinic.id)]);
  const active = treatments.filter((t) => t.status === "in_progress" || t.status === "planned");
  const closed = treatments.filter((t) => !active.includes(t));
  const card = (t: (typeof treatments)[number], withActions: boolean) => (
    <section key={t.id} className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">{t.treatment}</h3>
          <p className="text-sm text-muted-foreground"><Link href={`/clinic/patients/${t.patientId}`} className="hover:underline">{t.patientName}</Link> · {t.dentistName} · tooth {t.tooth}</p>
        </div>
        <StatusBadge status={t.status} />
      </div>
      <TreatmentTimeline steps={t.steps} compact />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        <span className="text-sm text-muted-foreground">{formatCurrency(t.cost)}</span>
        {withActions && <AdvanceTreatmentButton id={t.id} hasCurrent={t.steps.some((s) => s.status === "current")} />}
      </div>
    </section>
  );
  return (
    <div className="space-y-6">
      <PageHeader title="Treatments" description="Treatment plans across all patients." actions={<NewTreatmentDialog patients={patients.map((p) => ({ id: p.id, name: p.name }))} dentists={dentists.map((d) => ({ id: d.id, name: d.name }))} trigger={<Button><Plus />New treatment plan</Button>} />} />
      {active.length ? <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">{active.map((t) => card(t, true))}</div> : <EmptyState icon={ClipboardList} title="No active treatments" />}
      {closed.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">Closed ({closed.length})</summary>
          <div className="mt-4 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">{closed.map((t) => card(t, false))}</div>
        </details>
      )}
    </div>
  );
}
