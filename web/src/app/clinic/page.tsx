import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Clock, IndianRupee, Plus, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ScheduleList } from "@/components/clinic/appointment-row";
import { MetricCard } from "@/components/clinic/metric-card";
import { NewAppointmentDialog, NewPatientDialog } from "@/components/clinic/clinic-dialogs";
import { dentistsRepo } from "@/lib/server/repositories/dentists";
import { getClinicForUser, getDashboard, listPatients } from "@/lib/server/services/clinic-service";
import { requireUser } from "@/lib/server/session";
import { firstName, formatCurrency, formatDate, formatTime, greeting, toISODate } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function ClinicDashboard() {
  const user = await requireUser("/clinic");
  const clinic = await getClinicForUser(user);
  const [{ schedule, metrics, upcoming }, patients, dentists] = await Promise.all([
    getDashboard(clinic.id),
    listPatients(clinic.id),
    dentistsRepo.where((d) => d.clinicId === clinic.id),
  ]);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={formatDate(toISODate(), { weekday: "long", day: "numeric", month: "long" })}
        title={`${greeting()}, ${user.role === "dentist" ? "Dr. " : ""}${firstName(user.name).replace(/^Dr\.?$/, "")}`}
        actions={
          <>
            <NewPatientDialog trigger={<Button variant="outline"><UserPlus />Add patient</Button>} />
            <NewAppointmentDialog patients={patients.map((p) => ({ id: p.id, name: p.name }))} dentists={dentists.map((d) => ({ id: d.id, name: d.name }))} trigger={<Button><Plus />New appointment</Button>} />
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Today's appointments" value={metrics.appointments} icon={CalendarCheck} href="/clinic/appointments" />
        <MetricCard label="Patients today" value={metrics.patients} icon={Users} href="/clinic/patients" />
        <MetricCard label="Pending confirmations" value={metrics.pending} icon={Clock} tone={metrics.pending ? "warning" : undefined} hint={metrics.pending ? "Needs action" : "All confirmed"} />
        <MetricCard label="Today's revenue" value={formatCurrency(metrics.revenue)} icon={IndianRupee} hint={`${formatCurrency(metrics.outstanding)} outstanding`} href="/clinic/billing" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <section className="overflow-hidden rounded-xl border bg-card" aria-labelledby="sched">
          <h2 id="sched" className="border-b px-4 py-3 font-semibold">Today's schedule</h2>
          {schedule.length ? <ScheduleList items={schedule} /> : <EmptyState icon={CalendarCheck} title="Your schedule is clear" description="No appointments today." className="m-4 border-none" />}
        </section>
        <section className="rounded-xl border bg-card" aria-labelledby="soon">
          <h2 id="soon" className="border-b px-4 py-3 font-semibold">Needs confirmation</h2>
          {upcoming.length ? (
            <ul className="divide-y">
              {upcoming.map((a) => (
                <li key={a.id}><Link href="/clinic/appointments" className="block px-4 py-3 text-sm hover:bg-muted/50"><span className="font-medium">{a.patient?.name}</span><span className="block text-muted-foreground">{formatDate(a.date, { weekday: "short", day: "numeric", month: "short" })} · {formatTime(a.time)} · {a.reason}</span></Link></li>
              ))}
            </ul>
          ) : <p className="p-4 text-sm text-muted-foreground">Nothing waiting.</p>}
        </section>
      </div>
    </div>
  );
}
