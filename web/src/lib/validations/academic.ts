import { z } from "zod";
import { SPECIALTY_NAMES } from "@/lib/config/specialties";

export const projectSchema = z.object({
  kind: z.enum(["seminar", "journal_club", "case", "poster"]).default("seminar"),
  topic: z.string().trim().min(3, "Enter a topic").max(120),
  specialty: z.enum(SPECIALTY_NAMES as [string, ...string[]]),
  level: z.enum(["BDS", "MDS", "Faculty"]),
  duration: z.string().min(1),
  slideCount: z.coerce.number().int().min(10).max(150),
  citationStyle: z.enum(["Vancouver", "APA", "Harvard"]),
});

const outlineSection = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(160),
  subtopics: z.array(z.string().trim().min(1).max(160)).max(12),
  slides: z.coerce.number().int().min(1).max(40),
});

export const projectUpdateSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(160).optional(),
  outline: z.array(outlineSection).min(1).max(40).optional(),
  addPaperId: z.string().optional(),
  removePaperId: z.string().optional(),
});

export const generateSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("slides"), projectId: z.string().min(1) }),
  z.object({ mode: z.literal("slide"), projectId: z.string().min(1), slideId: z.string().min(1) }),
  z.object({ mode: z.literal("blueprint"), projectId: z.string().min(1) }),
]);

export const slideUpdateSchema = z.object({
  projectId: z.string().min(1),
  op: z.enum(["update", "duplicate", "delete", "move"]),
  slideId: z.string().min(1),
  toIndex: z.number().int().min(0).optional(),
  patch: z
    .object({
      title: z.string().max(200),
      purpose: z.string().max(400),
      keyPoints: z.array(z.string().max(400)).max(12),
      slideType: z.string(),
      visualRequirement: z.string().max(80),
      specialtyRelevance: z.string().max(400),
      speakerNotes: z.string().max(4000),
    })
    .partial()
    .optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
