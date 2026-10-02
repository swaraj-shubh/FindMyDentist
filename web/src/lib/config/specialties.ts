// Specialty intelligence layer (blueprint §8): how each specialty approaches a topic.
export const SPECIALTIES = [
  {
    name: "Prosthodontics",
    short: "Prostho",
    patientLabel: "Crowns, dentures & implants",
    emphasis: ["occlusion", "complete dentures", "implant prosthodontics", "biomaterials", "esthetics", "edentulous ridge", "digital workflow"],
  },
  {
    name: "Periodontics",
    short: "Perio",
    patientLabel: "Gum care",
    emphasis: ["periodontal tissues", "inflammation", "regeneration", "bone loss", "mucogingival considerations", "implant maintenance"],
  },
  {
    name: "Orthodontics",
    short: "Ortho",
    patientLabel: "Braces & aligners",
    emphasis: ["growth", "biomechanics", "tooth movement", "anchorage", "craniofacial development"],
  },
  {
    name: "Oral Surgery",
    short: "OMFS",
    patientLabel: "Extractions & surgery",
    emphasis: ["surgical anatomy", "indications", "complications", "healing", "anesthesia", "perioperative management"],
  },
  {
    name: "Conservative Dentistry & Endodontics",
    short: "Endo",
    patientLabel: "Fillings & root canals",
    emphasis: ["pulp biology", "caries", "adhesive dentistry", "irrigation", "obturation", "restorative outcomes"],
  },
  {
    name: "Oral Medicine",
    short: "Oral Med",
    patientLabel: "Ulcers, patches & oral disease",
    emphasis: ["systemic disease", "oral manifestations", "diagnosis", "differential diagnosis", "medical management"],
  },
  {
    name: "Oral Pathology",
    short: "Path",
    patientLabel: "Lab diagnosis",
    emphasis: ["histopathology", "molecular mechanisms", "differential diagnosis", "disease classification"],
  },
  {
    name: "Pediatric Dentistry",
    short: "Pedo",
    patientLabel: "Children's dentistry",
    emphasis: ["growth", "development", "behavior management", "prevention", "primary dentition", "special needs"],
  },
  {
    name: "Public Health Dentistry",
    short: "PHD",
    patientLabel: "Community dental health",
    emphasis: ["epidemiology", "prevention", "programs", "access", "population-level evidence"],
  },
] as const;

export type SpecialtyName = (typeof SPECIALTIES)[number]["name"];

export const SPECIALTY_NAMES = SPECIALTIES.map((s) => s.name) as SpecialtyName[];

export function getSpecialty(name: string) {
  return SPECIALTIES.find((s) => s.name === name) ?? SPECIALTIES[0];
}
