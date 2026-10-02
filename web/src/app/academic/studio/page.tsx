import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectCard } from "@/components/academic/project-card";
import { DeleteProjectButton } from "@/components/academic/delete-project";
import { getSlides } from "@/lib/server/repositories/academic";
import { listProjects } from "@/lib/server/services/academic-service";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Studio" };

export default async function StudioList() {
  const user = await requireUser("/academic/studio");
  const projects = await listProjects(user.id);
  const counts = new Map(await Promise.all(projects.map(async (p) => [p.id, (await getSlides(p.id)).length] as const)));
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
      <PageHeader title="AI Seminar Studio" description="Specialty-aware seminars of 30–150+ slides, generated from a blueprint you control." actions={<Button asChild><Link href="/academic/studio/new"><Plus />New project</Link></Button>} />
      {projects.length === 0 ? <EmptyState icon={Presentation} title="No projects yet" description="Start with a topic — try Calcium Metabolism for MDS Prosthodontics." action={<Button asChild><Link href="/academic/studio/new">Create seminar</Link></Button>} /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className="group relative">
              <ProjectCard project={p} slideCount={counts.get(p.id) ?? 0} />
              <DeleteProjectButton id={p.id} title={p.title} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
