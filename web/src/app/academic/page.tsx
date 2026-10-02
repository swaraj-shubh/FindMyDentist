import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, FlaskConical, Mic, Newspaper, Presentation, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ProjectCard } from "@/components/academic/project-card";
import { getSlides } from "@/lib/server/repositories/academic";
import { listProjects } from "@/lib/server/services/academic-service";
import { requireUser } from "@/lib/server/session";
import { firstName, greeting, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Home" };

const ACTIONS = [
  { label: "Create Seminar", href: "/academic/studio/new", icon: Presentation },
  { label: "Research Topic", href: "/academic/research", icon: Search },
  { label: "Journal Club", href: "/academic/journal-club", icon: Newspaper },
  { label: "Case Presentation", href: "/academic/cases", icon: FileText },
  { label: "Viva Practice", href: "/academic/viva", icon: Mic },
  { label: "Create Poster", href: "/academic/posters", icon: FlaskConical },
];

export default async function AcademicHome() {
  const user = await requireUser("/academic");
  const projects = await listProjects(user.id);
  const counts = new Map(await Promise.all(projects.map(async (p) => [p.id, (await getSlides(p.id)).length] as const)));
  const latest = projects[0];
  return (
    <div className="mx-auto max-w-6xl space-y-10 p-4 sm:p-8">
      <div>
        <p className="text-sm text-muted-foreground">FMD Academic · The AI academic workspace for dentistry</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{greeting()}, {firstName(user.name)}</h1>
      </div>
      {latest && (
        <section aria-labelledby="continue" className="rounded-3xl border bg-[linear-gradient(135deg,var(--card),oklch(0.96_0.02_292))] p-6">
          <h2 id="continue" className="text-sm font-medium text-muted-foreground">Continue working</h2>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-2xl font-semibold tracking-tight">{latest.title}</p>
              <p className="text-muted-foreground">{latest.level} {latest.specialty}</p>
              <div className="mt-4 w-72 max-w-full">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>{latest.status === "generated" ? `${counts.get(latest.id)} slides` : "Blueprint ready"}</span><span>Last edited {timeAgo(latest.updatedAt)}</span></div>
                <Progress value={latest.status === "generated" ? 100 : 35} aria-label="Progress" />
              </div>
            </div>
            <Button asChild size="lg"><Link href={`/academic/studio/${latest.id}`}>Continue <ArrowRight /></Link></Button>
          </div>
        </section>
      )}
      <section aria-labelledby="quick">
        <h2 id="quick" className="mb-4 text-lg font-semibold">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {ACTIONS.map((a) => (
            <Link key={a.label} href={a.href} className="flex flex-col items-start gap-3 rounded-2xl border bg-card p-4 transition-colors hover:border-product-academic/50 hover:bg-secondary/40">
              <a.icon className="size-5 text-product-academic" aria-hidden />
              <span className="text-sm font-medium">{a.label}</span>
            </Link>
          ))}
        </div>
      </section>
      <section aria-labelledby="recent">
        <div className="mb-4 flex items-center justify-between"><h2 id="recent" className="text-lg font-semibold">Recent projects</h2><Button asChild variant="ghost"><Link href="/academic/studio">All projects <ArrowRight /></Link></Button></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{projects.map((p) => <ProjectCard key={p.id} project={p} slideCount={counts.get(p.id) ?? 0} />)}</div>
      </section>
    </div>
  );
}
