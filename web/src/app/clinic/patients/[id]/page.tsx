import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CalendarPlus, ChevronLeft, ClipboardPlus, FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { NewAppointmentDialog } from "@/components/clinic/clinic-dialogs";
import { MessageThread } from "@/components/clinic/clinic-message-panel";
import { AddRecordDialog, AdvanceTreatmentButton, NewTreatmentDialog } from "@/components/clinic/treatment-actions";
import { TreatmentTimeline } from "@/components/clinic/treatment-timeline";
import { RECORD_META } from "@/components/main/record-viewer";
import { ServiceError } from "@/lib/server/http";
import { getClinicForUser, getPatientDetail } from "@/lib/server/services/clinic-service";
import { requireUser } from "@/lib/server/session";
import { age, formatCurrency, formatDate, formatTime, toISODate } from "@/lib/utils";

export const metadata: Metadata = { title: "Patient" };

export default async function PatientDetail({ params }: PageProps<"/clinic/patients/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/clinic/patients/${id}`);
  const clinic = await getClinicForUser(user);
  const d = await getPatientDetail(clinic.id, id).catch((e) => { if (e instanceof ServiceError) return null; throw e; });
  if (!d) notFound();
  const { patient: p, dentists } = d;
  const events = [
    ...d.appointments.filter((a) => a.status === "completed").map((a) => ({ date: a.date, title: a.reason, sub: "Appointment" })),
    ...d.records.map((r) => ({ date: r.date, title: r.title, sub: RECORD_META[r.recordType].label })),
    ...d.appointments.filter((a) => ["scheduled", "confirmed"].includes(a.status) && a.date >= toISODate()).map((a) => ({ date: a.date, title: a.reason, sub: "Upcoming" })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  const people = { patients: [{ id: p.id, name: p.name }], dentists: dentists.map((x) => ({ id: x.id, name: x.name })) };

  return (
    <div className="space-y-6">
      <Link href="/clinic/patients" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" />Patients</Link>
      <header className="flex flex-wrap items-start gap-4">
        <UserAvatar name={p.name} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">{p.name}</h1>
          <p className="text-sm text-muted-foreground">Patient ID: {p.id.toUpperCase()} · {age(p.dob)} yrs · {p.gender} · {p.bloodGroup || "Blood group n/a"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <NewAppointmentDialog {...people} patientId={p.id} trigger={<Button><CalendarPlus />Book</Button>} />
          <AddRecordDialog patientId={p.id} treatments={d.treatments} trigger={<Button variant="outline"><FilePlus2 />Add record</Button>} />
          <NewTreatmentDialog {...people} patientId={p.id} trigger={<Button variant="outline"><ClipboardPlus />Add treatment</Button>} />
        </div>
      </header>
      {(p.allergies.length > 0 || p.medicalHistory.length > 0) && (
        <p className="flex gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden /><span><strong>Medical alerts:</strong> {[...p.allergies.map((a) => `Allergy — ${a}`), ...p.medicalHistory].join(" · ")}</span></p>
      )}
      <Tabs defaultValue="overview">
        <TabsList className="max-w-full overflow-x-auto">
          {["overview", "timeline", "treatments", "xrays", "documents", "billing", "messages"].map((t) => <TabsTrigger key={t} value={t} className="capitalize">{t === "xrays" ? "X-rays" : t}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="overview" className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border bg-card p-4"><h2 className="mb-3 font-semibold">Contact</h2><dl className="space-y-1.5 text-sm"><div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd>{p.phone}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>{p.email || "—"}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Emergency</dt><dd>{p.emergencyContact || "—"}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Date of birth</dt><dd>{formatDate(p.dob)}</dd></div></dl></section>
          <section className="rounded-xl border bg-card p-4"><h2 className="mb-3 font-semibold">Upcoming appointment</h2>{d.upcoming ? <div className="text-sm"><p className="font-medium">{d.upcoming.reason}</p><p className="text-muted-foreground">{formatDate(d.upcoming.date, { weekday: "long", day: "numeric", month: "long" })} · {formatTime(d.upcoming.time)}</p><StatusBadge status={d.upcoming.status} className="mt-2" /></div> : <p className="text-sm text-muted-foreground">None scheduled.</p>}</section>
          <section className="rounded-xl border bg-card p-4 lg:col-span-2"><h2 className="mb-3 font-semibold">Active treatments</h2>{d.treatments.filter((t) => t.status === "in_progress" || t.status === "planned").length ? <div className="grid gap-6 md:grid-cols-2">{d.treatments.filter((t) => t.status === "in_progress" || t.status === "planned").map((t) => <div key={t.id}><p className="mb-3 font-medium">{t.treatment} <span className="text-sm font-normal text-muted-foreground">· tooth {t.tooth}</span></p><TreatmentTimeline steps={t.steps} compact /></div>)}</div> : <p className="text-sm text-muted-foreground">No active treatments.</p>}</section>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          {events.length ? (
            <ol className="space-y-0 rounded-xl border bg-card p-5">
              {events.map((e, i) => (
                <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < events.length - 1 && <span className="absolute top-3 left-[5px] h-full w-px bg-border" aria-hidden />}
                  <span className="relative mt-1.5 size-3 shrink-0 rounded-full bg-primary" aria-hidden />
                  <div><p className="text-xs text-muted-foreground">{formatDate(e.date, { day: "numeric", month: "short", year: "numeric" })} · {e.sub}</p><p className="font-medium">{e.title}</p></div>
                </li>
              ))}
            </ol>
          ) : <EmptyState icon={ClipboardPlus} title="No history yet" />}
        </TabsContent>

        <TabsContent value="treatments" className="mt-4 space-y-4">
          {d.treatments.length ? d.treatments.map((t) => (
            <section key={t.id} className="rounded-xl border bg-card p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <div><h2 className="font-semibold">{t.treatment}</h2><p className="text-sm text-muted-foreground">Tooth {t.tooth} · {formatCurrency(t.cost)}{t.warrantyMonths ? ` · ${t.warrantyMonths}-month warranty` : ""}</p></div>
                <StatusBadge status={t.status} />
              </div>
              <TreatmentTimeline steps={t.steps} />
              {t.notes && <p className="mt-4 rounded-lg bg-muted/60 p-3 text-sm">{t.notes}</p>}
              {(t.status === "in_progress" || t.status === "planned") && <div className="mt-4"><AdvanceTreatmentButton id={t.id} hasCurrent={t.steps.some((s) => s.status === "current")} /></div>}
            </section>
          )) : <EmptyState icon={ClipboardPlus} title="No treatments yet" description="Create a treatment plan to track progress." />}
        </TabsContent>

        {(["xrays", "documents"] as const).map((tab) => {
          const list = d.records.filter((r) => (tab === "xrays" ? ["xray", "photo"] : ["document", "prescription", "treatment", "diagnosis_note", "invoice"]).includes(r.recordType));
          return (
            <TabsContent key={tab} value={tab} className="mt-4">
              {list.length ? <ul className="divide-y rounded-xl border bg-card">{list.map((r) => { const m = RECORD_META[r.recordType]; return <li key={r.id} className="flex items-center gap-3 p-4"><m.icon className="size-5 text-primary" aria-hidden /><div className="min-w-0 flex-1"><p className="font-medium">{r.title}</p><p className="truncate text-sm text-muted-foreground">{m.label} · {r.doctor} · {r.description}</p></div><span className="text-sm text-muted-foreground">{formatDate(r.date, { day: "numeric", month: "short" })}</span></li>; })}</ul> : <EmptyState icon={FilePlus2} title="Nothing uploaded yet" />}
            </TabsContent>
          );
        })}

        <TabsContent value="billing" className="mt-4">
          {d.bills.length ? <ul className="divide-y rounded-xl border bg-card">{d.bills.map((b) => <li key={b.id} className="flex items-center gap-4 p-4 text-sm"><span className="font-medium">{b.invoiceNumber}</span><span className="flex-1 text-muted-foreground">{formatDate(b.date)} · {b.items.map((i) => i.description).join(", ")}</span><span className="font-medium tabular-nums">{formatCurrency(b.total)}</span><StatusBadge status={b.status} /></li>)}</ul> : <EmptyState icon={FilePlus2} title="No invoices" />}
        </TabsContent>

        <TabsContent value="messages" className="mt-4"><MessageThread patientId={p.id} patientName={p.name} messages={d.messages} /></TabsContent>
      </Tabs>
    </div>
  );
}
