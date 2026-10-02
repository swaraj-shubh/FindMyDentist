// Client-safe constants for FMD Academic (kept apart from the server-side generation engine).
import type { QcReport } from "@/types/academic";

/** Blueprint stage (blueprint §6): validate a master outline before any slide exists. */
export const BLUEPRINT_STAGES = ["Topic analysis", "Specialty context", "Academic structure", "Literature requirements", "Slide architecture", "Quality review"] as const;

/** Controlled generation stages shown while slides are built in batches. */
export const GENERATION_STAGES = ["Literature research", "FMD knowledge retrieval", "Slide architect", "Content generation", "Visual / diagram planner", "Citation verification", "Academic quality review", "Viva preparation"] as const;

export const QC_DIMENSIONS: { key: keyof QcReport; label: string }[] = [
  { key: "accuracyScore", label: "Scientific accuracy" },
  { key: "academicDepth", label: "Academic depth" },
  { key: "specialtyRelevance", label: "Specialty relevance" },
  { key: "completeness", label: "Completeness" },
  { key: "duplicationScore", label: "No duplication" },
  { key: "evidenceScore", label: "Evidence coverage" },
  { key: "citationScore", label: "Citation validity" },
  { key: "visualScore", label: "Visual quality" },
  { key: "narrativeScore", label: "Narrative flow" },
];

export function overallScore(qc: QcReport) {
  return Math.round(QC_DIMENSIONS.reduce((a, d) => a + (qc[d.key] as number), 0) / QC_DIMENSIONS.length);
}

export const SLIDE_TYPES = ["title", "objectives", "section", "definition", "comparison", "timeline", "mechanism", "clinical_workflow", "image_explanation", "chart", "summary", "references"] as const;

export const DURATIONS = ["20–30 min", "30–45 min", "45–60 min", "60–90 min"] as const;
