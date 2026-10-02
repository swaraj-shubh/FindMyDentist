import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MessageCircleQuestion, Mic, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { papersRepo } from "@/lib/server/repositories/academic";
import { appraisePaper } from "@/lib/server/services/academic-engine";
import { requireUser } from "@/lib/server/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Journal Club" };

export default async function JournalClub({ searchParams }: PageProps<"/academic/journal-club">) {
  const sp = await searchParams;
  const user = await requireUser("/academic/journal-club");
  const papers = (await papersRepo.all()).sort((a, b) => b.year - a.year);
  const paper = papers.find((p) => p.id === sp.paper) ?? papers[0];
  const a = appraisePaper(paper, user.specialty || "Prosthodontics");
  const list = (items: string[], icon: React.ReactNode) => <ul className="mt-3 space-y-2 text-sm">{items.map((x) => <li key={x} className="flex gap-2">{icon}{x}</li>)}</ul>;
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
      <PageHeader title="Journal Club" description="Paper summary, critical appraisal, discussion points and viva questions." actions={<Button asChild><Link href={`/academic/studio/new?kind=journal_club&topic=${encodeURIComponent(paper.title.slice(0, 100))}`}>Create journal club deck</Link></Button>} />
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <nav aria-label="Papers" className="max-h-[70dvh] space-y-1.5 overflow-y-auto">
          {papers.map((p) => (
            <Link key={p.id} href={`/academic/journal-club?paper=${p.id}`} aria-current={p.id === paper.id ? "true" : undefined} className={cn("block rounded-xl border bg-card p-3 text-sm hover:bg-muted/50", p.id === paper.id && "border-product-academic bg-secondary/50")}>
              <span className="line-clamp-2 font-medium">{p.title}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{p.authors.split(",")[0]} et al. · {p.year}</span>
            </Link>
          ))}
        </nav>
        <article className="space-y-4">
          <header className="rounded-2xl border bg-card p-6">
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">{a.design}</span>
            <h2 className="mt-3 text-xl font-semibold leading-snug">{paper.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{paper.authors} · {paper.journal} · {paper.year}</p>
            <p className="mt-4 leading-relaxed">{a.summary}</p>
          </header>
          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-2xl border bg-card p-5"><h3 className="font-semibold">Strengths</h3>{list(a.strengths, <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />)}</section>
            <section className="rounded-2xl border bg-card p-5"><h3 className="font-semibold">Limitations</h3>{list(a.limitations, <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />)}</section>
            <section className="rounded-2xl border bg-card p-5"><h3 className="font-semibold">Discussion points</h3>{list(a.discussion, <MessageCircleQuestion className="mt-0.5 size-4 shrink-0 text-product-academic" aria-hidden />)}</section>
            <section className="rounded-2xl border bg-card p-5"><h3 className="font-semibold">Viva questions</h3>{list(a.vivaQuestions, <Mic className="mt-0.5 size-4 shrink-0 text-product-academic" aria-hidden />)}</section>
          </div>
          <p className="text-xs text-muted-foreground">Appraisal is rule-based in this prototype and driven by the paper's evidence type; production uses retrieval over licensed full text.</p>
        </article>
      </div>
    </div>
  );
}
