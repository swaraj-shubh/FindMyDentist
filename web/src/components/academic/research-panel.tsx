"use client";

import { useEffect, useState } from "react";
import { ExternalLink, FileSearch, Plus, Check, Table2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { NativeSelect } from "@/components/shared/native-select";
import { LoadingCards } from "@/components/shared/loading-state";
import { api } from "@/lib/api-client";
import { SPECIALTY_NAMES } from "@/lib/config/specialties";
import { cn } from "@/lib/utils";
import type { Paper } from "@/types/academic";

type Result = Paper & { relevance: number };

export function ResearchPanel({ projects, initialQuery = "" }: { projects: { id: string; title: string; paperIds: string[] }[]; initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);
  const [specialty, setSpecialty] = useState("");
  const [evidence, setEvidence] = useState("");
  const [from, setFrom] = useState("");
  const [rows, setRows] = useState<Result[] | null>(null);
  const [view, setView] = useState<"cards" | "table">("cards");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [added, setAdded] = useState<Record<string, string[]>>(() => Object.fromEntries(projects.map((p) => [p.id, p.paperIds])));

  useEffect(() => {
    const t = setTimeout(async () => {
      const p = new URLSearchParams({ q, specialty, evidence, from });
      for (const [k, v] of [...p]) if (!v) p.delete(k);
      setRows(await api<Result[]>(`/api/v1/academic/research?${p}`).catch(() => []));
    }, 250);
    return () => clearTimeout(t);
  }, [q, specialty, evidence, from]);

  async function add(paper: Result) {
    if (!projectId) return toast("Create a project first");
    try {
      await api("/api/v1/academic/projects", { method: "PATCH", body: { id: projectId, addPaperId: paper.id } });
      setAdded((a) => ({ ...a, [projectId]: [...(a[projectId] ?? []), paper.id] }));
      toast.success("Added to project", { description: projects.find((p) => p.id === projectId)?.title });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }
  const has = (id: string) => (added[projectId] ?? []).includes(id);

  return (
    <div className="space-y-5">
      <div className="grid gap-2 md:grid-cols-[1fr_auto_auto_auto]">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. residual ridge resorption, osseointegration, RANKL" aria-label="Search topic" className="h-11 bg-card" />
        <NativeSelect value={specialty} onChange={(e) => setSpecialty(e.target.value)} aria-label="Specialty" className="h-11"><option value="">All specialties</option>{SPECIALTY_NAMES.map((s) => <option key={s}>{s}</option>)}</NativeSelect>
        <NativeSelect value={evidence} onChange={(e) => setEvidence(e.target.value)} aria-label="Evidence type"><option value="">All evidence</option><option value="review">Reviews</option><option value="landmark">Landmark</option><option value="clinical">Clinical studies</option><option value="basic">Basic science</option><option value="position">Guidelines</option></NativeSelect>
        <NativeSelect value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Published since"><option value="">Any year</option><option value="2000">Since 2000</option><option value="2010">Since 2010</option><option value="2015">Since 2015</option></NativeSelect>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">{rows ? `${rows.length} relevant sources` : "Searching…"}</p>
        <div className="flex items-center gap-2">
          {projects.length > 0 && <label className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">Add to</span><NativeSelect value={projectId} onChange={(e) => setProjectId(e.target.value)} aria-label="Target project">{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</NativeSelect></label>}
          <Button variant="outline" size="sm" onClick={() => setView(view === "cards" ? "table" : "cards")}><Table2 />{view === "cards" ? "Evidence table" : "Cards"}</Button>
        </div>
      </div>
      {rows === null ? <LoadingCards count={4} className="grid gap-4 md:grid-cols-2" /> : rows.length === 0 ? <EmptyState icon={FileSearch} title="No sources match" description="Try broader keywords or remove a filter." /> : view === "table" ? (
        <div className="overflow-x-auto rounded-xl border bg-card"><table className="w-full text-sm"><thead className="border-b bg-muted/50 text-left"><tr>{["Study", "Year", "Design", "Specialty", "Key finding"].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr></thead><tbody className="divide-y">{rows.map((p) => <tr key={p.id}><td className="max-w-56 px-3 py-2 font-medium">{p.authors.split(",")[0]} et al.</td><td className="px-3 py-2 tabular-nums">{p.year}</td><td className="px-3 py-2">{p.evidenceType}</td><td className="px-3 py-2">{p.specialty}</td><td className="max-w-md px-3 py-2 text-muted-foreground">{p.abstract}</td></tr>)}</tbody></table></div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {rows.map((p) => (
            <li key={p.id} className="flex flex-col rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between gap-2 text-xs"><span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">{p.evidenceType}</span><span className="text-muted-foreground">{p.year} · relevance <strong className={cn(p.relevance > 0.6 && "text-success")}>{Math.round(p.relevance * 100)}%</strong></span></div>
              <h3 className="mt-3 font-semibold leading-snug">{p.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{p.authors} · {p.journal}</p>
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{p.abstract}</p>
              <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                {p.doi ? <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">View source <ExternalLink className="size-3.5" aria-hidden /></a> : <span className="text-xs text-muted-foreground">Metadata only · DOI pending</span>}
                <Button size="sm" variant={has(p.id) ? "secondary" : "default"} disabled={has(p.id) || !projectId} onClick={() => add(p)}>{has(p.id) ? <><Check />Added</> : <><Plus />Add to project</>}</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">Prototype library of landmark papers. Production retrieval uses PubMed/Crossref metadata under publisher licences — full text is never reproduced without rights.</p>
    </div>
  );
}
