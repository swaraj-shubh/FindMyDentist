import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { NativeSelect } from "@/components/shared/native-select";
import { VivaPanel } from "@/components/academic/viva-panel";
import { listProjects, getViva } from "@/lib/server/services/academic-service";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Viva" };

export default async function VivaPage({ searchParams }: PageProps<"/academic/viva">) {
  const sp = await searchParams;
  const user = await requireUser("/academic/viva");
  const projects = (await listProjects(user.id)).filter((p) => p.status === "generated");
  const project = projects.find((p) => p.id === sp.project) ?? projects[0];
  if (!project)
    return <div className="mx-auto max-w-2xl p-8 text-center"><p className="text-muted-foreground">Viva questions are generated from your presentation. Create one first.</p><Button asChild className="mt-4"><Link href="/academic/studio/new">Create seminar</Link></Button></div>;
  const questions = await getViva(user, project.id);
  return (
    <div className="mx-auto max-w-5xl space-y-2 p-4 sm:p-8">
      <PageHeader title="Viva AI" description="Faculty-style questions based on the exact presentation." actions={<form className="flex gap-2"><NativeSelect name="project" defaultValue={project.id} aria-label="Project">{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</NativeSelect><Button type="submit" variant="outline">Load</Button></form>} />
      <VivaPanel key={project.id} questions={questions} title={project.title} />
    </div>
  );
}
