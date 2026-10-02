import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { PrintButton } from "@/components/shared/print-button";
import { NativeSelect } from "@/components/shared/native-select";
import { getSlides, papersRepo } from "@/lib/server/repositories/academic";
import { listProjects } from "@/lib/server/services/academic-service";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Posters" };

export default async function PostersPage({ searchParams }: PageProps<"/academic/posters">) {
  const sp = await searchParams;
  const user = await requireUser("/academic/posters");
  const projects = (await listProjects(user.id)).filter((p) => p.status === "generated");
  const project = projects.find((p) => p.id === sp.project) ?? projects[0];
  if (!project)
    return <div className="mx-auto max-w-2xl p-8 text-center"><p className="text-muted-foreground">Generate a presentation first — posters are built from your slides.</p><Button asChild className="mt-4"><Link href="/academic/studio/new">Create seminar</Link></Button></div>;
  const slides = await getSlides(project.id);
  const papers = await papersRepo.all();
  const content = slides.filter((s) => !["title", "section", "references"].includes(s.slideType));
  const pick = (re: RegExp) => content.find((s) => re.test(s.title)) ?? content[0];
  const blocks = [
    ["Introduction", pick(/^why|introduction|overview/i)],
    ["Background", pick(/total|physiology|basic|definition/i)],
    ["Key mechanisms", pick(/regulation|axis|mechanism|cycle/i)],
    ["Clinical relevance", pick(/implication|management|ridge|osseointegration/i)],
    ["Evidence", pick(/recent|debates|evidence/i)],
    ["Conclusion", slides.find((s) => s.slideType === "summary") ?? content.at(-1)],
  ] as const;
  const refs = [...new Set(slides.flatMap((s) => s.citations))].slice(0, 6).map((id) => papers.find((p) => p.id === id)).filter(Boolean);
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
      <PageHeader title="Poster Studio" description="A one-page academic poster drafted from your presentation." actions={<><form className="no-print"><NativeSelect name="project" defaultValue={project.id} aria-label="Project">{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</NativeSelect><Button type="submit" variant="outline" className="ml-2">Load</Button></form><PrintButton label="Print / save PDF" /></>} />
      <article className="rounded-2xl border bg-card p-8 shadow-sm">
        <header className="border-b-4 border-product-academic pb-5"><h2 className="text-3xl font-semibold tracking-tight">{project.title}</h2><p className="mt-1 text-muted-foreground">{user.name} · {project.level} {project.specialty} · FMD Academic</p></header>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {blocks.map(([label, s]) => (
            <section key={label} className="rounded-xl bg-muted/50 p-4">
              <h3 className="text-xs font-semibold tracking-widest text-product-academic uppercase">{label}</h3>
              {s && <><p className="mt-1 font-medium">{s.title}</p><ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">{s.keyPoints.slice(0, 3).map((k) => <li key={k}>{k}</li>)}</ul></>}
            </section>
          ))}
        </div>
        <footer className="mt-6 border-t pt-4 text-xs text-muted-foreground"><p className="mb-1 font-medium text-foreground">References</p><ol className="list-inside list-decimal space-y-0.5">{refs.map((p) => <li key={p!.id}>{p!.citation}</li>)}</ol></footer>
      </article>
    </div>
  );
}
