import { defineTable } from "../csv/table";
import type { Clinic, Message } from "@/types/clinic";

export const clinicsRepo = defineTable<Clinic>("clinics", {
  numbers: ["dentistCount", "chairs", "lat", "lng"],
  booleans: ["verified"],
});

export async function getClinicBySlug(slug: string) {
  return (await clinicsRepo.where((c) => c.slug === slug))[0] ?? null;
}

export const messagesRepo = defineTable<Message>("messages", { booleans: ["read"] });
