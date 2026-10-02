export type ProjectKind = "seminar" | "journal_club" | "case" | "poster";
export type ProjectStatus = "draft" | "blueprint" | "generated";

export interface OutlineSection {
  id: string;
  title: string;
  subtopics: string[];
  slides: number;
}

export interface AcademicProject {
  id: string;
  userId: string;
  kind: ProjectKind;
  title: string;
  topic: string;
  specialty: string;
  level: string;
  duration: string;
  slideCount: number;
  citationStyle: "Vancouver" | "APA" | "Harvard";
  status: ProjectStatus;
  outline: OutlineSection[];
  paperIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type SlideType =
  | "title"
  | "objectives"
  | "section"
  | "definition"
  | "comparison"
  | "timeline"
  | "mechanism"
  | "clinical_workflow"
  | "image_explanation"
  | "chart"
  | "summary"
  | "references";

export interface Slide {
  id: string;
  projectId: string;
  sectionId: string;
  slideNumber: number;
  slideType: SlideType;
  title: string;
  purpose: string;
  keyPoints: string[];
  visualRequirement: string;
  specialtyRelevance: string;
  citations: string[];
  speakerNotes: string;
  confidence: number;
}

export interface Paper {
  id: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  citation: string;
  doi: string;
  pubmedId: string;
  abstract: string;
  specialty: string;
  topic: string;
  keywords: string[];
  evidenceType: string;
  verified: boolean;
}

export interface AcademicSource {
  id: string;
  title: string;
  sourceType: string;
  publisher: string;
  year: number;
  url: string;
  doi: string;
  specialty: string;
  topic: string;
  licenseStatus: string;
}

export interface VivaQuestion {
  id: string;
  projectId: string;
  slideId: string;
  question: string;
  difficulty: "basic" | "intermediate" | "advanced";
  answer: string;
  topic: string;
  concepts: string[];
}

export interface QcIssue {
  slideNumber: number;
  kind: "missing_citation" | "duplicate" | "dense" | "low_confidence" | "missing_section" | "unverified_source";
  message: string;
}

export interface QcReport {
  id: string;
  projectId: string;
  accuracyScore: number;
  academicDepth: number;
  specialtyRelevance: number;
  completeness: number;
  duplicationScore: number;
  evidenceScore: number;
  citationScore: number;
  visualScore: number;
  narrativeScore: number;
  issues: QcIssue[];
  createdAt: string;
}
