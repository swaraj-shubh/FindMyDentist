import type { NextRequest } from "next/server";
import { ok } from "@/lib/server/http";
import { searchPapers } from "@/lib/server/services/academic-service";
import { apiAuth } from "@/lib/server/session";

export async function GET(req: NextRequest) {
  const auth = await apiAuth("academic");
  if (auth.error) return auth.error;
  const p = req.nextUrl.searchParams;
  return ok(
    await searchPapers({
      q: p.get("q") ?? "",
      specialty: p.get("specialty") ?? undefined,
      evidence: p.get("evidence") ?? undefined,
      from: Number(p.get("from") ?? 0) || undefined,
    }),
  );
}
