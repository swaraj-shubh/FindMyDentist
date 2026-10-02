import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Case presentations" };

const STRUCTURE = [
  ["Chief complaint & history", "Presenting problem, medical & dental history, habits"],
  ["Clinical examination", "Extra-oral, intra-oral, periodontal and occlusal findings"],
  ["Investigations", "Radiographs, scans, models, lab values"],
  ["Diagnosis & differentials", "Final diagnosis, differentials and the reasoning"],
  ["Treatment options", "Alternatives with pros, cons and evidence"],
  ["Treatment sequence", "Phase-wise plan with clinical photographs"],
  ["Outcome & follow-up", "Results, complications, recall findings"],
  ["Discussion & learning points", "Evidence, what went well, what to do differently"],
];

export default function CasesPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-8">
      <PageHeader title="Case Presentation" description="A structured clinical case deck — the format examiners expect." actions={<Button asChild><Link href="/academic/studio/new?kind=case">Start a case deck</Link></Button>} />
      <ol className="grid gap-3 sm:grid-cols-2">
        {STRUCTURE.map(([t, d], i) => (
          <li key={t} className="flex gap-4 rounded-2xl border bg-card p-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">{i + 1}</span>
            <span><span className="block font-medium">{t}</span><span className="text-sm text-muted-foreground">{d}</span></span>
          </li>
        ))}
      </ol>
      <p className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">Use anonymised cases only — remove names, faces and identifiers before adding clinical photographs.</p>
    </div>
  );
}
