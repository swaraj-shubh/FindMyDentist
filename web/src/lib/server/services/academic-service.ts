import { ServiceError } from "../http";
import { newId } from "../csv/table";
import { getSlides, papersRepo, projectsRepo, qcRepo, slidesRepo, sourcesRepo, vivaRepo } from "../repositories/academic";
import { buildBlueprint, buildSlides, buildViva, regenerateSlide, runQc } from "./academic-engine";
import { notify } from "./notification-service";
import type { ProjectInput } from "@/lib/validations/academic";
import type { AcademicProject, OutlineSection, Slide } from "@/types/academic";
import type { User } from "@/types/user";

export async function listProjects(userId: string) {
  return (await projectsRepo.where((p) => p.userId === userId)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getProject(user: User, id: string) {
  const project = await projectsRepo.get(id);
  if (!project || project.userId !== user.id) throw new ServiceError("Project not found.", 404);
  return project;
}

const KIND_TITLE: Record<AcademicProject["kind"], (t: string) => string> = {
  seminar: (t) => t,
  journal_club: (t) => `Journal Club — ${t}`,
  case: (t) => `Case Presentation — ${t}`,
  poster: (t) => `Poster — ${t}`,
};

export async function createProject(user: User, input: ProjectInput) {
  const now = new Date().toISOString();
  const project: AcademicProject = {
    id: newId("ap"),
    userId: user.id,
    kind: input.kind,
    title: KIND_TITLE[input.kind](input.topic),
    topic: input.topic,
    specialty: input.specialty,
    level: input.level,
    duration: input.duration,
    slideCount: input.slideCount,
    citationStyle: input.citationStyle,
    status: "blueprint",
    outline: buildBlueprint(input),
    paperIds: [],
    createdAt: now,
    updatedAt: now,
  };
  return projectsRepo.insert(project);
}

export async function updateProject(
  user: User,
  id: string,
  patch: { title?: string; outline?: OutlineSection[]; addPaperId?: string; removePaperId?: string },
) {
  const project = await getProject(user, id);
  const next: Partial<AcademicProject> = { updatedAt: new Date().toISOString() };
  if (patch.title) next.title = patch.title;
  if (patch.outline) {
    next.outline = patch.outline;
    next.slideCount = patch.outline.reduce((s, x) => s + x.slides, 0) + 2;
  }
  if (patch.addPaperId && !project.paperIds.includes(patch.addPaperId)) {
    if (!(await papersRepo.get(patch.addPaperId))) throw new ServiceError("Source not found.", 404);
    next.paperIds = [...project.paperIds, patch.addPaperId];
  }
  if (patch.removePaperId) next.paperIds = project.paperIds.filter((p) => p !== patch.removePaperId);
  return projectsRepo.update(id, next);
}

export async function deleteProject(user: User, id: string) {
  await getProject(user, id);
  await slidesRepo.replaceWhere((s) => s.projectId === id, []);
  await vivaRepo.replaceWhere((v) => v.projectId === id, []);
  await projectsRepo.remove(id);
}

/** Re-derives the blueprint from the project inputs (discarding outline edits). */
export async function regenerateBlueprint(user: User, id: string) {
  const project = await getProject(user, id);
  return projectsRepo.update(id, { outline: buildBlueprint(project), updatedAt: new Date().toISOString() });
}

/** Full generation: structured slides → viva → QC snapshot. Batched per section inside the engine. */
export async function generateSlides(user: User, id: string) {
  const project = await getProject(user, id);
  const papers = await papersRepo.all();
  const slides = buildSlides(project, papers);
  await slidesRepo.replaceWhere((s) => s.projectId === id, slides);
  await vivaRepo.replaceWhere((v) => v.projectId === id, buildViva(project, slides));
  const qc = runQc(project, slides, papers);
  await qcRepo.insert(qc);
  await projectsRepo.update(id, { status: "generated", slideCount: slides.length, updatedAt: new Date().toISOString() });
  await notify(user.id, { type: "academic", title: "Presentation generated", message: `${project.title} · ${slides.length} slides ready for review.`, href: `/academic/studio/${id}` });
  return { slides: slides.length, qc };
}

async function touch(id: string) {
  await projectsRepo.update(id, { updatedAt: new Date().toISOString() });
}

export async function regenerateOneSlide(user: User, projectId: string, slideId: string) {
  const project = await getProject(user, projectId);
  const slide = await slidesRepo.get(slideId);
  if (!slide || slide.projectId !== projectId) throw new ServiceError("Slide not found.", 404);
  const variant = (Date.now() % 7) + 1;
  const next = regenerateSlide(project, slide, await papersRepo.all(), variant);
  await touch(projectId);
  return slidesRepo.update(slideId, next);
}

async function renumber(projectId: string, ordered: Slide[]) {
  await slidesRepo.replaceWhere(
    (s) => s.projectId === projectId,
    ordered.map((s, i) => ({ ...s, slideNumber: i + 1 })),
  );
}

export async function editSlides(
  user: User,
  input: { projectId: string; op: "update" | "duplicate" | "delete" | "move"; slideId: string; toIndex?: number; patch?: Partial<Slide> },
) {
  await getProject(user, input.projectId);
  const slides = await getSlides(input.projectId);
  const idx = slides.findIndex((s) => s.id === input.slideId);
  if (idx < 0) throw new ServiceError("Slide not found.", 404);

  if (input.op === "update") {
    await slidesRepo.update(input.slideId, input.patch ?? {});
  } else if (input.op === "duplicate") {
    const copy = { ...slides[idx], id: newId(`${input.projectId}-s`), title: `${slides[idx].title} (copy)` };
    await renumber(input.projectId, [...slides.slice(0, idx + 1), copy, ...slides.slice(idx + 1)]);
  } else if (input.op === "delete") {
    if (slides.length <= 1) throw new ServiceError("A presentation needs at least one slide.");
    await renumber(input.projectId, slides.filter((s) => s.id !== input.slideId));
  } else {
    const to = Math.max(0, Math.min(slides.length - 1, input.toIndex ?? idx));
    const reordered = [...slides];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(to, 0, moved);
    await renumber(input.projectId, reordered);
  }
  await touch(input.projectId);
  return getSlides(input.projectId);
}

/** QC is computed live so edits are reflected immediately. */
export async function getQc(user: User, projectId: string) {
  const project = await getProject(user, projectId);
  return runQc(project, await getSlides(projectId), await papersRepo.all());
}

export async function getViva(user: User, projectId: string) {
  await getProject(user, projectId);
  return vivaRepo.where((v) => v.projectId === projectId);
}

export interface ResearchQuery {
  q?: string;
  specialty?: string;
  evidence?: string;
  from?: number;
}

/** Literature search with simple relevance scoring (stands in for PubMed/RAG retrieval). */
export async function searchPapers({ q = "", specialty, evidence, from }: ResearchQuery) {
  const terms = q.toLowerCase().split(/\W+/).filter((t) => t.length > 2);
  const papers = await papersRepo.where(
    (p) => (!specialty || p.specialty === specialty) && (!evidence || p.evidenceType.toLowerCase().includes(evidence.toLowerCase())) && (!from || p.year >= from),
  );
  return papers
    .map((p) => {
      const hay = `${p.title} ${p.abstract} ${p.keywords.join(" ")} ${p.topic}`.toLowerCase();
      const hits = terms.filter((t) => hay.includes(t)).length;
      return { ...p, relevance: terms.length ? hits / terms.length : 0.5 };
    })
    .filter((p) => !terms.length || p.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance || b.year - a.year);
}

export const listSources = () => sourcesRepo.all();

/** Markdown export: slides, speaker notes and the reference list in one file. */
export async function exportMarkdown(user: User, projectId: string) {
  const project = await getProject(user, projectId);
  const slides = await getSlides(projectId);
  const papers = await papersRepo.all();
  const cited = [...new Set(slides.flatMap((s) => s.citations))].map((id) => papers.find((p) => p.id === id)).filter(Boolean);
  const refNo = (id: string) => cited.findIndex((p) => p!.id === id) + 1;
  const lines = [
    `# ${project.title}`,
    `${project.level} · ${project.specialty} · ${project.duration} · ${project.citationStyle}`,
    "",
    ...slides.flatMap((s) => [
      `## ${s.slideNumber}. ${s.title}`,
      `*${s.slideType.replace("_", " ")} · visual: ${s.visualRequirement}*`,
      "",
      ...(s.slideType === "references" ? [] : s.keyPoints.map((k) => `- ${k}`)),
      s.citations.length && s.slideType !== "references" ? `\nSources: ${s.citations.map((c) => `[${refNo(c)}]`).join(" ")}` : "",
      "",
      `> Speaker notes: ${s.speakerNotes}`,
      "",
    ]),
    "## References",
    ...cited.map((p, i) => `${i + 1}. ${p!.citation}${p!.doi ? ` doi:${p!.doi}` : ""}`),
    "",
  ];
  return { filename: `${project.title.replace(/[^\w]+/g, "-")}.md`, body: lines.join("\n") };
}
