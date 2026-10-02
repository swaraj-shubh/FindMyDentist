"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Download, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NativeSelect } from "@/components/shared/native-select";
import { StatusBadge } from "@/components/shared/status-badge";
import { api } from "@/lib/api-client";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { BillRow } from "@/lib/server/services/clinic-service";

export function BillingTable({ bills }: { bills: BillRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<BillRow | null>(null);
  const [method, setMethod] = useState("UPI");
  const [busy, setBusy] = useState(false);
  const rows = bills.filter((b) => !filter || b.status === filter);
  const current = selected && (bills.find((b) => b.id === selected.id) ?? selected);

  async function markPaid() {
    if (!current) return;
    setBusy(true);
    try {
      await api("/api/v1/clinic/billing", { method: "PATCH", body: { id: current.id, status: "paid", paymentMethod: method } });
      toast.success(`${current.invoiceNumber} marked as paid`);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="mb-3 flex gap-2 overflow-x-auto" role="tablist">
        {[["", "All"], ["pending", "Pending"], ["overdue", "Overdue"], ["paid", "Paid"]].map(([v, l]) => (
          <button key={v} role="tab" aria-selected={filter === v} onClick={() => setFilter(v)} className={cn("h-8 shrink-0 rounded-full border px-3 text-sm font-medium", filter === v ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-secondary")}>{l}</button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Patient</TableHead><TableHead className="hidden sm:table-cell">Date</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.slice(0, 60).map((b) => (
              <TableRow key={b.id} onClick={() => setSelected(b)} className="cursor-pointer">
                <TableCell className="font-medium"><button className="hover:underline" onClick={() => setSelected(b)}>{b.invoiceNumber}</button></TableCell>
                <TableCell>{b.patientName}</TableCell>
                <TableCell className="hidden sm:table-cell">{formatDate(b.date, { day: "numeric", month: "short" })}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(b.total)}</TableCell>
                <TableCell><StatusBadge status={b.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {rows.length > 60 && <p className="mt-2 text-xs text-muted-foreground">Showing the 60 most recent of {rows.length}.</p>}

      <Sheet open={!!current} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {current && (
            <>
              <SheetHeader className="border-b"><SheetTitle>{current.invoiceNumber}</SheetTitle><SheetDescription>{current.patientName} · {formatDate(current.date)}</SheetDescription></SheetHeader>
              <div className="flex-1 space-y-4 overflow-y-auto px-4">
                <StatusBadge status={current.status} />
                <Table>
                  <TableHeader><TableRow><TableHead>Treatment</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Price</TableHead></TableRow></TableHeader>
                  <TableBody>{current.items.map((i, k) => <TableRow key={k}><TableCell>{i.description}</TableCell><TableCell className="text-right">{i.qty}</TableCell><TableCell className="text-right tabular-nums">{formatCurrency(i.price * i.qty)}</TableCell></TableRow>)}</TableBody>
                </Table>
                <dl className="space-y-1 border-t pt-3 text-sm">
                  <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular-nums">{formatCurrency(current.subtotal)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Discount</dt><dd className="tabular-nums">− {formatCurrency(current.discount)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Tax</dt><dd className="tabular-nums">{formatCurrency(current.tax)}</dd></div>
                  <div className="flex justify-between border-t pt-2 text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatCurrency(current.total)}</dd></div>
                </dl>
                {current.status === "paid" && <p className="text-sm text-muted-foreground">Paid by {current.paymentMethod} on {formatDate(current.paidAt)}</p>}
                <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">Treatment fees stay with the clinic. FMD takes no commission on treatment payments.</p>
              </div>
              <div className="grid gap-2 border-t p-4">
                {current.status !== "paid" && (
                  <div className="flex gap-2">
                    <NativeSelect value={method} onChange={(e) => setMethod(e.target.value)} aria-label="Payment method" className="flex-1">{["UPI", "Card", "Cash", "Bank transfer"].map((m) => <option key={m}>{m}</option>)}</NativeSelect>
                    <Button onClick={markPaid} disabled={busy}>{busy && <Loader2 className="animate-spin" />}Mark paid</Button>
                  </div>
                )}
                <Button variant="outline" onClick={() => window.print()}><Download />Download / print</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

export function NewInvoiceDialog({ patients, trigger }: { patients: { id: string; name: string }[]; trigger: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([{ description: "", qty: 1, price: 0 }]);
  const [discount, setDiscount] = useState(0);
  const [busy, setBusy] = useState(false);
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const set = (k: number, patch: Partial<(typeof items)[number]>) => setItems((x) => x.map((it, i) => (i === k ? { ...it, ...patch } : it)));

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const patientId = String(new FormData(e.currentTarget).get("patientId") ?? "");
    setBusy(true);
    try {
      await api("/api/v1/clinic/billing", { body: { patientId, items: items.filter((i) => i.description.trim()), discount, tax: 0 } });
      toast.success("Invoice created");
      setOpen(false);
      setItems([{ description: "", qty: 1, price: 0 }]);
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader><DialogTitle>New invoice</DialogTitle><DialogDescription>Created as pending until marked paid.</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1"><Label htmlFor="ni-p">Patient</Label><NativeSelect id="ni-p" name="patientId" defaultValue="" className="w-full" required><option value="" disabled>Choose patient</option>{patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</NativeSelect></div>
          <div className="space-y-2">
            {items.map((it, k) => (
              <div key={k} className="grid grid-cols-[1fr_60px_100px_auto] gap-2">
                <Input aria-label="Description" placeholder="Treatment" value={it.description} onChange={(e) => set(k, { description: e.target.value })} />
                <Input aria-label="Quantity" type="number" min={1} value={it.qty} onChange={(e) => set(k, { qty: Math.max(1, Number(e.target.value)) })} />
                <Input aria-label="Price" type="number" min={0} value={it.price} onChange={(e) => set(k, { price: Math.max(0, Number(e.target.value)) })} />
                <Button type="button" variant="ghost" size="icon" aria-label="Remove line" disabled={items.length === 1} onClick={() => setItems((x) => x.filter((_, i) => i !== k))}><Trash2 /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setItems((x) => [...x, { description: "", qty: 1, price: 0 }])}><Plus />Add line</Button>
          </div>
          <div className="flex items-end justify-between border-t pt-3">
            <div className="w-32 space-y-1"><Label htmlFor="ni-d">Discount (₹)</Label><Input id="ni-d" type="number" min={0} value={discount} onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))} /></div>
            <p className="text-right"><span className="text-sm text-muted-foreground">Total</span><span className="block text-xl font-semibold tabular-nums">{formatCurrency(Math.max(0, subtotal - discount))}</span></p>
          </div>
          <Button type="submit" className="w-full" disabled={busy || subtotal <= 0}>{busy && <Loader2 className="animate-spin" />}Create invoice</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
