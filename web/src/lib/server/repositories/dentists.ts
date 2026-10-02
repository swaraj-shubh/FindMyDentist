import { defineTable } from "../csv/table";
import type { Dentist, Review } from "@/types/dentist";

export const dentistsRepo = defineTable<Dentist>("dentists", {
  numbers: ["experience", "rating", "reviewCount", "consultationFee", "followers"],
  booleans: ["verified"],
});

export const reviewsRepo = defineTable<Review>("reviews", { numbers: ["rating"] });

export async function getDentistBySlug(slug: string) {
  return (await dentistsRepo.where((d) => d.slug === slug))[0] ?? null;
}

export interface DentistQuery {
  q?: string;
  specialty?: string;
  city?: string;
  gender?: string;
  language?: string;
  minExperience?: number;
}

export async function searchDentists(query: DentistQuery) {
  const q = query.q?.trim().toLowerCase();
  return dentistsRepo.where(
    (d) =>
      (!q ||
        [d.name, d.specialty, d.city, ...d.services].some((f) => f.toLowerCase().includes(q))) &&
      (!query.specialty || d.specialty === query.specialty) &&
      (!query.city || d.city.toLowerCase() === query.city.toLowerCase()) &&
      (!query.gender || d.gender === query.gender) &&
      (!query.language || d.languages.includes(query.language)) &&
      d.experience >= (query.minExperience ?? 0),
  );
}
