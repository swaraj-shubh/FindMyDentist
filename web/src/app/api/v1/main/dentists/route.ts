import type { NextRequest } from "next/server";
import { ok } from "@/lib/server/http";
import { getAvailability } from "@/lib/server/services/booking-service";
import { listDentists, type SortKey } from "@/lib/server/services/dentist-service";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const availabilityFor = p.get("availability");
  if (availabilityFor) return ok(await getAvailability(availabilityFor, 14));
  return ok(
    await listDentists({
      q: p.get("q") ?? undefined,
      specialty: p.get("specialty") ?? undefined,
      city: p.get("city") ?? undefined,
      gender: p.get("gender") ?? undefined,
      language: p.get("language") ?? undefined,
      minExperience: Number(p.get("minExperience") ?? 0),
      sort: (p.get("sort") as SortKey) ?? undefined,
    }),
  );
}
