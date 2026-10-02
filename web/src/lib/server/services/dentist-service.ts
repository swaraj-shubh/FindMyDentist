import { clinicsRepo, getClinicBySlug } from "../repositories/clinics";
import { dentistsRepo, getDentistBySlug, reviewsRepo, searchDentists, type DentistQuery } from "../repositories/dentists";
import { postsRepo, reelsRepo } from "../repositories/posts";
import { getAvailability } from "./booking-service";
import type { Clinic } from "@/types/clinic";
import type { Dentist } from "@/types/dentist";
import type { User } from "@/types/user";

export type DentistListItem = Dentist & { clinic: Clinic; nextSlot: { date: string; time: string } | null };

async function withClinicAndSlot(dentists: Dentist[]): Promise<DentistListItem[]> {
  const clinics = await clinicsRepo.all();
  return Promise.all(
    dentists.map(async (d) => {
      const days = await getAvailability(d.id, 7);
      const first = days.find((x) => x.slots.length);
      return {
        ...d,
        clinic: clinics.find((c) => c.id === d.clinicId)!,
        nextSlot: first ? { date: first.date, time: first.slots[0] } : null,
      };
    }),
  );
}

export type SortKey = "relevance" | "rating" | "experience" | "fee";

export async function listDentists(query: DentistQuery & { sort?: SortKey }) {
  const rows = await searchDentists(query);
  const sorters: Record<SortKey, (a: Dentist, b: Dentist) => number> = {
    relevance: (a, b) => Number(b.verified) - Number(a.verified) || b.rating - a.rating,
    rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
    experience: (a, b) => b.experience - a.experience,
    fee: (a, b) => a.consultationFee - b.consultationFee,
  };
  return withClinicAndSlot(rows.sort(sorters[query.sort ?? "relevance"]));
}

/** Recommendation = same city first, then rating. Swap for a real ranker later. */
export async function getRecommendedDentists(user: User | null, specialty?: string, limit = 6) {
  const all = await dentistsRepo.where((d) => !specialty || d.specialty === specialty);
  const city = user?.city ?? "Bengaluru";
  const ranked = all.sort((a, b) => Number(b.city === city) - Number(a.city === city) || b.rating - a.rating);
  return withClinicAndSlot(ranked.slice(0, limit));
}

export async function getDentistProfile(slug: string) {
  const dentist = await getDentistBySlug(slug);
  if (!dentist) return null;
  const [clinic, reviews, posts, reels, colleagues] = await Promise.all([
    clinicsRepo.get(dentist.clinicId),
    reviewsRepo.where((r) => r.dentistId === dentist.id),
    postsRepo.where((p) => p.authorId === dentist.id),
    reelsRepo.where((r) => r.authorId === dentist.id),
    dentistsRepo.where((d) => d.clinicId === dentist.clinicId && d.id !== dentist.id),
  ]);
  return { dentist, clinic: clinic!, reviews, posts, reels, colleagues, availability: await getAvailability(dentist.id, 7) };
}

export async function listClinics(city?: string) {
  const clinics = await clinicsRepo.where((c) => !city || c.city === city);
  const dentists = await dentistsRepo.all();
  return clinics.map((c) => ({ ...c, dentists: dentists.filter((d) => d.clinicId === c.id) }));
}

export async function getClinicProfile(slug: string) {
  const clinic = await getClinicBySlug(slug);
  if (!clinic) return null;
  const dentists = await withClinicAndSlot(await dentistsRepo.where((d) => d.clinicId === clinic.id));
  return { clinic, dentists };
}
