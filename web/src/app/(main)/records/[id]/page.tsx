import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { TreatmentTimeline } from "@/components/clinic/treatment-timeline";
import { PrintButton } from "@/components/shared/print-button";
import { RECORD_META, RecordViewer } from "@/components/main/record-viewer";
import { WarrantyCard } from "@/components/main/warranty-card";
import { ServiceError } from "@/lib/server/http";
import { getUserRecord } from "@/lib/server/services/records-service";
import { requireUser } from "@/lib/server/session";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Record" };

export default async function RecordDetailPage({ params }: PageProps<"/records/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/records/${id}`);
  const data = await getUserRecord(user.id, id).catch((e) => {
    if (e instanceof ServiceError) return null;
    throw e;
  });
  if (!data) notFound();
  const { record, episode, treatment } = data;
  const meta = RECORD_META[record.recordType];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/records" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground no-print"><ChevronLeft className="size-4" />Records</Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{meta.label} · {formatDate(record.date, { day: "numeric", month: "long", year: "numeric" })}</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{record.title}</h1>
        </div>
        <PrintButton label="Download / print" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <RecordViewer record={record} />
          {record.recordType !== "diagnosis_note" && record.recordType !== "treatment" && record.recordType !== "prescription" && (
            <p className="rounded-2xl border bg-card p-4 text-sm leading-relaxed">{record.description}</p>
          )}
          <dl className="grid grid-cols-2 gap-4 rounded-2xl border bg-card p-4 text-sm sm:grid-cols-4">
            <div><dt className="text-muted-foreground">Type</dt><dd className="font-medium">{meta.label}</dd></div>
            <div><dt className="text-muted-foreground">Date</dt><dd className="font-medium">{formatDate(record.date)}</dd></div>
            <div><dt className="text-muted-foreground">Dentist</dt><dd className="font-medium">{record.doctor}</dd></div>
            <div><dt className="text-muted-foreground">Clinic</dt><dd className="font-medium">{record.clinic}</dd></div>
          </dl>
        </div>
        <aside className="space-y-4">
          {treatment && (
            <section className="rounded-2xl border bg-card p-4">
              <div className="mb-4 flex items-start justify-between gap-2">
                <h2 className="font-semibold">{treatment.treatment}</h2>
                <StatusBadge status={treatment.status} />
              </div>
              <TreatmentTimeline steps={treatment.steps} compact />
            </section>
          )}
          {episode.length > 1 && (
            <section className="rounded-2xl border bg-card p-4">
              <h2 className="mb-3 font-semibold">Timeline</h2>
              <ol className="space-y-1">
                {episode.map((r) => (
                  <li key={r.id}>
                    <Link href={`/records/${r.id}`} aria-current={r.id === record.id ? "page" : undefined} className={cn("flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted", r.id === record.id && "bg-secondary font-medium")}>
                      <span className="truncate">{r.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{formatDate(r.date, { day: "numeric", month: "short" })}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}
          {treatment?.status === "completed" && treatment.warrantyMonths > 0 && (
            <WarrantyCard treatment={treatment.treatment} tooth={treatment.tooth} completed={treatment.completionDate} months={treatment.warrantyMonths} clinic={record.clinic} dentist={record.doctor} />
          )}
        </aside>
      </div>
    </div>
  );
}
