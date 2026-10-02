import type { Metadata } from "next";
import { AlertCircle, Clock, IndianRupee, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { BillingTable, NewInvoiceDialog } from "@/components/clinic/billing-table";
import { MetricCard } from "@/components/clinic/metric-card";
import { getClinicForUser, listBills, listPatients } from "@/lib/server/services/clinic-service";
import { requireUser } from "@/lib/server/session";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  const user = await requireUser("/clinic/billing");
  const clinic = await getClinicForUser(user);
  const [{ bills, metrics }, patients] = await Promise.all([listBills(clinic.id), listPatients(clinic.id)]);
  return (
    <div className="space-y-6">
      <PageHeader title="Billing" description="Invoices and payments." actions={<NewInvoiceDialog patients={patients.map((p) => ({ id: p.id, name: p.name }))} trigger={<Button><Plus />New invoice</Button>} />} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Revenue today" value={formatCurrency(metrics.revenueToday)} icon={IndianRupee} />
        <MetricCard label="Revenue this month" value={formatCurrency(metrics.revenueMonth)} icon={TrendingUp} />
        <MetricCard label="Outstanding" value={formatCurrency(metrics.outstanding)} icon={Clock} />
        <MetricCard label="Overdue invoices" value={metrics.overdue} icon={AlertCircle} tone={metrics.overdue ? "warning" : undefined} />
      </div>
      <BillingTable bills={bills} />
    </div>
  );
}
