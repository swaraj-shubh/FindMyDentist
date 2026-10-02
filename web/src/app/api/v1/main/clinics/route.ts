import type { NextRequest } from "next/server";
import { ok } from "@/lib/server/http";
import { listClinics } from "@/lib/server/services/dentist-service";

export async function GET(req: NextRequest) {
  return ok(await listClinics(req.nextUrl.searchParams.get("city") ?? undefined));
}
