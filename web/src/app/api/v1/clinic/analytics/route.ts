import type { NextRequest } from "next/server";
import { ok } from "@/lib/server/http";
import { getAnalytics, getClinicForUser } from "@/lib/server/services/clinic-service";
import { apiAuth } from "@/lib/server/session";

export async function GET(req: NextRequest) {
  const auth = await apiAuth("clinic");
  if (auth.error) return auth.error;
  const clinic = await getClinicForUser(auth.user);
  const days = Math.min(90, Math.max(7, Number(req.nextUrl.searchParams.get("days") ?? 30)));
  return ok(await getAnalytics(clinic.id, days));
}
