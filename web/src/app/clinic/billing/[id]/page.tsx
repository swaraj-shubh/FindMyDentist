import { notFound, redirect } from "next/navigation";
import { getClinicForUser, listBills } from "@/lib/server/services/clinic-service";
import { requireUser } from "@/lib/server/session";

// Invoices open in a drawer on the billing list; this route exists so invoice links are shareable.
export default async function InvoiceRedirect({ params }: PageProps<"/clinic/billing/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/clinic/billing/${id}`);
  const { bills } = await listBills((await getClinicForUser(user)).id);
  const bill = bills.find((b) => b.id === id || b.invoiceNumber === id);
  if (!bill) notFound();
  redirect(`/clinic/patients/${bill.patientId}`);
}
