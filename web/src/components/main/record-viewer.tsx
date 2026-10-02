import { FileText, ImageIcon, Pill, Receipt, Stethoscope, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DentalRecord, RecordType } from "@/types/record";

export const RECORD_META: Record<RecordType, { label: string; icon: LucideIcon }> = {
  xray: { label: "X-ray", icon: ImageIcon },
  photo: { label: "Photo", icon: ImageIcon },
  prescription: { label: "Prescription", icon: Pill },
  treatment: { label: "Treatment", icon: Stethoscope },
  diagnosis_note: { label: "Clinical note", icon: FileText },
  document: { label: "Document", icon: FileText },
  invoice: { label: "Invoice", icon: Receipt },
};

/** Placeholder radiograph — the prototype never stores real images. */
function XrayArt() {
  return (
    <svg viewBox="0 0 400 220" className="size-full" aria-hidden>
      <defs>
        <radialGradient id="xr" cx="50%" cy="50%" r="70%">
          <stop offset="0" stopColor="#2a2f33" />
          <stop offset="1" stopColor="#0b0d0f" />
        </radialGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="2.2" /></filter>
      </defs>
      <rect width="400" height="220" fill="url(#xr)" />
      <g filter="url(#blur)" fill="#d8dde2" fillOpacity="0.78">
        {[40, 105, 170, 235, 300].map((x, i) => (
          <g key={x} transform={`translate(${x} 30)`}>
            <path d={`M8 0 h44 c6 0 10 6 10 14 v40 c0 8 -4 12 -10 12 h-44 c-6 0 -10 -4 -10 -12 v-40 c0 -8 4 -14 10 -14z`} />
            <path d={`M14 64 l6 ${90 + i * 6} h6 l4 -${80 + i * 4} l4 ${82 + i * 5} h6 l6 -${92 + i * 6}z`} fillOpacity="0.55" />
          </g>
        ))}
      </g>
      <circle cx="122" cy="52" r="10" fill="#0b0d0f" fillOpacity="0.6" filter="url(#blur)" />
      <text x="390" y="210" textAnchor="end" fontSize="10" fill="#9aa3ab" fontFamily="monospace">FMD · DEMO IMAGE</text>
    </svg>
  );
}

export function RecordViewer({ record, className }: { record: DentalRecord; className?: string }) {
  const meta = RECORD_META[record.recordType];
  if (record.recordType === "xray")
    return <div className={cn("overflow-hidden rounded-2xl bg-black", className)}><XrayArt /></div>;
  if (record.recordType === "photo")
    return (
      <div className={cn("flex aspect-video items-center justify-center rounded-2xl bg-[linear-gradient(135deg,oklch(0.85_0.06_20),oklch(0.75_0.08_10))] text-white", className)}>
        <ImageIcon className="size-10 opacity-80" aria-hidden />
        <span className="sr-only">Intraoral photograph placeholder</span>
      </div>
    );
  return (
    <div className={cn("rounded-2xl border bg-card p-6", className)}>
      <div className="flex items-center gap-2 border-b pb-4 text-sm text-muted-foreground">
        <meta.icon className="size-4" aria-hidden />
        {meta.label} · {record.clinic}
      </div>
      <p className="pt-4 leading-relaxed whitespace-pre-line">{record.description}</p>
      <p className="mt-6 text-sm text-muted-foreground">— {record.doctor}</p>
    </div>
  );
}
