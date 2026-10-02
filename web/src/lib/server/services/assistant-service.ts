// FMD Dental Assistant — prototype of the patient AI workflow (blueprint §3, §13):
// language detection → intent extraction → safety/triage → explanation → specialty → content → dentists.
// Rule-based so the product flow is demonstrable; the response shape is what a real model would return.
import { postsRepo } from "../repositories/posts";
import { getRecommendedDentists } from "./dentist-service";
import type { User } from "@/types/user";

export type Urgency = "routine" | "soon" | "urgent" | "emergency";

interface Intent {
  id: string;
  label: string;
  match: RegExp;
  specialty: string;
  urgency: Urgency;
  summary: string;
  causes: { name: string; likelihood: "Common" | "Possible" | "Less likely"; detail: string }[];
  nextSteps: string[];
  selfCare: string[];
  tags: string[];
}

const INTENTS: Intent[] = [
  {
    id: "sensitivity",
    label: "Tooth sensitivity",
    match: /sensitiv|cold|hot (water|drink|tea|coffee)|sweet|ice cream|zing|shock/i,
    specialty: "Conservative Dentistry & Endodontics",
    urgency: "soon",
    summary: "Short, sharp pain with cold, hot or sweet things usually means the inner layer of the tooth (dentine) is exposed or a small cavity is forming.",
    causes: [
      { name: "Tooth sensitivity (exposed dentine)", likelihood: "Common", detail: "From gum recession, enamel wear or brushing too hard. Pain stops within seconds." },
      { name: "Dental decay (cavity)", likelihood: "Possible", detail: "A cavity near the nerve can react to cold and sweets. Often only visible on an X-ray." },
      { name: "Cracked tooth or worn filling", likelihood: "Less likely", detail: "Pain on biting as well as cold suggests a crack or leaking filling." },
    ],
    nextSteps: ["See a dentist in the next 1–2 weeks", "Ask for a check-up with an X-ray of the area"],
    selfCare: ["Use a desensitising toothpaste twice daily", "Brush gently with a soft brush", "Avoid very acidic drinks for now"],
    tags: ["sensitivity", "tooth pain"],
  },
  {
    id: "toothache",
    label: "Toothache",
    match: /tooth ?ache|tooth (hurts|pain)|molar (hurts|pain)|(teeth|tooth|molar).*(hurt|pain|throb)|throbbing|cavity|decay|pain.*(tooth|teeth|molar)/i,
    specialty: "Conservative Dentistry & Endodontics",
    urgency: "soon",
    summary: "Toothache that lingers, throbs or wakes you at night often means the nerve inside the tooth is inflamed.",
    causes: [
      { name: "Dental decay reaching the nerve (pulpitis)", likelihood: "Common", detail: "Lingering pain after hot/cold or spontaneous throbbing pain." },
      { name: "Tooth abscess", likelihood: "Possible", detail: "Pain on biting, swelling or a bad taste can mean infection at the root tip." },
      { name: "Gum infection around the tooth", likelihood: "Less likely", detail: "Tender gum with localised swelling." },
    ],
    nextSteps: ["See a dentist within a few days", "Root canal treatment or a filling may be needed to save the tooth"],
    selfCare: ["Over-the-counter pain relief as directed on the pack", "Avoid chewing on that side", "Do not place aspirin on the gum — it burns the tissue"],
    tags: ["tooth pain", "root canal"],
  },
  {
    id: "gums",
    label: "Bleeding or swollen gums",
    match: /gum|bleed|receding/i,
    specialty: "Periodontics",
    urgency: "routine",
    summary: "Gums that bleed when you brush are usually inflamed from plaque build-up — very common and very treatable.",
    causes: [
      { name: "Gingivitis", likelihood: "Common", detail: "Early, reversible gum inflammation caused by plaque along the gumline." },
      { name: "Periodontitis", likelihood: "Possible", detail: "Longer-standing gum disease with bone loss — gums may recede or teeth feel loose." },
      { name: "Hormonal or medical factors", likelihood: "Less likely", detail: "Pregnancy, diabetes or some medicines make gums bleed more easily." },
    ],
    nextSteps: ["Book a gum check-up and professional cleaning", "Ask about gum pocket measurements if bleeding persists"],
    selfCare: ["Keep brushing gently twice daily — don't stop because of bleeding", "Clean between teeth daily with floss or brushes"],
    tags: ["gums", "bleeding gums"],
  },
  {
    id: "broken",
    label: "Broken or chipped tooth",
    match: /broke|broken|chip|crack|fractur|knocked/i,
    specialty: "Conservative Dentistry & Endodontics",
    urgency: "urgent",
    summary: "A broken tooth should be seen soon — even if it doesn't hurt, the exposed tooth can crack further or become infected.",
    causes: [
      { name: "Chipped enamel", likelihood: "Common", detail: "Small chip with no pain — usually repaired with a tooth-coloured filling." },
      { name: "Fracture into dentine or nerve", likelihood: "Possible", detail: "Sensitivity or pain suggests the break is deeper." },
      { name: "Cracked tooth syndrome", likelihood: "Less likely", detail: "Sharp pain when biting and releasing." },
    ],
    nextSteps: ["See a dentist within 24–48 hours", "Bring any broken piece in milk or saliva"],
    selfCare: ["Rinse gently with warm water", "Cover sharp edges with sugar-free gum or dental wax"],
    tags: ["broken tooth"],
  },
  {
    id: "wisdom",
    label: "Wisdom tooth problem",
    match: /wisdom|back of (my )?(jaw|mouth)|third molar/i,
    specialty: "Oral Surgery",
    urgency: "soon",
    summary: "Pain and swelling at the back of the jaw is often a partially erupted wisdom tooth with inflamed gum over it.",
    causes: [
      { name: "Pericoronitis", likelihood: "Common", detail: "Food trapped under the gum flap over a wisdom tooth causes swelling." },
      { name: "Impacted wisdom tooth", likelihood: "Possible", detail: "A tooth blocked from erupting can press on its neighbour." },
      { name: "Decay in the wisdom tooth or neighbour", likelihood: "Less likely", detail: "Hard-to-clean area that decays easily." },
    ],
    nextSteps: ["See a dentist or oral surgeon this week", "An OPG X-ray shows the tooth's position"],
    selfCare: ["Warm salt-water rinses", "Keep the area clean with a soft brush"],
    tags: ["wisdom tooth"],
  },
  {
    id: "whitening",
    label: "Tooth colour & whitening",
    match: /yellow|whiten|whiter|white teeth|stain|discolou?r|brighter/i,
    specialty: "Prosthodontics",
    urgency: "routine",
    summary: "Most tooth discolouration is surface staining or natural ageing, and is safely improved with professional cleaning and whitening.",
    causes: [
      { name: "Surface stains", likelihood: "Common", detail: "Tea, coffee, tobacco and some foods." },
      { name: "Natural ageing of enamel", likelihood: "Possible", detail: "Thinner enamel shows more of the yellower dentine." },
      { name: "A single dark tooth", likelihood: "Less likely", detail: "May mean the nerve inside has died — needs an X-ray." },
    ],
    nextSteps: ["Start with a cleaning and polish", "Ask about supervised whitening or veneers"],
    selfCare: ["Avoid abrasive charcoal or lemon remedies", "Rinse with water after tea or coffee"],
    tags: ["whitening", "cosmetic"],
  },
  {
    id: "alignment",
    label: "Crooked teeth & bite",
    match: /crooked|brace|aligner|gap|overbite|straight|spacing|crowd/i,
    specialty: "Orthodontics",
    urgency: "routine",
    summary: "Crowding, gaps and bite problems can be corrected at almost any age with braces or clear aligners.",
    causes: [
      { name: "Crowding or spacing", likelihood: "Common", detail: "Mismatch between tooth size and jaw size." },
      { name: "Bite discrepancy", likelihood: "Possible", detail: "Upper and lower jaws not meeting evenly." },
      { name: "Habits", likelihood: "Less likely", detail: "Thumb sucking or tongue thrusting in childhood." },
    ],
    nextSteps: ["Book an orthodontic consultation", "Gums must be healthy before starting treatment"],
    selfCare: ["Keep up excellent cleaning — crowded teeth trap more plaque"],
    tags: ["braces", "aligners"],
  },
  {
    id: "missing",
    label: "Missing tooth",
    match: /missing|lost (a |my )?tooth|implant|denture|bridge|gap where/i,
    specialty: "Prosthodontics",
    urgency: "routine",
    summary: "A missing tooth can be replaced with an implant, bridge or denture. Replacing it early helps protect the jawbone and neighbouring teeth.",
    causes: [
      { name: "Implant", likelihood: "Common", detail: "Replaces the root; needs enough healthy bone." },
      { name: "Bridge", likelihood: "Possible", detail: "Anchored to neighbouring teeth; faster to make." },
      { name: "Removable denture", likelihood: "Possible", detail: "Most affordable; suitable for several missing teeth." },
    ],
    nextSteps: ["See a prosthodontist to compare options", "An X-ray or CBCT scan checks the bone"],
    selfCare: ["Keep neighbouring teeth and gums very clean"],
    tags: ["implants", "missing tooth"],
  },
  {
    id: "ulcer",
    label: "Mouth ulcer or patch",
    match: /ulcer|sore|patch|white spot|red spot|lump|lesion|burning mouth/i,
    specialty: "Oral Medicine",
    urgency: "soon",
    summary: "Most mouth ulcers heal by themselves within two weeks. Any ulcer, lump, red or white patch lasting longer needs to be examined.",
    causes: [
      { name: "Aphthous ulcer", likelihood: "Common", detail: "Painful round ulcers that heal in 7–14 days." },
      { name: "Trauma", likelihood: "Possible", detail: "From a sharp tooth, braces or a cheek bite." },
      { name: "A lesion needing examination", likelihood: "Less likely", detail: "Non-healing ulcers or patches — especially with tobacco use — must be checked." },
    ],
    nextSteps: ["If it has lasted over 2 weeks, see an oral medicine specialist promptly", "Mention any tobacco or areca nut use"],
    selfCare: ["Avoid spicy and acidic food", "Use an antiseptic mouth rinse"],
    tags: ["ulcers", "oral cancer screening"],
  },
  {
    id: "child",
    label: "Child's dental care",
    match: /child|kid|baby|toddler|son|daughter|milk tooth|primary tooth/i,
    specialty: "Pediatric Dentistry",
    urgency: "routine",
    summary: "Children's teeth need their own approach — early visits prevent most problems and make dentistry a positive experience.",
    causes: [
      { name: "Early childhood decay", likelihood: "Common", detail: "Often from bedtime bottles or frequent snacks." },
      { name: "Teething or eruption", likelihood: "Possible", detail: "Discomfort as new teeth come through." },
      { name: "Injury to a baby tooth", likelihood: "Less likely", detail: "Falls are common in toddlers." },
    ],
    nextSteps: ["Book a visit with a paediatric dentist", "Bring any questions about habits or diet"],
    selfCare: ["Brush twice daily with a smear of fluoride toothpaste", "Avoid sugary drinks at bedtime"],
    tags: ["kids", "first visit"],
  },
  {
    id: "breath",
    label: "Bad breath",
    match: /bad breath|halitosis|smell|odou?r/i,
    specialty: "Periodontics",
    urgency: "routine",
    summary: "Persistent bad breath usually comes from the tongue or gums, and is very manageable once the source is found.",
    causes: [
      { name: "Tongue coating", likelihood: "Common", detail: "Bacteria on the back of the tongue." },
      { name: "Gum disease", likelihood: "Possible", detail: "Inflamed gum pockets produce odour." },
      { name: "Dry mouth or medical causes", likelihood: "Less likely", detail: "Some medicines, sinus or stomach conditions." },
    ],
    nextSteps: ["Book a cleaning and gum check-up"],
    selfCare: ["Clean your tongue daily", "Stay hydrated"],
    tags: ["gums"],
  },
];

const FALLBACK: Intent = {
  id: "general",
  label: "General dental concern",
  match: /.^/,
  specialty: "Conservative Dentistry & Endodontics",
  urgency: "routine",
  summary: "We couldn't match this to a specific pattern, so a general dental check-up is the best next step.",
  causes: [{ name: "Needs examination", likelihood: "Common", detail: "A dentist can examine the area and take an X-ray if needed." }],
  nextSteps: ["Book a check-up with a general or conservative dentist"],
  selfCare: ["Brush twice daily and clean between teeth"],
  tags: ["tooth pain"],
};

// Safety/triage layer: red flags always override the intent's urgency.
const RED_FLAGS: { match: RegExp; urgency: Urgency; message: string }[] = [
  { match: /(difficult|trouble|hard).*(breath|swallow)|can'?t (breathe|swallow)/i, urgency: "emergency", message: "Difficulty breathing or swallowing with dental swelling is a medical emergency. Go to the nearest emergency department now." },
  { match: /(swell|swoll|puff).*(face|eye|neck|cheek|jaw)|(face|eye|neck|cheek|jaw).*(swell|swoll|puff)/i, urgency: "urgent", message: "Facial swelling can mean a spreading infection. Please see a dentist today, or go to an emergency department if it is getting worse quickly or you have a fever." },
  { match: /fever|pus|bleeding (won'?t|doesn'?t|not) stop|uncontrolled bleed/i, urgency: "urgent", message: "Fever, pus or bleeding that won't stop needs same-day care." },
  { match: /accident|fell|fall|knocked out|trauma|hit (my|in the) (mouth|face)/i, urgency: "urgent", message: "After an injury to the mouth, see a dentist today. A knocked-out adult tooth should be replanted or kept in milk and seen within an hour." },
  { match: /(more than|over|for) (2|two|3|three|several) weeks|not heal|won'?t heal/i, urgency: "soon", message: "Anything in the mouth that hasn't healed in two weeks should be examined by a dentist soon." },
];

const LANGUAGES: [RegExp, string][] = [
  [/[ఀ-౿]|in telugu/i, "Telugu"],
  [/[ऀ-ॿ]|in hindi/i, "Hindi"],
  [/[ಀ-೿]|in kannada/i, "Kannada"],
  [/[஀-௿]|in tamil/i, "Tamil"],
  [/[ഀ-ൿ]|in malayalam/i, "Malayalam"],
];

const URGENCY_ORDER: Urgency[] = ["routine", "soon", "urgent", "emergency"];

export async function analyzeSymptoms(message: string, user: User | null, hasImage = false) {
  const language = LANGUAGES.find(([re]) => re.test(message))?.[1] ?? "English";
  const matched = INTENTS.filter((i) => i.match.test(message));
  const intent = matched[0] ?? FALLBACK;
  const flags = RED_FLAGS.filter((f) => f.match.test(message));
  const urgency = [intent.urgency, ...flags.map((f) => f.urgency)].reduce((a, b) =>
    URGENCY_ORDER.indexOf(b) > URGENCY_ORDER.indexOf(a) ? b : a,
  );

  const [dentists, posts] = await Promise.all([
    urgency === "emergency" ? Promise.resolve([]) : getRecommendedDentists(user, intent.specialty, 3),
    postsRepo.where((p) => p.tags.some((t) => intent.tags.includes(t)) || p.specialty === intent.specialty),
  ]);

  return {
    language,
    intent: { id: intent.id, label: intent.label, alsoMentioned: matched.slice(1, 3).map((i) => i.label) },
    summary: intent.summary,
    possibleCauses: intent.causes,
    urgency,
    safetyMessages: flags.map((f) => f.message),
    specialty: intent.specialty,
    nextSteps: intent.nextSteps,
    selfCare: intent.selfCare,
    imageNote: hasImage
      ? "Photo received. In this prototype images are not analysed — your dentist will review it at the visit."
      : null,
    content: posts.slice(0, 3).map((p) => ({ id: p.id, title: p.title, caption: p.caption, specialty: p.specialty })),
    dentists,
  };
}

export type AssistantResponse = Awaited<ReturnType<typeof analyzeSymptoms>>;
