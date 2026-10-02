import { ShieldCheck } from "lucide-react";
import { addDays, formatDate, toISODate } from "@/lib/utils";

/** Digital warranty (blueprint §3) — certificate of a completed treatment with its coverage window. */
export function WarrantyCard({ treatment, tooth, completed, months, clinic, dentist }: { treatment: string; tooth: string; completed: string; months: number; clinic: string; dentist: string }) {
  const expires = addDays(completed, Math.round(months * 30.44));
  const active = expires >= toISODate();
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-[linear-gradient(135deg,var(--card),var(--secondary))] p-5">
      <ShieldCheck className="absolute -right-3 -bottom-3 size-24 text-primary/10" aria-hidden />
      <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase"><ShieldCheck className="size-4" aria-hidden />Digital warranty</p>
      <p className="mt-2 font-semibold">{treatment}{tooth && ` · ${tooth}`}</p>
      <p className="text-sm text-muted-foreground">{dentist} · {clinic}</p>
      <p className="mt-3 text-sm">
        {months} months · {active ? <>valid until <strong>{formatDate(expires)}</strong></> : <>expired {formatDate(expires)}</>}
      </p>
    </div>
  );
}
