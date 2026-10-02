import type { NextRequest } from "next/server";
import { fail, handle, ok } from "@/lib/server/http";
import { getViva } from "@/lib/server/services/academic-service";
import { apiAuth } from "@/lib/server/session";

export async function GET(req: NextRequest) {
  const auth = await apiAuth("academic");
  if (auth.error) return auth.error;
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) return fail("projectId is required");
  try {
    return ok(await getViva(auth.user, projectId));
  } catch (e) {
    return handle(e);
  }
}
