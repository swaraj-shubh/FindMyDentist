import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Lock } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TreatmentTimeline } from "@/components/clinic/treatment-timeline";
import { RecordsVault } from "@/components/main/records-vault";
import { WarrantyCard } from "@/components/main/warranty-card";
import { getUserAppointments } from "@/lib/server/services/booking-service";
import { getUserRecords, getUserTreatments } from "@/lib/server/services/records-service";
import { requireUser } from "@/lib/server/session";
import { formatDate, formatTime, toISODate } from "@/lib/utils";

export const metadata: Metadata = { title: "Dental records" };

export default async function RecordsPage() {
  const user = await requireUser("/records");
  const [records, treatments, appointments] = await Promise.all([getUserRecords(user.id), getUserTreatments(user.id), getUserAppointments(user.id)]);
  const today = toISODate();
  const next = appointments.find((a) => a.date >= today && ["scheduled", "confirmed"].includes(a.status));
  const active = treatments.filter((t) => t.status === "in_progress" || t.status === "planned");
  const warranties = treatments.filter((t) => t.status === "completed" && t.warrantyMonths > 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dental records"
        description="Your personal health vault — X-rays, treatments and prescriptions from every FMD clinic."
        actions={<span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="size-3.5" aria-hidden />Only you and clinics you visit can see these</span>}
      />
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <RecordsVault records={records} />
        <aside className="space-y-4">
          {next && (
            <Link href={`/appointments/${next.id}`} className="block rounded-2xl border bg-card p-4 hover:shadow-md">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><CalendarDays className="size-3.5" aria-hidden />Upcoming</p>
              <p className="mt-1 font-semibold">{next.reason}</p>
              <p className="text-sm text-muted-foreground">{formatDate(next.date, { day: "numeric", month: "short" })} · {formatTime(next.time)} · {next.dentist.name}</p>
            </Link>
          )}
          {active.map((t) => (
            <section key={t.id} className="rounded-2xl border bg-card p-4">
              <div className="mb-4 flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{t.treatment}</h2>
                  <p className="text-sm text-muted-foreground">Tooth {t.tooth} · {t.dentist?.name}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
              <TreatmentTimeline steps={t.steps} compact />
            </section>
          ))}
          {warranties.map((t) => (
            <WarrantyCard key={t.id} treatment={t.treatment} tooth={t.tooth} completed={t.completionDate} months={t.warrantyMonths} clinic={t.clinic?.name ?? ""} dentist={t.dentist?.name ?? ""} />
          ))}
        </aside>
      </div>
    </div>
  );
}
