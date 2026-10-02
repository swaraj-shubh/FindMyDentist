import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ResearchPanel } from "@/components/academic/research-panel";
import { listProjects } from "@/lib/server/services/academic-service";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Research" };

export default async function ResearchPage({ searchParams }: PageProps<"/academic/research">) {
  const sp = await searchParams;
  const user = await requireUser("/academic/research");
  const projects = await listProjects(user.id);
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
      <PageHeader title="Research Assistant" description="Find current and landmark literature, keep source metadata, and add evidence to your projects." />
      <ResearchPanel projects={projects.map((p) => ({ id: p.id, title: p.title, paperIds: p.paperIds }))} initialQuery={typeof sp.q === "string" ? sp.q : ""} />
    </div>
  );
}
