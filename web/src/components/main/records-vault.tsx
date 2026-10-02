"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FolderOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { cn, formatDate } from "@/lib/utils";
import type { DentalRecord } from "@/types/record";
import { RECORD_META } from "./record-viewer";

const TABS = [
  { id: "all", label: "All", types: null },
  { id: "treatment", label: "Treatment history", types: ["treatment", "diagnosis_note"] },
  { id: "xray", label: "X-rays & photos", types: ["xray", "photo"] },
  { id: "prescription", label: "Prescriptions", types: ["prescription"] },
  { id: "document", label: "Documents", types: ["document", "invoice"] },
] as const;

export function RecordsVault({ records }: { records: DentalRecord[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const t = TABS.find((x) => x.id === tab)!;
    const term = q.toLowerCase();
    return records.filter((r) => (!t.types || (t.types as readonly string[]).includes(r.recordType)) && (!term || `${r.title} ${r.doctor} ${r.clinic} ${r.description}`.toLowerCase().includes(term)));
  }, [records, tab, q]);

  return (
    <div className="space-y-4">
      <label className="relative block">
        <span className="sr-only">Search records</span>
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search records" className="h-10 rounded-xl bg-card pl-9" />
      </label>
      <div className="scrollbar-none flex gap-2 overflow-x-auto" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={cn("h-8 shrink-0 rounded-full border px-3 text-sm font-medium", tab === t.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-secondary")}>
            {t.label}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No records here yet" description="Records your clinics share with you will appear here automatically." />
      ) : (
        <ul className="divide-y rounded-2xl border bg-card">
          {shown.map((r) => {
            const meta = RECORD_META[r.recordType];
            return (
              <li key={r.id}>
                <Link href={`/records/${r.id}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><meta.icon className="size-5" aria-hidden /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{r.title}</span>
                    <span className="block truncate text-sm text-muted-foreground">{meta.label} · {r.doctor} · {r.clinic}</span>
                  </span>
                  <span className="shrink-0 text-sm text-muted-foreground">{formatDate(r.date, { day: "numeric", month: "short", year: "numeric" })}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
