import { defineTable } from "../csv/table";
import type {
  AcademicProject,
  AcademicSource,
  Paper,
  QcReport,
  Slide,
  VivaQuestion,
} from "@/types/academic";

export const projectsRepo = defineTable<AcademicProject>("academic_projects", {
  numbers: ["slideCount"],
});

export const slidesRepo = defineTable<Slide>("academic_slides", {
  numbers: ["slideNumber", "confidence"],
});

export async function getSlides(projectId: string) {
  return (await slidesRepo.where((s) => s.projectId === projectId)).sort(
    (a, b) => a.slideNumber - b.slideNumber,
  );
}

export const papersRepo = defineTable<Paper>("papers", {
  numbers: ["year"],
  booleans: ["verified"],
});

export const sourcesRepo = defineTable<AcademicSource>("academic_sources", { numbers: ["year"] });

export const vivaRepo = defineTable<VivaQuestion>("viva_questions");

export const qcRepo = defineTable<QcReport>("benchmark_results", {
  numbers: [
    "accuracyScore",
    "academicDepth",
    "specialtyRelevance",
    "completeness",
    "duplicationScore",
    "evidenceScore",
    "citationScore",
    "visualScore",
    "narrativeScore",
  ],
});
