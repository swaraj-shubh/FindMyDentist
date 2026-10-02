// Regenerates /data/*.csv with demo data dated relative to today.
// Run: npm run seed   (also resets everything the app has written)
// All people, phone numbers and clinical details are fictional.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { stringify } from "csv-stringify/sync";
import { encodeRow } from "../src/lib/server/csv/parser.ts";
import { buildBlueprint, buildSlides, buildViva, runQc } from "../src/lib/server/services/academic-engine.ts";
import type { AcademicProject, Paper } from "../src/types/academic.ts";

const DATA = path.join(import.meta.dirname, "..", "data");
mkdirSync(DATA, { recursive: true });

function write(name: string, rows: object[]) {
  const encoded = rows.map(encodeRow);
  const header = [...new Set(encoded.flatMap((r) => Object.keys(r)))];
  writeFileSync(path.join(DATA, `${name}.csv`), stringify([header, ...encoded.map((r) => header.map((h) => r[h] ?? ""))]));
  console.log(`  ${name.padEnd(20)} ${rows.length} rows`);
}

// Deterministic PRNG so every seed run produces the same shape of data.
let state = 42;
const rand = () => ((state = (state * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const TODAY = new Date();
const day = (offset: number) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + offset);
  return iso(d);
};
const stamp = (offset: number, hh = 10, mm = 0) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + offset);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
};
const isSunday = (offset: number) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + offset);
  return d.getDay() === 0;
};

// ─── Clinics ────────────────────────────────────────────────────────────────
const clinics = [
  { id: "c001", slug: "smilecare-indiranagar", name: "SmileCare Dental Studio", address: "12, 100 Feet Road, Indiranagar", city: "Bengaluru", lat: 12.9719, lng: 77.6412, chairs: 4, description: "A calm, design-led studio for implants, prosthodontics, endodontics and gum care — with digital scans and same-day crowns." },
  { id: "c002", slug: "root-and-crown-koramangala", name: "Root & Crown Dental", address: "45, 5th Block, Koramangala", city: "Bengaluru", lat: 12.9352, lng: 77.6245, chairs: 3, description: "Orthodontics and oral surgery under one roof, known for clear aligner and wisdom tooth care." },
  { id: "c003", slug: "brightbite-jubilee-hills", name: "BrightBite Orthodontic Centre", address: "Road No. 36, Jubilee Hills", city: "Hyderabad", lat: 17.4326, lng: 78.4071, chairs: 3, description: "Specialist orthodontic and restorative centre with a dedicated aligner lab." },
  { id: "c004", slug: "seaside-bandra", name: "Seaside Dental Care", address: "Hill Road, Bandra West", city: "Mumbai", lat: 19.0596, lng: 72.8295, chairs: 3, description: "Full-mouth rehabilitation and periodontal care by the sea." },
  { id: "c005", slug: "marina-smiles-adyar", name: "Marina Smiles", address: "LB Road, Adyar", city: "Chennai", lat: 13.0012, lng: 80.2565, chairs: 2, description: "Oral medicine and conservative dentistry with a focus on early diagnosis." },
  { id: "c006", slug: "capital-dental-hauz-khas", name: "Capital Dental Surgery", address: "Aurobindo Marg, Hauz Khas", city: "Delhi", lat: 28.5494, lng: 77.2001, chairs: 3, description: "Oral & maxillofacial surgery and children's dentistry in South Delhi." },
  { id: "c007", slug: "little-teeth-hsr", name: "Little Teeth Kids Dental", address: "27th Main, HSR Layout", city: "Bengaluru", lat: 12.9116, lng: 77.6473, chairs: 2, description: "A playful, child-first practice for prevention, sealants and gentle treatment." },
].map((c, i) => ({
  ...c,
  phone: `+91 80000 1000${i}`,
  email: `hello@${c.slug.split("-")[0]}.example`,
  image: "",
  verified: i !== 4,
  openTime: "09:00",
  closeTime: i === 6 ? "18:00" : "20:00",
  dentistCount: 0,
  amenities: pick([["Digital X-ray", "Wheelchair access", "Parking", "Card & UPI"], ["CBCT", "Intraoral scanner", "Card & UPI"], ["Kids corner", "Digital X-ray", "Parking"]]),
}));

// ─── Dentists & users ───────────────────────────────────────────────────────
const D = (
  id: string, name: string, gender: "female" | "male", specialty: string, clinicId: string, experience: number, rating: number,
  fee: number, languages: string[], services: string[], bio: string,
) => ({ id, name, gender, specialty, clinicId, experience, rating, consultationFee: fee, languages, services, bio });

const dentistSeeds = [
  D("d001", "Dr. Arjun Mehta", "male", "Prosthodontics", "c001", 12, 4.9, 800, ["English", "Hindi", "Kannada"], ["Dental implants", "Crowns & bridges", "Complete dentures", "Full-mouth rehabilitation"], "Prosthodontist focused on implant-supported restorations and digital smile design. Believes every patient deserves to understand their options before treatment starts."),
  D("d002", "Dr. Neha Kulkarni", "female", "Conservative Dentistry & Endodontics", "c001", 9, 4.8, 700, ["English", "Marathi", "Hindi"], ["Root canal treatment", "Tooth-coloured fillings", "Tooth sensitivity", "Re-treatment"], "Endodontist with a microscope-first approach to saving natural teeth. Calm, unhurried root canals are her speciality."),
  D("d003", "Dr. Rohan Iyer", "male", "Periodontics", "c001", 7, 4.7, 650, ["English", "Tamil", "Kannada"], ["Bleeding gums", "Deep cleaning", "Gum surgery", "Implant maintenance"], "Periodontist helping patients keep healthy gums for life — and making deep cleanings far less dreaded."),
  D("d004", "Dr. Sana Qureshi", "female", "Orthodontics", "c002", 10, 4.9, 900, ["English", "Hindi", "Urdu"], ["Braces", "Clear aligners", "Retainers", "Adult orthodontics"], "Orthodontist specialising in clear aligners for adults and early interceptive treatment for children."),
  D("d005", "Dr. Vikram Reddy", "male", "Oral Surgery", "c002", 15, 4.8, 1000, ["English", "Telugu", "Kannada"], ["Wisdom tooth removal", "Bone grafting", "Jaw surgery", "Facial trauma"], "Oral & maxillofacial surgeon with fifteen years of experience in complex extractions and implant site development."),
  D("d006", "Dr. Meera Pillai", "female", "Pediatric Dentistry", "c007", 8, 4.9, 600, ["English", "Malayalam", "Kannada"], ["First dental visit", "Sealants", "Fluoride care", "Kids' fillings"], "Paediatric dentist who turns check-ups into adventures. Special interest in children with special healthcare needs."),
  D("d007", "Dr. Karthik Rao", "male", "Orthodontics", "c003", 11, 4.8, 850, ["English", "Telugu", "Hindi"], ["Braces", "Clear aligners", "Jaw growth modification"], "Orthodontist and aligner educator focused on predictable, efficient tooth movement."),
  D("d008", "Dr. Lakshmi Varma", "female", "Conservative Dentistry & Endodontics", "c003", 6, 4.6, 600, ["English", "Telugu"], ["Root canal treatment", "Inlays & onlays", "Cosmetic bonding"], "Restorative dentist who loves minimally invasive, natural-looking repairs."),
  D("d009", "Dr. Farhan Shaikh", "male", "Prosthodontics", "c004", 14, 4.7, 950, ["English", "Hindi", "Marathi"], ["Veneers", "Implants", "Smile makeovers", "Dentures"], "Prosthodontist known for full-mouth rehabilitation and natural-looking veneers."),
  D("d010", "Dr. Isha Desai", "female", "Periodontics", "c004", 9, 4.8, 700, ["English", "Gujarati", "Hindi"], ["Gum treatment", "Laser gum therapy", "Gum grafts"], "Periodontist and passionate patient educator on the link between gum health and overall health."),
  D("d011", "Dr. Arvind Subramanian", "male", "Oral Medicine", "c005", 18, 4.7, 800, ["English", "Tamil"], ["Mouth ulcers", "Oral lesions", "Burning mouth", "Oral cancer screening"], "Oral medicine specialist focused on early diagnosis of oral lesions and medically complex patients."),
  D("d012", "Dr. Divya Krishnan", "female", "Conservative Dentistry & Endodontics", "c005", 5, 4.5, 550, ["English", "Tamil", "Malayalam"], ["Fillings", "Root canal treatment", "Whitening"], "Young endodontist with a gentle touch and a love of conservative, tooth-saving care."),
  D("d013", "Dr. Aditya Malhotra", "male", "Oral Surgery", "c006", 12, 4.8, 1100, ["English", "Hindi", "Punjabi"], ["Wisdom tooth removal", "Implants", "Jaw fractures"], "Maxillofacial surgeon with a focus on day-care oral surgery and fast recovery."),
  D("d014", "Dr. Ritu Bansal", "female", "Pediatric Dentistry", "c006", 10, 4.9, 650, ["English", "Hindi"], ["Kids' dentistry", "Habit breaking", "Space maintainers"], "Paediatric dentist helping children build lifelong habits — without fear."),
];

const QUAL: Record<string, string> = {
  Prosthodontics: "BDS, MDS (Prosthodontics & Crown and Bridge)",
  "Conservative Dentistry & Endodontics": "BDS, MDS (Conservative Dentistry & Endodontics)",
  Periodontics: "BDS, MDS (Periodontology)",
  Orthodontics: "BDS, MDS (Orthodontics & Dentofacial Orthopaedics)",
  "Oral Surgery": "BDS, MDS (Oral & Maxillofacial Surgery)",
  "Pediatric Dentistry": "BDS, MDS (Paediatric & Preventive Dentistry)",
  "Oral Medicine": "BDS, MDS (Oral Medicine & Radiology)",
};
const COLLEGES = ["Government Dental College, Bengaluru", "Manipal College of Dental Sciences", "Nair Hospital Dental College, Mumbai", "Saveetha Dental College, Chennai", "Maulana Azad Institute of Dental Sciences, Delhi", "Government Dental College, Hyderabad"];
const slug = (s: string) => s.toLowerCase().replace(/^dr\.?\s+/, "dr-").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const dentists = dentistSeeds.map((d, i) => {
  const clinic = clinics.find((c) => c.id === d.clinicId)!;
  clinic.dentistCount++;
  return {
    id: d.id,
    userId: i === 0 ? "u002" : `u1${pad(i)}`,
    slug: slug(d.name),
    name: d.name,
    gender: d.gender,
    specialty: d.specialty,
    qualification: QUAL[d.specialty],
    experience: d.experience,
    clinicId: d.clinicId,
    city: clinic.city,
    bio: d.bio,
    rating: d.rating,
    reviewCount: 40 + Math.floor(rand() * 300),
    verified: i !== 11,
    consultationFee: d.consultationFee,
    profileImage: "",
    followers: 800 + Math.floor(rand() * 24000),
    languages: d.languages,
    education: [`BDS — ${pick(COLLEGES)}`, `MDS — ${pick(COLLEGES)}`],
    services: d.services,
  };
});

const users = [
  { id: "u001", name: "Ananya Rao", email: "ananya@example.com", role: "patient", avatar: "", city: "Bengaluru", specialty: "", clinicId: "", level: "", onboarded: true },
  { id: "u002", name: "Dr. Arjun Mehta", email: "arjun@example.com", role: "dentist", avatar: "", city: "Bengaluru", specialty: "Prosthodontics", clinicId: "c001", level: "", onboarded: true },
  { id: "u003", name: "Priya Sharma", email: "priya@example.com", role: "student", avatar: "", city: "Bengaluru", specialty: "Prosthodontics", clinicId: "", level: "MDS", onboarded: true },
  { id: "u004", name: "Kavya Nair", email: "kavya@example.com", role: "clinic", avatar: "", city: "Bengaluru", specialty: "", clinicId: "c001", level: "", onboarded: true },
  ...dentists.slice(1).map((d) => ({ id: d.userId, name: d.name, email: `${d.slug}@example.com`, role: "dentist", avatar: "", city: d.city, specialty: d.specialty, clinicId: d.clinicId, level: "", onboarded: true })),
];

// ─── Reviews ────────────────────────────────────────────────────────────────
const REVIEW_TEXT = [
  "Explained every option clearly and never rushed me. The treatment was completely painless.",
  "Very professional clinic. Appointment started on time and the follow-up call was a nice touch.",
  "I was terrified of dentists — this was the first visit where I actually felt calm.",
  "Clear pricing up front, no surprises. Highly recommend.",
  "Great with my parents, patient and respectful. The digital scans were impressive.",
  "Fixed a problem two other clinics couldn't. Thorough and kind.",
];
const REVIEWERS = ["Rohit K.", "Shreya M.", "Imran A.", "Lavanya S.", "Gautam P.", "Nisha T.", "Varun D."];
const reviews = dentists.flatMap((d, i) =>
  [0, 1, 2].map((j) => ({ id: `rv${d.id}${j}`, dentistId: d.id, author: REVIEWERS[(i + j) % REVIEWERS.length], rating: j === 2 && i % 3 === 0 ? 4 : 5, text: REVIEW_TEXT[(i * 2 + j) % REVIEW_TEXT.length], date: day(-7 - i * 3 - j * 11) })),
);

// ─── Patients (SmileCare c001 + Ananya's profile) ───────────────────────────
const P = (id: string, name: string, gender: "female" | "male", dob: string, extra: { allergies?: string[]; history?: string[]; userId?: string } = {}) => ({
  id, userId: extra.userId ?? "", clinicId: "c001", name, dob, gender,
  phone: `+91 90000 0${id.slice(1)}`, email: `${name.split(" ")[0].toLowerCase()}@example.com`,
  bloodGroup: pick(["A+", "B+", "O+", "AB+", "O-", "B-"]), emergencyContact: `Family · +91 90000 9${id.slice(1)}`,
  allergies: extra.allergies ?? [], medicalHistory: extra.history ?? [], createdAt: stamp(-200 + Number(id.slice(1)) * 9),
});
const patients = [
  P("p001", "Ananya Rao", "female", "1994-06-12", { userId: "u001", allergies: ["Penicillin"] }),
  P("p002", "Rahul Sharma", "male", "1988-02-03", { history: ["Hypertension (controlled)"] }),
  P("p003", "Sneha Rao", "female", "1996-11-21"),
  P("p004", "Aman Gupta", "male", "1979-07-30", { history: ["Type 2 diabetes"] }),
  P("p005", "Fatima Khan", "female", "1952-03-14", { history: ["Osteoporosis — on alendronate", "Hypertension"] }),
  P("p006", "Vivek Nair", "male", "1985-09-09"),
  P("p007", "Pooja Hegde", "female", "1992-12-01", { allergies: ["Latex"] }),
  P("p008", "Sanjay Patil", "male", "1970-05-17", { history: ["Ex-smoker"] }),
  P("p009", "Deepa Menon", "female", "1983-08-25"),
  P("p010", "Arnav Joshi", "male", "2016-04-02"),
  P("p011", "Gayatri Iyer", "female", "1990-01-19"),
  P("p012", "Mohammed Irfan", "male", "1998-10-07"),
];

// ─── Treatments ─────────────────────────────────────────────────────────────
const S = (label: string, status: "done" | "current" | "pending", offset: number) => ({ label, status, date: status === "pending" ? "" : day(offset) });
const treatments = [
  { id: "t001", patientId: "p001", dentistId: "d002", treatment: "Composite restoration", tooth: "26", status: "completed", startDate: day(-30), completionDate: day(-30), cost: 3500, notes: "Class II composite, sensitivity resolved at review.", warrantyMonths: 12, steps: [S("Consultation", "done", -30), S("X-ray", "done", -30), S("Restoration", "done", -30), S("Review", "done", -16)] },
  { id: "t002", patientId: "p001", dentistId: "d001", treatment: "Implant — lower left first molar", tooth: "36", status: "planned", startDate: day(5), completionDate: "", cost: 45000, notes: "Missing 36 since 2023. CBCT planned at consultation.", warrantyMonths: 60, steps: [S("Consultation", "pending", 5), S("CBCT scan", "pending", 0), S("Implant placement", "pending", 0), S("Crown", "pending", 0)] },
  { id: "t003", patientId: "p001", dentistId: "d003", treatment: "Scaling & polishing", tooth: "Full mouth", status: "completed", startDate: day(-120), completionDate: day(-120), cost: 1500, notes: "Mild gingivitis; oral hygiene instructions given.", warrantyMonths: 0, steps: [S("Examination", "done", -120), S("Scaling", "done", -120)] },
  { id: "t004", patientId: "p002", dentistId: "d002", treatment: "Root canal treatment", tooth: "36", status: "in_progress", startDate: day(-6), completionDate: "", cost: 8500, notes: "Irreversible pulpitis. Access + BMP done.", warrantyMonths: 24, steps: [S("Consultation", "done", -8), S("X-ray", "done", -8), S("Root canal", "current", -6), S("Crown", "pending", 0)] },
  { id: "t005", patientId: "p003", dentistId: "d003", treatment: "Scaling & root planing", tooth: "Full mouth", status: "in_progress", startDate: day(-12), completionDate: "", cost: 6000, notes: "Stage II periodontitis. Quadrants 1–2 complete.", warrantyMonths: 0, steps: [S("Charting", "done", -14), S("Quadrants 1–2", "done", -12), S("Quadrants 3–4", "current", 0), S("Re-evaluation", "pending", 0)] },
  { id: "t006", patientId: "p004", dentistId: "d003", treatment: "Professional cleaning", tooth: "Full mouth", status: "completed", startDate: day(-5), completionDate: day(-5), cost: 1500, notes: "HbA1c reviewed with patient.", warrantyMonths: 0, steps: [S("Examination", "done", -5), S("Cleaning", "done", -5)] },
  { id: "t007", patientId: "p005", dentistId: "d001", treatment: "Complete dentures", tooth: "Upper & lower", status: "in_progress", startDate: day(-21), completionDate: "", cost: 28000, notes: "Severely resorbed mandibular ridge. On bisphosphonates — no surgical option planned.", warrantyMonths: 12, steps: [S("Primary impression", "done", -21), S("Final impression", "done", -14), S("Jaw relation", "current", -2), S("Try-in", "pending", 0), S("Insertion", "pending", 0)] },
  { id: "t008", patientId: "p006", dentistId: "d001", treatment: "Zirconia crown", tooth: "46", status: "completed", startDate: day(-40), completionDate: day(-33), cost: 12000, notes: "Post-RCT crown.", warrantyMonths: 60, steps: [S("Preparation", "done", -40), S("Digital scan", "done", -40), S("Cementation", "done", -33)] },
  { id: "t009", patientId: "p007", dentistId: "d002", treatment: "Teeth whitening", tooth: "Upper & lower", status: "completed", startDate: day(-18), completionDate: day(-18), cost: 9000, notes: "In-office whitening, 2 shades lighter.", warrantyMonths: 0, steps: [S("Shade record", "done", -18), S("Whitening", "done", -18)] },
  { id: "t010", patientId: "p008", dentistId: "d001", treatment: "Implant", tooth: "46", status: "in_progress", startDate: day(-75), completionDate: "", cost: 42000, notes: "Good primary stability (35 Ncm). Osseointegration phase.", warrantyMonths: 60, steps: [S("Implant placement", "done", -75), S("Osseointegration", "current", -75), S("Abutment", "pending", 0), S("Crown", "pending", 0)] },
  { id: "t011", patientId: "p009", dentistId: "d003", treatment: "Flap surgery", tooth: "Upper anterior", status: "planned", startDate: day(9), completionDate: "", cost: 18000, notes: "Persistent 6 mm pockets after SRP.", warrantyMonths: 0, steps: [S("Re-evaluation", "done", -3), S("Surgery", "pending", 0), S("Suture removal", "pending", 0)] },
  { id: "t012", patientId: "p010", dentistId: "d002", treatment: "Pit & fissure sealants", tooth: "16, 26, 36, 46", status: "completed", startDate: day(-25), completionDate: day(-25), cost: 2400, notes: "Excellent cooperation.", warrantyMonths: 12, steps: [S("Examination", "done", -25), S("Sealants", "done", -25)] },
  { id: "t013", patientId: "p011", dentistId: "d002", treatment: "Root canal + crown", tooth: "11", status: "in_progress", startDate: day(-9), completionDate: "", cost: 16000, notes: "Trauma history. RCT complete, crown pending.", warrantyMonths: 24, steps: [S("Root canal", "done", -9), S("Post & core", "current", -1), S("Crown", "pending", 0)] },
  { id: "t014", patientId: "p012", dentistId: "d002", treatment: "Extraction", tooth: "38", status: "completed", startDate: day(-3), completionDate: day(-3), cost: 2500, notes: "Uneventful. Post-op instructions given.", warrantyMonths: 0, steps: [S("Assessment", "done", -3), S("Extraction", "done", -3)] },
].map((t) => ({ ...t, clinicId: "c001" }));

// ─── Appointments ───────────────────────────────────────────────────────────
type Appt = { id: string; patientId: string; dentistId: string; clinicId: string; date: string; time: string; duration: number; status: string; appointmentType: string; reason: string; chair: number; createdAt: string };
const appointments: Appt[] = [];
let apptN = 1;
const addAppt = (a: Omit<Appt, "id" | "clinicId" | "createdAt" | "duration"> & { duration?: number; clinicId?: string }) =>
  appointments.push({ duration: 30, clinicId: "c001", ...a, id: `a${String(apptN++).padStart(4, "0")}`, createdAt: stamp(-10) });

// Today's SmileCare schedule (the clinic dashboard's centrepiece).
const todaySchedule: [string, string, string, string, string, number, string][] = [
  ["09:00", "p002", "d002", "Root canal — second sitting", "procedure", 2, "completed"],
  ["09:30", "p004", "d003", "Diabetes gum review", "follow_up", 3, "completed"],
  ["10:00", "p003", "d003", "Scaling & root planing — Q3/Q4", "procedure", 3, "confirmed"],
  ["10:30", "p005", "d001", "Denture jaw relation", "procedure", 1, "confirmed"],
  ["11:00", "p012", "d002", "Post-extraction review", "follow_up", 2, "no_show"],
  ["11:30", "p011", "d002", "Post & core", "procedure", 2, "confirmed"],
  ["12:00", "p008", "d001", "Implant stability check", "follow_up", 1, "scheduled"],
  ["15:00", "p009", "d003", "Pre-surgery counselling", "in_person", 3, "scheduled"],
  ["16:00", "p006", "d001", "Crown review", "follow_up", 1, "scheduled"],
  ["16:30", "p007", "d002", "Whitening touch-up consult", "in_person", 2, "scheduled"],
  ["17:30", "p010", "d002", "6-month check-up", "in_person", 4, "confirmed"],
];
if (!isSunday(0)) for (const [time, patientId, dentistId, reason, appointmentType, chair, status] of todaySchedule)
  addAppt({ date: day(0), time, patientId, dentistId, reason, appointmentType, chair, status });

// Ananya's own journey.
addAppt({ date: day(-120), time: "11:30", patientId: "p001", dentistId: "d003", reason: "Routine cleaning", appointmentType: "in_person", chair: 3, status: "completed" });
addAppt({ date: day(-30), time: "17:30", patientId: "p001", dentistId: "d002", reason: "Sensitivity to cold — upper left", appointmentType: "in_person", chair: 2, status: "completed" });
addAppt({ date: day(5) , time: "10:30", patientId: "p001", dentistId: "d001", reason: "Implant consultation — missing lower molar", appointmentType: "in_person", chair: 1, status: "confirmed" });

// Background volume for analytics: past 60 days completed, next 14 days booked.
const REASONS = [["Check-up & cleaning", "in_person"], ["Tooth pain", "in_person"], ["Root canal sitting", "procedure"], ["Filling", "procedure"], ["Crown fitting", "procedure"], ["Follow-up", "follow_up"], ["Gum review", "follow_up"], ["Video consultation", "video"]] as const;
const SLOTS = ["09:00", "09:30", "10:00", "11:00", "11:30", "12:30", "15:00", "15:30", "16:30", "17:00", "18:00", "18:30"];
for (let offset = -60; offset <= 14; offset++) {
  if (offset === 0 || isSunday(offset)) continue;
  const n = 3 + Math.floor(rand() * 5);
  const used = new Set<string>();
  for (let k = 0; k < n; k++) {
    const time = pick(SLOTS);
    const dentistId = pick(["d001", "d002", "d003"]);
    if (used.has(time + dentistId)) continue;
    used.add(time + dentistId);
    const [reason, appointmentType] = pick(REASONS);
    const status = offset < 0 ? (rand() < 0.86 ? "completed" : rand() < 0.5 ? "no_show" : "cancelled") : rand() < 0.55 ? "confirmed" : "scheduled";
    addAppt({ date: day(offset), time, patientId: pick(patients.slice(1)).id, dentistId, reason, appointmentType, chair: 1 + Math.floor(rand() * 4), status });
  }
}
// A few bookings at other clinics so FMD Main discovery feels populated.
for (const [dentistId, clinicId] of [["d004", "c002"], ["d005", "c002"], ["d006", "c007"]] as const)
  for (const offset of [1, 2, 3]) if (!isSunday(offset)) addAppt({ date: day(offset), time: "10:30", patientId: "p012", dentistId, clinicId, reason: "Consultation", appointmentType: "in_person", chair: 1, status: "confirmed" });

// ─── Records ────────────────────────────────────────────────────────────────
const R = (id: string, patientId: string, treatmentId: string, recordType: string, title: string, description: string, date: string, doctor: string, appointmentId = "") =>
  ({ id, patientId, appointmentId, treatmentId, recordType, title, description, fileUrl: "", date, doctor, clinic: "SmileCare Dental Studio", visibility: "shared" });
const records = [
  R("r001", "p001", "t003", "diagnosis_note", "Periodontal examination", "Generalised mild gingivitis. BOP 18%. No pockets > 3 mm.", day(-120), "Dr. Rohan Iyer"),
  R("r002", "p001", "t003", "treatment", "Scaling & polishing", "Full-mouth ultrasonic scaling and polishing. Advised soft brush and interdental cleaning.", day(-120), "Dr. Rohan Iyer"),
  R("r003", "p001", "t001", "diagnosis_note", "Sensitivity assessment — 26", "Sharp, short pain to cold on 26. Disto-occlusal caries on bitewing. Pulp vital.", day(-30), "Dr. Neha Kulkarni"),
  R("r004", "p001", "t001", "xray", "Bitewing X-ray — left side", "Radiolucency at distal of 26 approaching but not involving pulp.", day(-30), "Dr. Neha Kulkarni"),
  R("r005", "p001", "t001", "treatment", "Composite restoration — 26", "Class II composite under rubber dam. Occlusion checked.", day(-30), "Dr. Neha Kulkarni"),
  R("r006", "p001", "t001", "prescription", "Prescription", "Desensitising toothpaste (potassium nitrate) twice daily for 4 weeks.", day(-30), "Dr. Neha Kulkarni"),
  R("r007", "p001", "t001", "invoice", "Invoice INV-1001", "Composite restoration ₹3,500 — paid by UPI.", day(-30), "Dr. Neha Kulkarni"),
  R("r008", "p001", "t002", "xray", "OPG — full mouth", "Missing 36 with adequate vertical bone height on 2D. CBCT advised for implant planning.", day(-30), "Dr. Neha Kulkarni"),
  R("r009", "p001", "t001", "treatment", "Review — 26", "Sensitivity resolved. Restoration intact.", day(-16), "Dr. Neha Kulkarni"),
  ...treatments.filter((t) => t.patientId !== "p001").flatMap((t, i) => [
    R(`r1${pad(i)}a`, t.patientId, t.id, "diagnosis_note", `${t.treatment} — assessment`, t.notes, t.steps[0].date || t.startDate, dentists.find((d) => d.id === t.dentistId)!.name),
    R(`r1${pad(i)}b`, t.patientId, t.id, i % 2 ? "photo" : "xray", i % 2 ? "Intraoral photographs" : `IOPA X-ray — ${t.tooth}`, "Uploaded at chairside.", t.steps[0].date || t.startDate, dentists.find((d) => d.id === t.dentistId)!.name),
  ]),
];

// ─── Bills ──────────────────────────────────────────────────────────────────
const PRICES: Record<string, number> = { "Check-up & cleaning": 1500, "Tooth pain": 800, "Root canal sitting": 4500, Filling: 2500, "Crown fitting": 9000, "Follow-up": 0, "Gum review": 700, "Video consultation": 500 };
let inv = 1001;
const bill = (patientId: string, appointmentId: string, date: string, items: { description: string; qty: number; price: number }[], status: string, discount = 0) => {
  const subtotal = items.reduce((a, it) => a + it.qty * it.price, 0);
  const tax = 0; // Healthcare services are GST-exempt; field kept for cosmetic items.
  return { id: `b${inv}`, patientId, clinicId: "c001", appointmentId, invoiceNumber: `INV-${inv++}`, items, subtotal, discount, tax, total: subtotal - discount + tax, status, date, paidAt: status === "paid" ? `${date}T18:00:00` : "", paymentMethod: status === "paid" ? pick(["UPI", "Card", "Cash"]) : "" };
};
const ananyaFilling = appointments.find((a) => a.patientId === "p001" && a.dentistId === "d002")!.id;
const bills = [bill("p001", ananyaFilling, day(-30), [{ description: "Composite restoration — 26", qty: 1, price: 3500 }], "paid")];
for (const a of appointments.filter((a) => a.clinicId === "c001" && a.status === "completed" && a.patientId !== "p001")) {
  const price = PRICES[a.reason] ?? (a.appointmentType === "procedure" ? 4500 : 800);
  if (!price) continue;
  const age = (new Date(a.date).getTime() - TODAY.getTime()) / 86400000;
  const status = age >= 0 ? "paid" : age > -10 ? (rand() < 0.5 ? "pending" : "paid") : age > -30 && rand() < 0.12 ? "overdue" : "paid";
  bills.push(bill(a.patientId, a.id, a.date, [{ description: a.reason, qty: 1, price }, ...(rand() < 0.3 ? [{ description: "IOPA X-ray", qty: 1, price: 300 }] : [])], status, rand() < 0.15 ? 200 : 0));
}

// ─── Messages ───────────────────────────────────────────────────────────────
const M = (patientId: string, sender: "patient" | "clinic", body: string, offsetMin: number, read = true) =>
  ({ id: `m${patientId}${offsetMin}`, clinicId: "c001", patientId, sender, body, createdAt: new Date(TODAY.getTime() - offsetMin * 60000).toISOString(), read });
const messages = [
  M("p002", "clinic", "Hi Rahul, reminder for your root canal sitting tomorrow at 9:00 AM with Dr. Neha.", 1500),
  M("p002", "patient", "Thanks! Should I eat before coming?", 1440),
  M("p002", "clinic", "Yes, please have a light meal — you'll be numb for a few hours afterwards.", 1430),
  M("p005", "patient", "My daughter will bring me for the denture appointment. Can she come inside?", 300, false),
  M("p003", "patient", "Is it normal for gums to feel sore after the deep cleaning?", 90, false),
  M("p001", "clinic", "Hi Ananya, your implant consultation with Dr. Arjun is confirmed. Please bring your OPG report.", 2900),
  M("p001", "patient", "Will do. Is CBCT done the same day?", 2880),
  M("p008", "patient", "The implant site feels fine. Can I chew on that side now?", 45, false),
  M("p011", "clinic", "Your post & core appointment is today at 11:30 AM.", 600),
];

// ─── Content ────────────────────────────────────────────────────────────────
const post = (id: string, authorId: string, title: string, caption: string, body: string, contentType: string, specialty: string, tags: string[], likes: number, comments: number, offsetH: number, pollOptions: { label: string; votes: number }[] = []) =>
  ({ id, authorId, authorType: "dentist", title, caption, body, contentType, mediaUrl: "", specialty, tags, likes, likedBy: [], comments, pollOptions, createdAt: new Date(TODAY.getTime() - offsetH * 3600000).toISOString() });
const posts = [
  post("po01", "d004", "3 things to know before braces", "Thinking about braces or aligners? Start here.", "1. Your gums need to be healthy first — orthodontic forces on inflamed gums can cause bone loss.\n2. Retainers are forever. Teeth have memory and will try to drift back.\n3. Aligners only work if you wear them 20–22 hours a day.\n\nBook a consultation to find out which option suits your bite.", "image", "Orthodontics", ["braces", "aligners", "orthodontics"], 342, 3, 5),
  post("po02", "d002", "Is tooth sensitivity normal?", "That zing when you drink something cold — what it means.", "Short, sharp pain to cold usually comes from exposed dentine — from gum recession, enamel wear or a small cavity. Desensitising toothpaste helps many people within weeks.\n\nSee a dentist if the pain lingers after the cold is gone, wakes you up at night, or is getting worse — these can be signs the nerve is involved.", "article", "Conservative Dentistry & Endodontics", ["sensitivity", "tooth pain"], 518, 2, 20),
  post("po03", "d001", "Implants vs bridges: which is right for you?", "Replacing a missing tooth? Here's the honest comparison.", "A bridge uses the neighbouring teeth as anchors — which means preparing (cutting) them. An implant replaces the root itself and leaves neighbours untouched, and it helps keep the jawbone from shrinking.\n\nImplants take longer (3–6 months) and need enough healthy bone. Bridges are quicker. Your gum health, bone, budget and medical history all shape the right choice.", "article", "Prosthodontics", ["implants", "bridges", "missing tooth"], 276, 2, 30),
  post("po04", "d003", "Why do my gums bleed when I brush?", "Bleeding gums are not normal — but they are very fixable.", "Bleeding is usually the first sign of gingivitis — inflammation caused by plaque along the gumline. The fix is counter-intuitive: keep brushing gently, and clean between teeth daily.\n\nIf bleeding continues beyond two weeks of good cleaning, or your gums are receding, get a periodontal check-up.", "video", "Periodontics", ["gums", "bleeding gums"], 401, 1, 44),
  post("po05", "d006", "Your child's first dental visit", "When to go, and how to make it fun.", "The first visit should happen by the first birthday or within six months of the first tooth. Early visits are short — mostly a lap exam and advice for parents.\n\nTip: avoid words like 'hurt' or 'injection'. Let the dentist introduce the tools as 'tooth counters' and 'tooth tickler'.", "image", "Pediatric Dentistry", ["kids", "first visit"], 623, 1, 60),
  post("po06", "d010", "How often do you change your toothbrush?", "Quick poll — be honest!", "Dentists recommend every 3 months, or sooner if the bristles are frayed.", "poll", "Periodontics", ["toothbrush", "habits"], 188, 0, 72, [{ label: "Every 3 months", votes: 214 }, { label: "Every 6 months", votes: 162 }, { label: "When it looks worn out", votes: 305 }, { label: "Wait, we change them?", votes: 48 }]),
  post("po07", "d005", "Wisdom teeth: remove or keep?", "Not every wisdom tooth needs to come out.", "Healthy, fully erupted wisdom teeth that you can clean don't need removal. Partially erupted or impacted teeth that cause repeated swelling (pericoronitis), decay in the neighbouring tooth, or cysts usually do.\n\nAn OPG X-ray helps your surgeon judge the risk to the nerve before surgery.", "article", "Oral Surgery", ["wisdom tooth", "extraction"], 355, 0, 90),
  post("po08", "d009", "Whitening myths, busted", "Charcoal, lemon and baking soda — please stop.", "Abrasive 'natural' whiteners scratch enamel and make teeth look more yellow over time as dentine shows through. Professional whitening uses controlled peroxide gels that are safe when supervised.\n\nWhitening doesn't change the colour of crowns or fillings — plan replacements after whitening.", "video", "Prosthodontics", ["whitening", "cosmetic"], 467, 0, 110),
  post("po09", "d011", "A mouth ulcer that won't heal", "When should an ulcer worry you?", "Most ulcers heal in 7–14 days. An ulcer, red patch or white patch that hasn't healed in two weeks — especially if you use tobacco — needs an examination. Early diagnosis of oral cancer saves lives, and the check is quick and painless.", "article", "Oral Medicine", ["ulcers", "oral cancer screening"], 512, 0, 130),
  post("po10", "d001", "Grinding your teeth at night?", "Signs of bruxism and how a night guard helps.", "Morning jaw ache, headaches and flattened or chipped teeth are classic signs. A custom night guard protects teeth and restorations; managing stress and sleep quality matters too.", "image", "Prosthodontics", ["bruxism", "night guard"], 233, 0, 160),
  post("po11", "d012", "Root canal isn't as scary as it sounds", "Modern root canals feel like a long filling.", "With good anaesthesia and rotary instruments, most root canals are completed in one or two comfortable sittings. The alternative — extraction — often costs more in the long run once the gap needs replacing.", "article", "Conservative Dentistry & Endodontics", ["root canal", "tooth pain"], 298, 0, 190),
  post("po12", "d014", "Thumb sucking: when to step in", "Most kids stop on their own — here's when to help.", "Thumb sucking is normal in toddlers. If it continues past age 4–5, it can push front teeth forward and affect the bite. Positive reinforcement works better than punishment; a paediatric dentist can suggest habit-breaking aids.", "image", "Pediatric Dentistry", ["kids", "habits"], 205, 0, 220),
];
const comments = [
  { id: "cm01", postId: "po01", authorId: "u001", authorName: "Ananya Rao", body: "Didn't know about the gum health part — very useful!", createdAt: new Date(TODAY.getTime() - 4 * 3600000).toISOString() },
  { id: "cm02", postId: "po01", authorId: "u101", authorName: "Rohit K.", body: "How long does the aligner treatment usually take?", createdAt: new Date(TODAY.getTime() - 3 * 3600000).toISOString() },
  { id: "cm03", postId: "po01", authorId: "u104", authorName: "Dr. Sana Qureshi", body: "@Rohit usually 6–18 months depending on the case.", createdAt: new Date(TODAY.getTime() - 2 * 3600000).toISOString() },
  { id: "cm04", postId: "po02", authorId: "u102", authorName: "Shreya M.", body: "The desensitising toothpaste really worked for me.", createdAt: new Date(TODAY.getTime() - 18 * 3600000).toISOString() },
  { id: "cm05", postId: "po02", authorId: "u001", authorName: "Ananya Rao", body: "Mine turned out to be a small cavity. Glad I got it checked.", createdAt: new Date(TODAY.getTime() - 16 * 3600000).toISOString() },
  { id: "cm06", postId: "po03", authorId: "u103", authorName: "Imran A.", body: "Does insurance usually cover implants?", createdAt: new Date(TODAY.getTime() - 26 * 3600000).toISOString() },
  { id: "cm07", postId: "po03", authorId: "u002", authorName: "Dr. Arjun Mehta", body: "Coverage varies a lot — check whether your plan includes 'prosthetic' dental benefits.", createdAt: new Date(TODAY.getTime() - 25 * 3600000).toISOString() },
  { id: "cm08", postId: "po04", authorId: "u105", authorName: "Lavanya S.", body: "Started flossing daily and the bleeding stopped in a week!", createdAt: new Date(TODAY.getTime() - 40 * 3600000).toISOString() },
  { id: "cm09", postId: "po05", authorId: "u106", authorName: "Gautam P.", body: "'Tooth tickler' — I'm stealing that.", createdAt: new Date(TODAY.getTime() - 55 * 3600000).toISOString() },
];
const reels = [
  ["d004", "Aligner day 1 vs day 180", "Orthodontics", 42], ["d002", "What happens in a root canal (in 30s)", "Conservative Dentistry & Endodontics", 31], ["d003", "The right way to floss", "Periodontics", 28],
  ["d006", "Making the first visit fun", "Pediatric Dentistry", 36], ["d001", "How an implant is placed", "Prosthodontics", 55], ["d009", "Veneer smile makeover", "Prosthodontics", 47],
  ["d005", "Wisdom tooth recovery tips", "Oral Surgery", 39], ["d010", "Electric vs manual brush", "Periodontics", 33], ["d011", "Self-check for mouth cancer", "Oral Medicine", 44],
].map(([authorId, title, specialty, duration], i) => ({ id: `rl${pad(i + 1)}`, authorId, title, specialty, duration, views: 4000 + Math.floor(rand() * 90000), likes: 200 + Math.floor(rand() * 6000), createdAt: stamp(-i - 1) }));
const stories = ["d001", "d004", "d006", "d003", "d010", "d011"].map((authorId, i) => ({ id: `st${i + 1}`, authorId, title: ["Clinic tour", "Aligner tips", "Kids week", "Gum facts", "Brushing myths", "Screening camp"][i], createdAt: stamp(0, 8 + i), expiresAt: stamp(1, 8 + i) }));
const jobs = [
  ["Associate Prosthodontist", "SmileCare Dental Studio", "Bengaluru", "full_time", "2+ years", "Prosthodontics", "₹1.2–1.8 L / month", "Join a digital-first team doing implants, full-mouth rehab and same-day crowns."],
  ["Consultant Endodontist (visiting)", "Root & Crown Dental", "Bengaluru", "part_time", "3+ years", "Conservative Dentistry & Endodontics", "Per case", "Two days a week, microscope available."],
  ["Junior Resident — Oral Surgery", "Capital Dental Surgery", "Delhi", "full_time", "MDS", "Oral Surgery", "₹90k / month", "Day-care OMFS practice with trauma cases."],
  ["Locum Paediatric Dentist", "Little Teeth Kids Dental", "Bengaluru", "locum", "1+ years", "Pediatric Dentistry", "₹6,000 / day", "Cover December holidays; child-friendly team."],
  ["Clinical Intern (BDS)", "Seaside Dental Care", "Mumbai", "internship", "BDS final year / intern", "Prosthodontics", "Stipend", "Rotations across perio and prostho."],
  ["Assistant Professor — Periodontology", "Partner Dental College", "Hyderabad", "faculty", "MDS + 2 years", "Periodontics", "As per DCI norms", "Teaching and research role with clinical posting."],
  ["Orthodontist", "BrightBite Orthodontic Centre", "Hyderabad", "full_time", "3+ years", "Orthodontics", "₹1.5–2.2 L / month", "High-volume aligner practice with in-house lab."],
  ["Oral Medicine Consultant", "Marina Smiles", "Chennai", "part_time", "5+ years", "Oral Medicine", "Per session", "Screening clinics and medically complex patients."],
].map(([title, organization, location, type, experience, specialty, salary, description], i) => ({ id: `j${pad(i + 1)}`, title, organization, location, type, experience, specialty, salary, description, postedAt: stamp(-i * 2 - 1) }));

const notifications = [
  { userId: "u001", type: "appointment", title: "Appointment confirmed", message: `Implant consultation with Dr. Arjun Mehta on ${day(5)} at 10:30 AM.`, href: "/appointments", read: false, createdAt: stamp(-2) },
  { userId: "u001", type: "record", title: "New record added", message: "SmileCare uploaded your OPG X-ray.", href: "/records/r008", read: false, createdAt: stamp(-30, 18) },
  { userId: "u001", type: "community", title: "Dr. Sana Qureshi replied", message: "On “3 things to know before braces”.", href: "/community/po01", read: true, createdAt: stamp(0, 7) },
  { userId: "u002", type: "appointment", title: "11 appointments today", message: "3 are still awaiting confirmation.", href: "/clinic/appointments", read: false, createdAt: stamp(0, 7) },
  { userId: "u002", type: "billing", title: "Overdue invoices", message: "Some invoices are past due — review billing.", href: "/clinic/billing", read: false, createdAt: stamp(-1, 19) },
  { userId: "u004", type: "appointment", title: "New online booking", message: "Ananya Rao booked an implant consultation.", href: "/clinic/appointments", read: false, createdAt: stamp(-2) },
  { userId: "u003", type: "academic", title: "Blueprint ready", message: "Residual Ridge Resorption — review the outline before generating slides.", href: "/academic/studio/ap002", read: false, createdAt: stamp(-1, 21) },
  { userId: "u003", type: "academic", title: "QC review complete", message: "Calcium Metabolism passed academic QC with a few issues to review.", href: "/academic/studio/ap001", read: true, createdAt: stamp(-1, 14) },
].map((n, i) => ({ id: `n${pad(i + 1)}`, ...n }));

// ─── Academic ───────────────────────────────────────────────────────────────
// Landmark papers. Bibliographic details are real; DOIs are only filled where certain,
// and none are marked verified — that is the citation-verification step's job.
const paper = (id: string, authors: string, title: string, journal: string, year: number, vol: string, specialty: string, topic: string, keywords: string[], evidenceType: string, abstract: string, doi = "") =>
  ({ id, title, authors, year, journal, citation: `${authors}. ${title}. ${journal}. ${year};${vol}.`, doi, pubmedId: "", abstract, specialty, topic, keywords, evidenceType, verified: false });
const papers = [
  paper("pp01", "Brånemark PI, Hansson BO, Adell R, et al", "Osseointegrated implants in the treatment of the edentulous jaw. Experience from a 10-year period", "Scand J Plast Reconstr Surg Suppl", 1977, "16:1-132", "Prosthodontics", "Implant osseointegration", ["osseointegration", "implant", "edentulous"], "Landmark clinical study", "Reports a decade of clinical experience with titanium implants anchored directly in bone in edentulous jaws, establishing the clinical concept of osseointegration."),
  paper("pp02", "Albrektsson T, Brånemark PI, Hansson HA, Lindström J", "Osseointegrated titanium implants. Requirements for ensuring a long-lasting, direct bone-to-implant anchorage in man", "Acta Orthop Scand", 1981, "52(2):155-70", "Prosthodontics", "Implant osseointegration", ["osseointegration", "implant", "titanium"], "Landmark review", "Sets out the factors governing osseointegration — implant material, design, surface, bone status, surgical technique and loading conditions."),
  paper("pp03", "Atwood DA", "Reduction of residual ridges: a major oral disease entity", "J Prosthet Dent", 1971, "26(3):266-79", "Prosthodontics", "Residual ridge resorption", ["residual ridge", "resorption", "edentulous", "denture"], "Landmark review", "Describes residual ridge resorption as a chronic, progressive, irreversible and cumulative disease and classifies its anatomic, metabolic, functional and prosthetic factors."),
  paper("pp04", "Tallgren A", "The continuing reduction of the residual alveolar ridges in complete denture wearers: a mixed-longitudinal study covering 25 years", "J Prosthet Dent", 1972, "27(2):120-32", "Prosthodontics", "Residual ridge resorption", ["residual ridge", "resorption", "denture", "longitudinal"], "Longitudinal clinical study", "Follows complete denture wearers over 25 years, showing continuing ridge reduction that is markedly greater in the mandible than the maxilla."),
  paper("pp05", "Schropp L, Wenzel A, Kostopoulos L, Karring T", "Bone healing and soft tissue contour changes following single-tooth extraction: a clinical and radiographic 12-month prospective study", "Int J Periodontics Restorative Dent", 2003, "23(4):313-23", "Periodontics", "Extraction socket healing", ["extraction", "ridge", "socket", "healing"], "Prospective clinical study", "Measures alveolar ridge width and socket bone fill after single-tooth extraction over 12 months; most dimensional change occurred in the first three months."),
  paper("pp06", "Araújo MG, Lindhe J", "Dimensional ridge alterations following tooth extraction. An experimental study in the dog", "J Clin Periodontol", 2005, "32(2):212-8", "Periodontics", "Extraction socket healing", ["extraction", "bundle bone", "ridge", "socket"], "Experimental animal study", "Shows that bundle bone is resorbed after extraction, with greater vertical loss of the thin buccal wall than the lingual wall.", "10.1111/j.1600-051X.2005.00642.x"),
  paper("pp07", "Frost HM", "Bone \"mass\" and the \"mechanostat\": a proposal", "Anat Rec", 1987, "219(1):1-9", "Prosthodontics", "Bone biology", ["mechanostat", "bone remodeling", "mechanical loading"], "Theoretical / landmark", "Proposes that bone mass is regulated by mechanical strain thresholds that switch between modeling and disuse-mode remodeling."),
  paper("pp08", "Lacey DL, Timms E, Tan HL, et al", "Osteoprotegerin ligand is a cytokine that regulates osteoclast differentiation and activation", "Cell", 1998, "93(2):165-76", "Oral Pathology", "Bone remodeling", ["rankl", "osteoclast", "bone remodeling"], "Basic science", "Identifies the ligand for osteoprotegerin (RANKL) as the key cytokine driving osteoclast differentiation and activation."),
  paper("pp09", "Simonet WS, Lacey DL, Dunstan CR, et al", "Osteoprotegerin: a novel secreted protein involved in the regulation of bone density", "Cell", 1997, "89(2):309-19", "Oral Pathology", "Bone remodeling", ["osteoprotegerin", "rankl", "bone density"], "Basic science", "Describes osteoprotegerin, a secreted decoy receptor that inhibits osteoclastogenesis and increases bone density in animal models."),
  paper("pp10", "Brown EM, Gamba G, Riccardi D, et al", "Cloning and characterization of an extracellular Ca2+-sensing receptor from bovine parathyroid", "Nature", 1993, "366(6455):575-80", "Oral Medicine", "Calcium homeostasis", ["calcium-sensing receptor", "parathyroid", "calcium"], "Basic science", "Clones the G-protein–coupled calcium-sensing receptor that lets parathyroid cells detect extracellular calcium and regulate PTH secretion.", "10.1038/366575a0"),
  paper("pp11", "Holick MF", "Vitamin D deficiency", "N Engl J Med", 2007, "357(3):266-81", "Oral Medicine", "Vitamin D", ["vitamin d", "calcium", "bone"], "Narrative review", "Reviews vitamin D sources, metabolism and the skeletal and extra-skeletal consequences of deficiency, with guidance on assessment and treatment.", "10.1056/NEJMra070553"),
  paper("pp12", "Shimada T, Hasegawa H, Yamazaki Y, et al", "FGF-23 is a potent regulator of vitamin D metabolism and phosphate homeostasis", "J Bone Miner Res", 2004, "19(3):429-35", "Oral Medicine", "Phosphate homeostasis", ["fgf23", "phosphate", "vitamin d"], "Experimental study", "Demonstrates that FGF23 reduces serum phosphate and suppresses renal 1α-hydroxylase, linking phosphate regulation to vitamin D metabolism."),
  paper("pp13", "Marx RE", "Pamidronate (Aredia) and zoledronate (Zometa) induced avascular necrosis of the jaws: a growing epidemic", "J Oral Maxillofac Surg", 2003, "61(9):1115-7", "Oral Surgery", "MRONJ", ["osteonecrosis", "bisphosphonate", "mronj"], "Case series / letter", "Early report of exposed necrotic jaw bone in patients receiving intravenous bisphosphonates, alerting clinicians to a new complication."),
  paper("pp14", "Ruggiero SL, Dodson TB, Fantasia J, et al", "American Association of Oral and Maxillofacial Surgeons position paper on medication-related osteonecrosis of the jaw — 2014 update", "J Oral Maxillofac Surg", 2014, "72(10):1938-56", "Oral Surgery", "MRONJ", ["mronj", "osteonecrosis", "antiresorptive", "denosumab"], "Position paper", "Updates terminology to medication-related osteonecrosis of the jaw, with staging, risk estimates and management strategies for patients on antiresorptive and antiangiogenic drugs."),
  paper("pp15", "Davies JE", "Understanding peri-implant endosseous healing", "J Dent Educ", 2003, "67(8):932-49", "Prosthodontics", "Implant osseointegration", ["peri-implant", "osseointegration", "healing", "osteoconduction"], "Narrative review", "Explains peri-implant healing as osteoconduction, de novo bone formation and remodeling, and contrasts contact and distance osteogenesis."),
  paper("pp16", "Hench LL", "Bioceramics: from concept to clinic", "J Am Ceram Soc", 1991, "74(7):1487-510", "Prosthodontics", "Biomaterials", ["bioceramics", "hydroxyapatite", "calcium phosphate", "bioactive glass"], "Narrative review", "Classifies bioceramics as nearly inert, porous, bioactive and resorbable, and reviews their clinical applications including calcium-phosphate materials."),
  paper("pp17", "Tonetti MS, Greenwell H, Kornman KS", "Staging and grading of periodontitis: framework and proposal of a new classification and case definition", "J Periodontol", 2018, "89 Suppl 1:S159-72", "Periodontics", "Periodontal classification", ["periodontitis", "classification", "staging"], "Consensus report", "Introduces the stage-and-grade framework for periodontitis from the 2017 World Workshop.", "10.1002/JPER.18-0006"),
  paper("pp18", "Löe H, Theilade E, Jensen SB", "Experimental gingivitis in man", "J Periodontol", 1965, "36:177-87", "Periodontics", "Gingivitis", ["gingivitis", "plaque", "inflammation"], "Landmark clinical study", "Shows that withdrawing oral hygiene leads to plaque accumulation and gingivitis, which resolves when hygiene is restored."),
  paper("pp19", "Kakehashi S, Stanley HR, Fitzgerald RJ", "The effects of surgical exposures of dental pulps in germ-free and conventional laboratory rats", "Oral Surg Oral Med Oral Pathol", 1965, "20:340-9", "Conservative Dentistry & Endodontics", "Pulp biology", ["pulp", "bacteria", "endodontic"], "Experimental animal study", "Demonstrates that bacteria are required for pulpal and periapical pathology after pulp exposure."),
  paper("pp20", "Angle EH", "Classification of malocclusion", "Dental Cosmos", 1899, "41:248-64", "Orthodontics", "Malocclusion", ["malocclusion", "classification", "occlusion"], "Landmark", "Introduces the molar-relationship classification of malocclusion still used in orthodontics today."),
];
const sources = [
  ["Guyton and Hall Textbook of Medical Physiology", "textbook", "Elsevier", 2020, "Oral Medicine", "Calcium homeostasis"],
  ["Prosthodontic Treatment for Edentulous Patients (Zarb et al.)", "textbook", "Elsevier", 2012, "Prosthodontics", "Complete dentures"],
  ["Lindhe's Clinical Periodontology and Implant Dentistry", "textbook", "Wiley", 2015, "Periodontics", "Periodontology"],
  ["Misch's Contemporary Implant Dentistry", "textbook", "Elsevier", 2020, "Prosthodontics", "Implant dentistry"],
  ["AAOMS Position Paper on MRONJ — 2022 Update", "guideline", "AAOMS", 2022, "Oral Surgery", "MRONJ"],
  ["ICMR-NIN Nutrient Requirements for Indians", "guideline", "ICMR-NIN", 2020, "Public Health Dentistry", "Nutrition"],
  ["FMD Specialty Ontology v0", "fmd_content", "FMD", 2026, "Prosthodontics", "Specialty intelligence"],
].map(([title, sourceType, publisher, year, specialty, topic], i) => ({ id: `src${i + 1}`, title, sourceType, publisher, year, url: "", doi: "", specialty, topic, licenseStatus: sourceType === "fmd_content" ? "owned" : "metadata only" }));

const now = new Date().toISOString();
const projectBase = (p: Partial<AcademicProject> & Pick<AcademicProject, "id" | "title" | "topic" | "slideCount">): AcademicProject => ({
  userId: "u003", kind: "seminar", specialty: "Prosthodontics", level: "MDS", duration: "45–60 min", citationStyle: "Vancouver", status: "generated",
  outline: [], paperIds: [], createdAt: now, updatedAt: now, ...p,
});
const projects = [
  projectBase({ id: "ap001", title: "Calcium Metabolism", topic: "Calcium Metabolism", slideCount: 100, paperIds: ["pp01", "pp03", "pp04", "pp08", "pp11"], createdAt: stamp(-6), updatedAt: stamp(0, 9, 12) }),
  projectBase({ id: "ap002", title: "Residual Ridge Resorption", topic: "Residual Ridge Resorption", slideCount: 60, status: "blueprint", duration: "30–45 min", createdAt: stamp(-1, 20), updatedAt: stamp(-1, 21) }),
  projectBase({ id: "ap003", title: "Shade Selection in Esthetic Dentistry", topic: "Shade Selection", slideCount: 40, duration: "20–30 min", level: "BDS", createdAt: stamp(-14), updatedAt: stamp(-9) }),
];
const slides = [];
const viva = [];
const qc = [];
for (const p of projects) {
  p.outline = buildBlueprint(p);
  if (p.status !== "generated") continue;
  const s = buildSlides(p, papers as Paper[]);
  slides.push(...s);
  viva.push(...buildViva(p, s));
  qc.push(runQc(p, s, papers as Paper[]));
}

console.log(`Seeding ${DATA} (today = ${day(0)})`);
write("users", users);
write("clinics", clinics);
write("dentists", dentists);
write("reviews", reviews);
write("patients", patients);
write("appointments", appointments);
write("treatments", treatments);
write("records", records);
write("bills", bills);
write("messages", messages);
write("posts", posts);
write("comments", comments);
write("reels", reels);
write("stories", stories);
write("jobs", jobs);
write("notifications", notifications);
write("papers", papers);
write("academic_sources", sources);
write("academic_projects", projects);
write("academic_slides", slides);
write("viva_questions", viva);
write("benchmark_results", qc);
