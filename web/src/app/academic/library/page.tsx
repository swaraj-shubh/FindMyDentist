import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { CitationList } from "@/components/academic/citation-list";
import { papersRepo } from "@/lib/server/repositories/academic";
import { listProjects, listSources } from "@/lib/server/services/academic-service";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Library" };

export default async function LibraryPage() {
  const user = await requireUser("/academic/library");
  const [projects, sources, papers] = await Promise.all([listProjects(user.id), listSources(), papersRepo.all()]);
  const saved = new Set(projects.flatMap((p) => p.paperIds));
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-8">
      <PageHeader title="Library" description="Saved sources and the knowledge base FMD Academic draws from." />
      <section aria-labelledby="saved"><h2 id="saved" className="mb-3 text-lg font-semibold">Saved to your projects ({saved.size})</h2><div className="rounded-2xl border bg-card p-5"><CitationList papers={papers.filter((p) => saved.has(p.id))} empty="Add sources from the Research workspace." /></div></section>
      <section aria-labelledby="kb">
        <h2 id="kb" className="mb-1 text-lg font-semibold">Knowledge sources</h2>
        <p className="mb-3 text-sm text-muted-foreground">Specialty → Subject → Topic → Source → Evidence type → Date. Only metadata is held for licensed works.</p>
        <div className="overflow-x-auto rounded-2xl border bg-card"><table className="w-full text-sm"><thead className="border-b bg-muted/50 text-left"><tr>{["Source", "Type", "Specialty", "Year", "Licence"].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr></thead><tbody className="divide-y">{sources.map((s) => <tr key={s.id}><td className="px-4 py-2.5 font-medium">{s.title}<span className="block text-xs font-normal text-muted-foreground">{s.publisher}</span></td><td className="px-4 py-2.5 capitalize">{s.sourceType.replace("_", " ")}</td><td className="px-4 py-2.5">{s.specialty}</td><td className="px-4 py-2.5 tabular-nums">{s.year}</td><td className="px-4 py-2.5">{s.licenseStatus}</td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
