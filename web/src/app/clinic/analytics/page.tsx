import type { Metadata } from "next";
import Link from "next/link";
import { Activity, CalendarCheck, IndianRupee, UserX } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { BarChart, HorizontalBars } from "@/components/clinic/analytics-charts";
import { MetricCard } from "@/components/clinic/metric-card";
import { getAnalytics, getClinicForUser } from "@/lib/server/services/clinic-service";
import { requireUser } from "@/lib/server/session";
import { cn, formatCompact, formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics" };

const LABEL: Record<string, string> = { completed: "Completed", confirmed: "Confirmed", scheduled: "Awaiting confirmation", no_show: "No-show", cancelled: "Cancelled" };

export default async function AnalyticsPage({ searchParams }: PageProps<"/clinic/analytics">) {
  const sp = await searchParams;
  const days = [7, 30, 90].includes(Number(sp.days)) ? Number(sp.days) : 30;
  const user = await requireUser("/clinic/analytics");
  const clinic = await getClinicForUser(user);
  const a = await getAnalytics(clinic.id, days);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Clinic performance and operational metrics."
        actions={
          <nav className="inline-flex rounded-lg border bg-muted p-0.5" aria-label="Range">
            {[7, 30, 90].map((d) => <Link key={d} href={`/clinic/analytics?days=${d}`} aria-current={d === days ? "page" : undefined} className={cn("rounded-md px-3 py-1 text-sm font-medium", d === days && "bg-card shadow-sm")}>{d}d</Link>)}
          </nav>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Revenue" value={formatCurrency(a.totals.revenue)} icon={IndianRupee} hint={`Last ${days} days`} />
        <MetricCard label="Appointments" value={a.totals.appointments} icon={CalendarCheck} />
        <MetricCard label="No-show rate" value={`${Math.round(a.totals.noShowRate * 100)}%`} icon={UserX} tone={a.totals.noShowRate > 0.1 ? "warning" : undefined} />
        <MetricCard label="Active treatments" value={a.totals.activeTreatments} icon={Activity} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5"><h2 className="mb-4 font-semibold">Daily revenue</h2><BarChart data={a.daily.map((d) => ({ key: d.date, value: d.revenue }))} label="Daily revenue" format={(n) => `₹${formatCompact(n)}`} /></section>
        <section className="rounded-xl border bg-card p-5"><h2 className="mb-4 font-semibold">Daily appointments</h2><BarChart data={a.daily.map((d) => ({ key: d.date, value: d.appointments }))} label="Daily appointments" /></section>
        <section className="rounded-xl border bg-card p-5"><h2 className="mb-4 font-semibold">Appointment outcomes</h2><HorizontalBars rows={a.statusCounts.map((s) => ({ label: LABEL[s.status], value: s.count }))} /></section>
        <section className="rounded-xl border bg-card p-5"><h2 className="mb-4 font-semibold">Completed visits by doctor</h2><HorizontalBars rows={a.byDentist.map((d) => ({ label: d.name, value: d.appointments }))} /></section>
      </div>
    </div>
  );
}
