// Curated knowledge pack for the blueprint's flagship benchmark:
// "Calcium Metabolism — MDS Prosthodontics" (blueprint §7). Stands in for the
// future RAG/knowledge layer. Keep it pure data — imported by scripts/seed.ts too.

export interface KnowledgeSubtopic {
  title: string;
  points: string[];
  /** Paper keywords to cite (matched against papers.csv `keywords`). */
  cite?: string[];
}

export interface KnowledgeSection {
  title: string;
  relevance: string;
  /** Sections only shown when the selected specialty matches. */
  specialtyOnly?: string;
  subtopics: KnowledgeSubtopic[];
}

export const CALCIUM_BENCHMARK: KnowledgeSection[] = [
  {
    title: "Introduction and learning objectives",
    relevance: "Frames calcium biology as the foundation of every prosthodontic bone-supported restoration.",
    subtopics: [
      {
        title: "Why calcium matters to the prosthodontist",
        points: [
          "About 99% of body calcium is stored in bone and teeth as hydroxyapatite",
          "Alveolar bone is the foundation for complete dentures, implants and fixed prostheses",
          "Systemic calcium balance influences ridge preservation and osseointegration",
        ],
      },
      {
        title: "Learning objectives",
        points: [
          "Describe calcium distribution, absorption and excretion",
          "Explain regulation by PTH, vitamin D, calcitonin, FGF23 and the calcium-sensing receptor",
          "Relate bone remodeling to residual ridge resorption and implant healing",
          "Apply metabolic assessment to prosthodontic treatment planning",
        ],
      },
    ],
  },
  {
    title: "Basic calcium physiology and distribution",
    relevance: "Skeletal calcium reserves determine the bone available for prosthodontic support.",
    subtopics: [
      {
        title: "Total body calcium",
        points: [
          "An adult body contains roughly 1–1.2 kg of calcium",
          "About 99% is in the skeleton and teeth; about 1% in extracellular fluid and soft tissues",
          "Intracellular free calcium is ~10,000× lower than extracellular — a key signalling gradient",
        ],
      },
      {
        title: "Physiological roles of calcium",
        points: [
          "Mineralization of bone, dentin and enamel",
          "Neuromuscular excitability and muscle contraction",
          "Coagulation cascade (factor IV)",
          "Second-messenger signalling, enzyme activation and hormone secretion",
        ],
      },
      {
        title: "Daily calcium balance",
        points: [
          "Typical adult intake recommendations are around 1000 mg/day",
          "Net intestinal absorption is only a fraction of intake",
          "Kidneys filter large amounts daily and reabsorb about 98%",
          "Bone continuously exchanges calcium with the extracellular pool",
        ],
        cite: ["vitamin d"],
      },
    ],
  },
  {
    title: "Serum calcium: ionized vs protein-bound",
    relevance: "Correct interpretation of serum calcium avoids misjudging metabolic risk before surgery.",
    subtopics: [
      {
        title: "Fractions of serum calcium",
        points: [
          "Normal total serum calcium is about 8.5–10.5 mg/dL (2.1–2.6 mmol/L)",
          "About 45–50% is ionized — the biologically active fraction",
          "About 40% is protein-bound, mostly to albumin",
          "About 10% is complexed with citrate, phosphate and bicarbonate",
        ],
      },
      {
        title: "Albumin correction",
        points: [
          "Corrected Ca = measured Ca + 0.8 × (4.0 − albumin g/dL)",
          "Hypoalbuminemia lowers total but not ionized calcium",
          "Measure ionized calcium directly when albumin or pH is abnormal",
        ],
      },
      {
        title: "Effect of pH on ionized calcium",
        points: [
          "Alkalosis increases protein binding and lowers ionized calcium",
          "Hyperventilation in an anxious dental patient can cause perioral tingling and carpopedal spasm",
          "Acidosis has the opposite effect",
        ],
      },
    ],
  },
  {
    title: "Intestinal absorption and renal handling",
    relevance: "Malabsorption and renal disease are common hidden causes of poor bone quality in elderly edentulous patients.",
    subtopics: [
      {
        title: "Intestinal absorption",
        points: [
          "Active transcellular transport in the duodenum via TRPV6, calbindin and PMCA1b is vitamin D dependent",
          "Passive paracellular absorption predominates when intake is high",
          "Phytates and oxalates reduce absorption",
          "Absorption efficiency declines with age",
        ],
        cite: ["vitamin d"],
      },
      {
        title: "Renal handling of calcium",
        points: [
          "About 65% is reabsorbed passively in the proximal tubule",
          "About 20–25% is reabsorbed in the thick ascending limb, regulated by the CaSR",
          "Distal convoluted tubule fine-tunes reabsorption under PTH via TRPV5",
          "Thiazides reduce and loop diuretics increase urinary calcium",
        ],
        cite: ["calcium-sensing receptor"],
      },
    ],
  },
  {
    title: "PTH, vitamin D, calcitonin, FGF23 and the calcium-sensing receptor",
    relevance: "Hormonal control explains why parathyroid, renal and vitamin D disorders show up in the jaws.",
    subtopics: [
      {
        title: "Parathyroid hormone regulation",
        points: [
          "Secreted within minutes of a fall in ionized calcium sensed by the CaSR",
          "Increases bone resorption indirectly via osteoblast RANKL expression",
          "Increases distal tubular calcium reabsorption and renal 1α-hydroxylase activity",
          "Intermittent PTH is anabolic; continuous excess is catabolic",
        ],
        cite: ["parathyroid", "rankl"],
      },
      {
        title: "Vitamin D axis",
        points: [
          "Cholecalciferol is synthesized in skin under UVB or obtained from diet",
          "Hepatic 25-hydroxylation gives 25(OH)D — the best marker of vitamin D status",
          "Renal 1α-hydroxylation gives calcitriol, the active hormone",
          "Calcitriol increases intestinal calcium and phosphate absorption",
        ],
        cite: ["vitamin d"],
      },
      {
        title: "Calcitonin",
        points: [
          "Secreted by thyroid parafollicular C cells in response to hypercalcemia",
          "Directly inhibits osteoclast activity",
          "Has a minor physiological role in adult humans",
        ],
      },
      {
        title: "FGF23 and Klotho",
        points: [
          "Secreted by osteocytes in response to phosphate and calcitriol",
          "Promotes phosphaturia and suppresses 1α-hydroxylase",
          "Elevated in chronic kidney disease, contributing to mineral-bone disorder",
        ],
        cite: ["fgf23"],
      },
      {
        title: "Calcium-sensing receptor (CaSR)",
        points: [
          "G-protein–coupled receptor on parathyroid chief cells and renal tubule",
          "Sets the PTH–calcium set point",
          "Target of calcimimetic drugs such as cinacalcet",
        ],
        cite: ["calcium-sensing receptor"],
      },
    ],
  },
  {
    title: "Calcium–phosphate relationship",
    relevance: "Calcium-phosphate chemistry underpins both natural bone mineral and grafting biomaterials.",
    subtopics: [
      {
        title: "Reciprocal regulation of calcium and phosphate",
        points: [
          "The calcium × phosphate product governs mineral precipitation",
          "PTH lowers serum phosphate; calcitriol raises both calcium and phosphate",
          "FGF23 links phosphate handling to vitamin D metabolism",
        ],
        cite: ["fgf23"],
      },
      {
        title: "Hydroxyapatite chemistry",
        points: [
          "Ca10(PO4)6(OH)2 is the mineral phase of bone, dentin and enamel",
          "Carbonate and fluoride substitution alter solubility",
          "Stoichiometric hydroxyapatite has a Ca:P molar ratio of about 1.67",
        ],
        cite: ["bioceramics"],
      },
    ],
  },
  {
    title: "Bone cells and bone remodeling",
    relevance: "Remodeling biology determines how the edentulous ridge and peri-implant bone respond to load.",
    subtopics: [
      {
        title: "Bone cells",
        points: [
          "Osteoblasts — mesenchymal origin, synthesize osteoid",
          "Osteocytes — mechanosensors that regulate remodeling via sclerostin and RANKL",
          "Osteoclasts — multinucleated cells of haematopoietic origin that resorb bone",
          "Bone lining cells cover quiescent bone surfaces",
        ],
        cite: ["rankl", "bone remodeling"],
      },
      {
        title: "Remodeling cycle",
        points: [
          "Activation → resorption → reversal → formation → mineralization → quiescence",
          "The basic multicellular unit couples resorption to formation",
          "A full remodeling cycle takes several months",
        ],
        cite: ["bone remodeling", "mechanostat"],
      },
      {
        title: "Mechanical regulation: the mechanostat",
        points: [
          "Frost's mechanostat: strain thresholds govern modeling versus disuse remodeling",
          "Loss of functional load after extraction tips the balance toward resorption",
          "Physiological implant loading helps preserve crestal bone",
        ],
        cite: ["mechanostat"],
      },
    ],
  },
  {
    title: "RANK/RANKL/OPG and mineralization",
    relevance: "The RANKL/OPG balance links inflammation, hormones and antiresorptive drugs to jaw bone.",
    subtopics: [
      {
        title: "RANK–RANKL–OPG axis",
        points: [
          "RANKL from osteoblasts and osteocytes binds RANK on osteoclast precursors",
          "Osteoprotegerin (OPG) is a decoy receptor that blocks RANKL",
          "The RANKL/OPG ratio determines the rate of resorption",
          "PTH, inflammation and glucocorticoids raise the RANKL/OPG ratio",
        ],
        cite: ["rankl", "osteoprotegerin"],
      },
      {
        title: "Mineralization of bone matrix",
        points: [
          "Matrix vesicles initiate hydroxyapatite nucleation",
          "Alkaline phosphatase removes pyrophosphate, a mineralization inhibitor",
          "Primary mineralization is rapid; secondary mineralization continues for months",
        ],
      },
      {
        title: "Therapeutic targeting of resorption",
        points: [
          "Denosumab is a monoclonal antibody against RANKL",
          "Bisphosphonates inhibit osteoclast function",
          "Both carry a risk of medication-related osteonecrosis of the jaw (MRONJ)",
        ],
        cite: ["mronj", "osteonecrosis"],
      },
    ],
  },
  {
    title: "Hypocalcemia, hypercalcemia and metabolic disorders",
    relevance: "Several metabolic bone diseases have characteristic oral and denture-related presentations.",
    subtopics: [
      {
        title: "Hypocalcemia",
        points: [
          "Causes include hypoparathyroidism, vitamin D deficiency, CKD and hypomagnesemia",
          "Signs: perioral paresthesia, Chvostek and Trousseau signs, tetany",
          "Developmental hypocalcemia can cause enamel hypoplasia",
        ],
        cite: ["vitamin d"],
      },
      {
        title: "Hypercalcemia",
        points: [
          "Primary hyperparathyroidism and malignancy account for most cases",
          "Classic features: 'bones, stones, groans and psychic moans'",
          "Hyperparathyroidism may show brown tumours and loss of lamina dura",
        ],
        cite: ["parathyroid"],
      },
      {
        title: "Other metabolic bone diseases",
        points: [
          "Rickets and osteomalacia — defective mineralization",
          "Renal osteodystrophy in chronic kidney disease",
          "Paget disease — hypercementosis and jaw enlargement causing ill-fitting dentures",
        ],
      },
    ],
  },
  {
    title: "Osteoporosis and systemic factors affecting bone",
    relevance: "Osteoporosis and its drugs directly affect ridge resorption, implant planning and surgical risk.",
    subtopics: [
      {
        title: "Osteoporosis",
        points: [
          "Low bone mass with microarchitectural deterioration",
          "Diagnosed by DXA with a T-score of −2.5 or lower",
          "Estrogen deficiency after menopause increases RANKL-driven resorption",
        ],
        cite: ["rankl"],
      },
      {
        title: "Jaw bone in osteoporosis",
        points: [
          "Associations with reduced mandibular cortical width and ridge resorption are reported but inconsistent",
          "Panoramic cortical indices may support opportunistic screening",
          "Osteoporosis alone is not an absolute contraindication to implants",
        ],
        cite: ["residual ridge"],
      },
      {
        title: "Systemic modifiers of bone",
        points: [
          "Diabetes, smoking, glucocorticoids, thyroid disease and CKD",
          "Antiresorptive and anti-angiogenic drugs carry MRONJ risk",
          "Nutrition, vitamin D status and age",
        ],
        cite: ["mronj"],
      },
    ],
  },
  {
    title: "Alveolar bone and residual ridge resorption",
    relevance: "Residual ridge resorption is the central biological problem of complete denture prosthodontics.",
    specialtyOnly: "Prosthodontics",
    subtopics: [
      {
        title: "Alveolar bone after tooth loss",
        points: [
          "Alveolar bone is tooth-dependent — it forms with eruption and resorbs after loss",
          "Bundle bone lining the socket is lost early after extraction",
          "The thin buccal plate in the anterior maxilla is most vulnerable",
        ],
        cite: ["extraction"],
      },
      {
        title: "Residual ridge resorption as a disease entity",
        points: [
          "Atwood described RRR as chronic, progressive, irreversible and cumulative",
          "The mandibular ridge resorbs faster than the maxillary ridge (Tallgren)",
          "Most dimensional change occurs within the first months after extraction",
        ],
        cite: ["residual ridge"],
      },
      {
        title: "Factors in residual ridge resorption",
        points: [
          "Atwood grouped factors as anatomic, metabolic, functional and prosthetic",
          "Systemic calcium, vitamin D status and osteoporosis act as metabolic factors",
          "Ill-fitting dentures and parafunction increase load-related resorption",
        ],
        cite: ["residual ridge"],
      },
      {
        title: "Prosthodontic management of the resorbing ridge",
        points: [
          "Socket and ridge preservation at extraction",
          "Implant-retained overdentures help preserve the anterior mandible",
          "Regular relining and occlusal review",
        ],
        cite: ["extraction", "osseointegration"],
      },
    ],
  },
  {
    title: "Implant osseointegration and bone healing",
    relevance: "Osseointegration is calcium-driven bone biology applied to an implant surface.",
    subtopics: [
      {
        title: "Osseointegration",
        points: [
          "Direct structural and functional connection between bone and the implant surface (Brånemark)",
          "Primary stability is mechanical; secondary stability is biological",
          "A stability dip occurs at around weeks 2–4 as resorption precedes new bone formation",
        ],
        cite: ["osseointegration"],
      },
      {
        title: "Peri-implant endosseous healing",
        points: [
          "Osteoconduction, de novo bone formation and remodeling (Davies)",
          "Contact versus distance osteogenesis",
          "Microrough surfaces enhance osteogenic cell attachment",
        ],
        cite: ["peri-implant"],
      },
      {
        title: "Metabolic factors in osseointegration",
        points: [
          "Vitamin D deficiency has been associated with early implant failure in some studies",
          "Uncontrolled diabetes and smoking impair healing",
          "Antiresorptive therapy requires MRONJ risk assessment before surgery",
        ],
        cite: ["vitamin d", "mronj"],
      },
    ],
  },
  {
    title: "Calcium-phosphate biomaterials and grafts",
    relevance: "Graft and coating choice is a daily prosthodontic decision rooted in calcium-phosphate science.",
    subtopics: [
      {
        title: "Calcium-phosphate ceramics",
        points: [
          "Hydroxyapatite — osteoconductive and slowly resorbing",
          "β-tricalcium phosphate — resorbs faster",
          "Biphasic calcium phosphate balances scaffold persistence and replacement",
        ],
        cite: ["bioceramics"],
      },
      {
        title: "Bone graft categories",
        points: [
          "Autograft — osteogenic, osteoinductive and osteoconductive",
          "Allograft and xenograft (deproteinized bovine bone)",
          "Alloplasts — synthetic calcium phosphates and bioactive glass",
        ],
        cite: ["bioceramics"],
      },
      {
        title: "Calcium-phosphate implant coatings",
        points: [
          "HA and calcium-phosphate coatings aim to accelerate early bone apposition",
          "Coating delamination is a long-term concern",
          "Ion-releasing bioactive surfaces are an active research direction",
        ],
        cite: ["osseointegration"],
      },
    ],
  },
  {
    title: "Clinical implications for prosthodontic patients",
    relevance: "Turns metabolic biology into history-taking, treatment planning and maintenance decisions.",
    specialtyOnly: "Prosthodontics",
    subtopics: [
      {
        title: "Medical history and assessment",
        points: [
          "Screen for osteoporosis, CKD, parathyroid/thyroid disease and malabsorption",
          "Review medications: bisphosphonates, denosumab, steroids, anticonvulsants",
          "Consider serum calcium, vitamin D and HbA1c in collaboration with the physician",
        ],
        cite: ["mronj"],
      },
      {
        title: "Treatment planning decisions",
        points: [
          "Favour ridge preservation at the time of extraction",
          "Choose implant-supported options where bone quality and medical status permit",
          "Use a conservative surgical approach in patients on antiresorptives",
        ],
        cite: ["extraction", "mronj"],
      },
      {
        title: "Maintenance of the prosthodontic patient",
        points: [
          "Recall for reline or rebase as the ridge resorbs",
          "Monitor peri-implant bone radiographically",
          "Counsel elderly denture wearers on calcium and vitamin D intake",
        ],
        cite: ["residual ridge"],
      },
    ],
  },
  {
    title: "Recent literature, controversies and future directions",
    relevance: "Highlights where current evidence is still evolving for implant and denture patients.",
    subtopics: [
      {
        title: "Current debates",
        points: [
          "Role of vitamin D supplementation in implant success",
          "Strength of the association between osteoporosis and ridge resorption",
          "Drug holidays for antiresorptives before oral surgery",
        ],
        cite: ["mronj", "vitamin d"],
      },
      {
        title: "Emerging science",
        points: [
          "Osteocyte signalling and anti-sclerostin therapy",
          "Bioactive and ion-doped calcium-phosphate materials",
          "Digital monitoring of ridge change with CBCT and intraoral scanning",
        ],
      },
    ],
  },
  {
    title: "Conclusion and clinical takeaways",
    relevance: "Consolidates the biology into decisions a prosthodontist makes chairside.",
    subtopics: [
      {
        title: "Take-home messages",
        points: [
          "Calcium homeostasis is tightly regulated by PTH, vitamin D and FGF23",
          "Bone remodeling links systemic calcium balance to alveolar bone",
          "Residual ridge resorption and osseointegration are expressions of the same biology",
          "Screen, collaborate and plan prosthodontic care around metabolic status",
        ],
      },
    ],
  },
];

export function isCalciumBenchmark(topic: string) {
  return /calcium\s+(metabolism|homeostasis)/i.test(topic);
}
