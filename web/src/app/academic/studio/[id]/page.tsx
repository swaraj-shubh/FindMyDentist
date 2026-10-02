import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudioWorkspace } from "@/components/academic/studio-workspace";
import { getSlides, papersRepo } from "@/lib/server/repositories/academic";
import { ServiceError } from "@/lib/server/http";
import { getProject, getQc, getViva } from "@/lib/server/services/academic-service";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Studio" };

export default async function StudioProject({ params }: PageProps<"/academic/studio/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/academic/studio/${id}`);
  const project = await getProject(user, id).catch((e) => { if (e instanceof ServiceError) return null; throw e; });
  if (!project) notFound();
  const [slides, qc, papers, viva] = await Promise.all([getSlides(id), getQc(user, id), papersRepo.all(), getViva(user, id)]);
  return <StudioWorkspace project={project} slides={slides} qc={qc} papers={papers} viva={viva} />;
}
