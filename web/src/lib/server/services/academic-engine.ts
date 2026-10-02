// FMD Academic generation engine (prototype stand-in for the AI orchestration layer).
// Pure + deterministic: blueprint → structured slide objects → viva → QC.
// Imported by scripts/seed.ts via Node type-stripping, so relative imports carry `.ts`.
import type {
  AcademicProject,
  OutlineSection,
  Paper,
  QcIssue,
  QcReport,
  Slide,
  SlideType,
  VivaQuestion,
} from "../../../types/academic.ts";
import { getSpecialty } from "../../config/specialties.ts";
import { CALCIUM_BENCHMARK, isCalciumBenchmark, type KnowledgeSubtopic } from "./academic-knowledge.ts";

const VISUALS: Record<SlideType, string> = {
  title: "title_hero",
  objectives: "numbered_list",
  section: "section_divider",
  definition: "definition_card",
  comparison: "comparison_table",
  timeline: "timeline",
  mechanism: "mechanism_diagram",
  clinical_workflow: "flowchart",
  image_explanation: "clinical_image",
  chart: "bar_chart",
  summary: "key_takeaways",
  references: "reference_list",
};

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function pickType(title: string): SlideType {
  const t = title.toLowerCase();
  if (/objective/.test(t)) return "objectives";
  if (/take-home|takeaway/.test(t)) return "summary";
  if (/axis|regulation|mechanism|cycle|receptor|pathway|mechanostat|hormone|healing/.test(t)) return "mechanism";
  if (/\bvs\b|fractions|categories|ceramics|comparison|classification|hypo|hyper|diseases|osteoporosis/.test(t)) return "comparison";
  if (/history|historical|evolution|landmark|debates|emerging/.test(t)) return "timeline";
  if (/management|planning|assessment|maintenance|treatment|investigation|examination/.test(t)) return "clinical_workflow";
  if (/balance|daily|total|distribution|epidemiology|evidence summary|incidence/.test(t)) return "chart";
  if (/definition|roles|what is|overview|why/.test(t)) return "definition";
  return "image_explanation";
}

// ─── Blueprint ────────────────────────────────────────────────────────────────

interface BlueprintInput {
  topic: string;
  specialty: string;
  slideCount: number;
}

function genericSections(topic: string, specialty: string): { title: string; subtopics: string[] }[] {
  const emphasis = getSpecialty(specialty).emphasis;
  return [
    { title: "Introduction and learning objectives", subtopics: [`Overview of ${topic}`, "Learning objectives"] },
    { title: "Historical perspective", subtopics: ["Evolution of concepts", "Landmark contributions"] },
    { title: "Definitions and classification", subtopics: [`Definitions of ${topic}`, "Classification systems"] },
    { title: "Basic science", subtopics: ["Relevant anatomy and histology", "Biological basis"] },
    { title: "Etiology and mechanisms", subtopics: ["Etiological factors", "Mechanism and pathophysiology"] },
    ...emphasis.slice(0, 2).map((e) => ({
      title: `${topic} and ${e}`,
      subtopics: [`Principles of ${e}`, `Clinical considerations in ${e}`],
    })),
    { title: "Diagnosis and assessment", subtopics: ["Clinical examination", "Investigations and imaging"] },
    { title: "Clinical management", subtopics: ["Treatment planning", "Techniques and materials", "Complications and their management"] },
    { title: "Recent advances and evidence", subtopics: ["Recent advances", "Evidence summary"] },
    { title: "Controversies and future directions", subtopics: ["Current debates", "Emerging science"] },
    { title: "Conclusion and clinical takeaways", subtopics: ["Take-home messages"] },
  ];
}

/** Slide budget per section, proportional to subtopic weight; 2 slides reserved for title + references. */
function allocate(weights: number[], total: number) {
  const available = Math.max(weights.length, total - 2);
  const sum = weights.reduce((a, b) => a + b, 0);
  const alloc = weights.map((w) => Math.max(1, Math.round((available * w) / sum)));
  let diff = available - alloc.reduce((a, b) => a + b, 0);
  for (let i = 0; diff !== 0 && i < 1000; i++) {
    const idx = i % alloc.length;
    if (diff > 0) (alloc[idx]++, diff--);
    else if (alloc[idx] > 1) (alloc[idx]--, diff++);
  }
  return alloc;
}

export function buildBlueprint({ topic, specialty, slideCount }: BlueprintInput): OutlineSection[] {
  const sections = isCalciumBenchmark(topic)
    ? benchmarkSections(specialty).map((s) => ({ title: s.title, subtopics: s.subtopics.map((x) => x.title) }))
    : genericSections(topic, specialty);
  const alloc = allocate(sections.map((s) => s.subtopics.length + 1), slideCount);
  return sections.map((s, i) => ({ id: `sec${i + 1}`, title: s.title, subtopics: s.subtopics, slides: alloc[i] }));
}

function benchmarkSections(specialty: string) {
  const emphasis = getSpecialty(specialty).emphasis;
  return CALCIUM_BENCHMARK.flatMap((s) => {
    if (!s.specialtyOnly || s.specialtyOnly === specialty) return [s];
    // Specialty context engine: swap prosthodontic sections for the chosen specialty's lens.
    const e = emphasis[s.title.startsWith("Clinical") ? 1 : 0];
    return [
      {
        title: s.title.startsWith("Clinical")
          ? `Clinical implications for ${specialty}`
          : `Calcium metabolism and ${e}`,
        relevance: `Connects calcium biology to ${e} in ${specialty}.`,
        subtopics: [
          { title: `Principles of ${e}`, points: [] },
          { title: `Clinical considerations in ${e}`, points: [] },
        ],
      },
    ];
  });
}

// ─── Slides ───────────────────────────────────────────────────────────────────

function citeFor(papers: Paper[], keys: string[] | null, text: string) {
  const needles = keys ?? text.toLowerCase().split(/\W+/).filter((w) => w.length > 5);
  return papers
    .map((p) => ({ p, score: p.keywords.filter((k) => needles.some((n) => k.includes(n) || n.includes(k))).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.p.year - b.p.year)
    .slice(0, 2)
    .map((x) => x.p.id);
}

function genericPoints(subtopic: string, specialty: string, emphasis: readonly string[]) {
  const t = subtopic.toLowerCase();
  const e = emphasis[hash(subtopic) % emphasis.length];
  const byType: Record<SlideType, string[]> = {
    definition: [`${subtopic}: accepted definition and scope`, `Terminology for ${t} in ${specialty} literature`, `How ${t} differs from related concepts`],
    mechanism: [`Biological basis of ${t}`, `Sequence of events in ${t}`, `Local and systemic factors modifying ${t}`],
    comparison: [`Main categories within ${t}`, `Distinguishing features across ${t}`, `Why the ${t} distinctions matter clinically`],
    timeline: [`Early descriptions of ${t}`, `Milestones that shaped ${t}`, `Where ${t} stands today`],
    clinical_workflow: [`Indications and patient selection for ${t}`, `Step-by-step approach to ${t}`, `Common pitfalls in ${t}`],
    chart: [`Prevalence data relevant to ${t}`, `Trends in ${t} over time`, `Reading ${t} data clinically`],
    image_explanation: [`Clinical presentation of ${t}`, `Features to identify in ${t}`, `Relevance of ${t} to ${e}`],
    title: [], objectives: [], section: [], summary: [], references: [],
  };
  return byType[pickType(subtopic)].length ? byType[pickType(subtopic)] : byType.image_explanation;
}

function knowledgeFor(topic: string, specialty: string, sectionTitle: string, subtopic: string): KnowledgeSubtopic | null {
  if (!isCalciumBenchmark(topic)) return null;
  const sec = benchmarkSections(specialty).find((s) => s.title === sectionTitle);
  const sub = sec?.subtopics.find((s) => s.title === subtopic);
  return sub && sub.points.length ? sub : null;
}

function relevanceFor(topic: string, specialty: string, sectionTitle: string) {
  const sec = isCalciumBenchmark(topic) ? benchmarkSections(specialty).find((s) => s.title === sectionTitle) : null;
  if (sec) return sec.relevance;
  const e = getSpecialty(specialty).emphasis;
  return `Links ${sectionTitle.toLowerCase()} to ${e[hash(sectionTitle) % e.length]} in ${specialty}.`;
}

function speakerNotes(title: string, points: string[], specialty: string) {
  if (!points.length) return `Pause here and introduce “${title}”. Tell the audience what this part covers and why it matters in ${specialty}.`;
  return [
    `Open with the question this slide answers: what does “${title}” mean for a ${specialty} clinician?`,
    `Walk through: ${points.slice(0, 3).join("; ")}.`,
    `Close by linking back to the clinical problem before moving on.`,
  ].join(" ");
}

type Draft = Omit<Slide, "id" | "projectId" | "slideNumber">;

function contentSlide(
  project: Pick<AcademicProject, "topic" | "specialty">,
  section: OutlineSection,
  subtopic: string,
  papers: Paper[],
  variant = 0,
): Draft {
  const emphasis = getSpecialty(project.specialty).emphasis;
  const k = knowledgeFor(project.topic, project.specialty, section.title, subtopic);
  const basePoints = k?.points ?? genericPoints(subtopic, project.specialty, emphasis);
  // Regeneration variant: rotate emphasis and point order so the slide visibly changes.
  const points = variant ? [...basePoints.slice(variant % basePoints.length), ...basePoints.slice(0, variant % basePoints.length)] : basePoints;
  const type = pickType(subtopic);
  const confidenceSeed = hash(`${project.topic}|${subtopic}|${variant}`) % 100;
  return {
    sectionId: section.id,
    slideType: type,
    title: subtopic,
    purpose: `Explain ${subtopic.toLowerCase()} within ${section.title.toLowerCase()}.`,
    keyPoints: points,
    visualRequirement: VISUALS[type],
    specialtyRelevance: relevanceFor(project.topic, project.specialty, section.title),
    citations: citeFor(papers, k ? (k.cite ?? []) : null, `${subtopic} ${section.title}`),
    speakerNotes: speakerNotes(subtopic, points, project.specialty),
    // Curated knowledge is trusted more than templated filler.
    confidence: Number(((k ? 0.86 : 0.66) + (confidenceSeed / 100) * 0.11).toFixed(2)),
  };
}

/** Synthesis slides that fill a section's budget beyond its subtopics. */
function fillerSlide(project: Pick<AcademicProject, "topic" | "specialty">, section: OutlineSection, n: number, papers: Paper[]): Draft {
  const emphasis = getSpecialty(project.specialty).emphasis;
  const e = emphasis[(n + hash(section.title)) % emphasis.length];
  const subs = section.subtopics;
  const firstPoints = subs
    .map((s) => knowledgeFor(project.topic, project.specialty, section.title, s)?.points[0])
    .filter((p): p is string => !!p);
  const kinds: [SlideType, string, string[]][] = [
    [
      "image_explanation",
      `${section.title}: clinical correlation with ${e}`,
      [
        relevanceFor(project.topic, project.specialty, section.title),
        ...subs.slice(0, 2).map((s) => `Ask: how does ${s.toLowerCase()} alter ${e}?`),
      ],
    ],
    ["mechanism", `${section.title}: concept map`, subs.map((s, i) => `${i + 1}. ${s}`)],
    ["summary", `${section.title}: key takeaways`, firstPoints.length ? firstPoints : subs.map((s) => `Remember: ${s.toLowerCase()}`)],
    ["summary", `${section.title}: self-check`, subs.slice(0, 3).map((s) => `Can you explain ${s.toLowerCase()} without notes?`)],
  ];
  const [type, title, keyPoints] = kinds[n % kinds.length];
  // Synthesis slides inherit the evidence of the subtopics they summarize.
  const citations =
    type === "summary"
      ? []
      : [...new Set(subs.flatMap((s) => contentSlide(project, section, s, papers).citations))].slice(0, 3);
  return {
    sectionId: section.id,
    slideType: type,
    title,
    purpose: `Reinforce ${section.title.toLowerCase()} from a ${project.specialty} perspective.`,
    keyPoints,
    visualRequirement: VISUALS[type],
    specialtyRelevance: relevanceFor(project.topic, project.specialty, section.title),
    citations,
    speakerNotes: speakerNotes(title, keyPoints, project.specialty),
    confidence: Number((0.74 + ((hash(title) % 100) / 100) * 0.12).toFixed(2)),
  };
}

export function buildSlides(project: AcademicProject, papers: Paper[]): Slide[] {
  const drafts: Draft[] = [
    {
      sectionId: "",
      slideType: "title",
      title: project.title,
      purpose: `${project.level} ${project.specialty} seminar · ${project.duration}`,
      keyPoints: [`${project.level} · ${project.specialty}`, `Presented by FMD Academic`],
      visualRequirement: VISUALS.title,
      specialtyRelevance: `Positions ${project.topic} for a ${project.specialty} audience.`,
      citations: [],
      speakerNotes: `Introduce yourself, the topic and why ${project.topic} matters for ${project.specialty}.`,
      confidence: 0.99,
    },
  ];

  for (const section of project.outline) {
    const budget = section.slides;
    const withDivider = budget > section.subtopics.length;
    if (withDivider) {
      drafts.push({
        sectionId: section.id,
        slideType: "section",
        title: section.title,
        purpose: "Section divider",
        keyPoints: section.subtopics,
        visualRequirement: VISUALS.section,
        specialtyRelevance: relevanceFor(project.topic, project.specialty, section.title),
        citations: [],
        speakerNotes: speakerNotes(section.title, [], project.specialty),
        confidence: 0.99,
      });
    }
    const subs = section.subtopics.slice(0, withDivider ? section.subtopics.length : budget);
    for (const sub of subs) drafts.push(contentSlide(project, section, sub, papers));
    for (let n = 0; n < budget - subs.length - (withDivider ? 1 : 0); n++) drafts.push(fillerSlide(project, section, n, papers));
  }

  const cited = [...new Set(drafts.flatMap((d) => d.citations))];
  drafts.push({
    sectionId: "",
    slideType: "references",
    title: "References",
    purpose: `${project.citationStyle} reference list`,
    keyPoints: cited.map((id) => papers.find((p) => p.id === id)?.citation ?? id),
    visualRequirement: VISUALS.references,
    specialtyRelevance: "",
    citations: cited,
    speakerNotes: "Point the audience to the key references for further reading.",
    confidence: 0.95,
  });

  return drafts.map((d, i) => ({ ...d, id: `${project.id}-s${String(i + 1).padStart(3, "0")}`, projectId: project.id, slideNumber: i + 1 }));
}

export function regenerateSlide(project: AcademicProject, slide: Slide, papers: Paper[], variant: number): Slide {
  const section = project.outline.find((s) => s.id === slide.sectionId);
  if (!section || ["title", "section", "references"].includes(slide.slideType)) return slide;
  const isSubtopic = section.subtopics.includes(slide.title);
  const draft = isSubtopic
    ? contentSlide(project, section, slide.title, papers, variant)
    : fillerSlide(project, section, variant, papers);
  return { ...slide, ...draft };
}

// ─── Viva ─────────────────────────────────────────────────────────────────────

function concept(point: string) {
  return point.split(/ — | – |:|\(|,| is | are /)[0].trim().split(" ").slice(0, 6).join(" ");
}

export function buildViva(project: AcademicProject, slides: Slide[], max = 20): VivaQuestion[] {
  const candidates = slides.filter(
    (s) => !["title", "section", "references", "objectives"].includes(s.slideType) && s.keyPoints.length >= 2,
  );
  const step = Math.max(1, candidates.length / max);
  const picked = Array.from({ length: Math.min(max, candidates.length) }, (_, i) => candidates[Math.floor(i * step)]);
  return picked.map((s, i) => {
    const t = s.title.replace(/:.*$/, "").toLowerCase();
    const q =
      s.slideType === "mechanism"
        ? `Explain the mechanism behind ${t}.`
        : s.slideType === "comparison"
          ? `Compare and contrast the key aspects of ${t}.`
          : s.slideType === "clinical_workflow"
            ? `How would you apply ${t} when managing a ${project.specialty} patient?`
            : s.slideType === "definition"
              ? `Define ${t} and explain its significance.`
              : `What is the clinical relevance of ${t} in ${project.specialty}?`;
    const ratio = i / Math.max(1, picked.length - 1);
    return {
      id: `${s.id}-v`,
      projectId: project.id,
      slideId: s.id,
      question: q,
      difficulty: ratio < 0.34 ? "basic" : ratio < 0.67 ? "intermediate" : "advanced",
      answer: s.keyPoints.join(". ") + ".",
      topic: s.title,
      concepts: s.keyPoints.slice(0, 4).map(concept),
    };
  });
}

// ─── Quality control (blueprint §12) ─────────────────────────────────────────

const CONTENT_TYPES: SlideType[] = ["definition", "comparison", "timeline", "mechanism", "clinical_workflow", "image_explanation", "chart"];

function words(s: string) {
  return new Set(s.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
}

function jaccard(a: Set<string>, b: Set<string>) {
  const inter = [...a].filter((x) => b.has(x)).length;
  return inter / (a.size + b.size - inter || 1);
}

export function runQc(project: AcademicProject, slides: Slide[], papers: Paper[]): QcReport {
  const issues: QcIssue[] = [];
  const content = slides.filter((s) => CONTENT_TYPES.includes(s.slideType));
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  const uncited = content.filter((s) => s.citations.length === 0);
  for (const s of uncited) issues.push({ slideNumber: s.slideNumber, kind: "missing_citation", message: "Content slide has no supporting citation" });

  let dupes = 0;
  // Ignore boilerplate: words on more than 15% of slides say nothing about duplicated content.
  const raw = content.map((s) => ({ s, bag: words(`${s.title} ${s.keyPoints.join(" ")}`) }));
  const df = new Map<string, number>();
  for (const { bag } of raw) for (const w of bag) df.set(w, (df.get(w) ?? 0) + 1);
  const common = (w: string) => content.length >= 8 && (df.get(w) ?? 0) / content.length > 0.15;
  const bags = raw.map(({ s, bag }) => ({ s, bag: new Set([...bag].filter((w) => !common(w))) }));
  for (let i = 0; i < bags.length; i++)
    for (let j = 0; j < i; j++)
      if (bags[i].s.title.toLowerCase() === bags[j].s.title.toLowerCase() || jaccard(bags[i].bag, bags[j].bag) > 0.6) {
        dupes++;
        issues.push({ slideNumber: bags[i].s.slideNumber, kind: "duplicate", message: `Repeats the concept on slide ${bags[j].s.slideNumber}` });
        break;
      }

  const dense = content.filter((s) => s.keyPoints.length > 6 || s.keyPoints.join(" ").split(/\s+/).length > 80);
  for (const s of dense) issues.push({ slideNumber: s.slideNumber, kind: "dense", message: "Too much text for one slide — split or trim" });

  const low = content.filter((s) => s.confidence < 0.72);
  for (const s of low) issues.push({ slideNumber: s.slideNumber, kind: "low_confidence", message: `Low confidence (${Math.round(s.confidence * 100)}%) — templated content needs expert review` });

  const titles = slides.map((s) => s.title.toLowerCase()).join(" | ");
  const required: [RegExp, string][] = [
    [/introduction|overview/, "Introduction"],
    [/clinical|management|implication/, "Clinical application"],
    [/recent|advance|literature|controvers/, "Recent evidence"],
    [/conclusion|take-home|takeaway/, "Conclusion"],
    [/references/, "References"],
  ];
  const missing = required.filter(([re]) => !re.test(titles));
  for (const [, label] of missing) issues.push({ slideNumber: 0, kind: "missing_section", message: `Missing section: ${label}` });

  const citedIds = [...new Set(slides.flatMap((s) => s.citations))];
  const cited = citedIds.map((id) => papers.find((p) => p.id === id)).filter((p): p is Paper => !!p);
  const unverified = cited.filter((p) => !p.verified);
  if (unverified.length)
    issues.push({ slideNumber: 0, kind: "unverified_source", message: `${unverified.length} cited source(s) await DOI/PubMed verification` });

  const contentN = content.length || 1;
  const avgConf = content.reduce((a, s) => a + s.confidence, 0) / contentN;
  const avgPoints = content.reduce((a, s) => a + s.keyPoints.length, 0) / contentN;
  const emphasis = getSpecialty(project.specialty).emphasis.map((e) => e.split(" ")[0].toLowerCase());
  const relevant = content.filter((s) => emphasis.some((e) => `${s.specialtyRelevance} ${s.title}`.toLowerCase().includes(e)) || s.specialtyRelevance.length > 40);
  const firstIsIntro = /introduction|overview/i.test(project.outline[0]?.title ?? "");
  const lastIsConclusion = /conclusion|takeaway/i.test(project.outline.at(-1)?.title ?? "");
  const withDoi = cited.filter((p) => p.doi || p.pubmedId).length;

  return {
    id: `qc-${project.id}-${Date.now().toString(36)}`,
    projectId: project.id,
    accuracyScore: clamp(avgConf * 100 + 4),
    academicDepth: clamp((avgPoints / (project.level === "BDS" ? 3 : 3.5)) * 88),
    specialtyRelevance: clamp((relevant.length / contentN) * 100),
    completeness: clamp(100 - missing.length * 12),
    duplicationScore: clamp(100 - (dupes / contentN) * 300),
    evidenceScore: clamp(((contentN - uncited.length) / contentN) * 100),
    citationScore: clamp(cited.length ? 70 + (withDoi / cited.length) * 30 : 0),
    visualScore: clamp(100 - (dense.length / contentN) * 200 - (content.filter((s) => s.visualRequirement === "").length / contentN) * 50),
    narrativeScore: clamp(60 + (firstIsIntro ? 20 : 0) + (lastIsConclusion ? 20 : 0)),
    issues: issues.sort((a, b) => a.slideNumber - b.slideNumber),
    createdAt: new Date().toISOString(),
  };
}

// ─── Journal club appraisal ──────────────────────────────────────────────────

export function appraisePaper(paper: Paper, specialty: string) {
  const e = getSpecialty(specialty).emphasis;
  const design = paper.evidenceType.toLowerCase();
  const strengths: string[] = [];
  const limitations: string[] = [];
  if (/landmark|classic/.test(design)) strengths.push("Foundational work that defined the field's vocabulary");
  if (/longitudinal|prospective|cohort/.test(design)) strengths.push("Follows participants over time, capturing change rather than a snapshot");
  if (/review|position|consensus/.test(design)) strengths.push("Synthesizes a broad body of evidence");
  if (/experimental|animal|in vitro|basic/.test(design)) {
    strengths.push("Controlled conditions isolate the mechanism of interest");
    limitations.push("Translational gap — animal or laboratory findings may not transfer directly to patients");
  }
  if (/clinical|human/.test(design)) strengths.push("Directly observes human clinical outcomes");
  if (paper.year < 1995) limitations.push("Predates modern imaging, implant surfaces and reporting standards");
  if (/review|position/.test(design)) limitations.push("Strength depends on the quality of the underlying studies");
  if (!paper.doi && !paper.pubmedId) limitations.push("Source metadata not yet verified against PubMed/Crossref in this prototype");
  if (!strengths.length) strengths.push("Clearly stated research question");
  limitations.push("Check sample size, follow-up and confounding before generalizing");

  return {
    summary: paper.abstract,
    design: paper.evidenceType,
    strengths,
    limitations,
    discussion: [
      `How does this change what we tell ${specialty} patients today?`,
      `Would the findings hold for ${e[0]} in an Indian clinical population?`,
      `What later evidence confirms or challenges this ${paper.year} work?`,
    ],
    vivaQuestions: [
      `Summarize the research question and design of ${paper.authors.split(",")[0]} (${paper.year}).`,
      `What is the main clinical implication of this paper for ${e[1] ?? e[0]}?`,
      `Identify one methodological limitation and how a modern study would address it.`,
    ],
  };
}
