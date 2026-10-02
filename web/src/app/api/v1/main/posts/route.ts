import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok, parseBody } from "@/lib/server/http";
import { addComment, getFeed, toggleLike, votePoll } from "@/lib/server/services/community-service";
import { apiAuth, getSession } from "@/lib/server/session";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("like"), postId: z.string().min(1) }),
  z.object({ action: z.literal("comment"), postId: z.string().min(1), body: z.string().trim().min(1, "Write a comment").max(500) }),
  z.object({ action: z.literal("vote"), postId: z.string().min(1), option: z.number().int().min(0) }),
]);

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const user = await getSession();
  return ok(await getFeed({ tab: p.get("tab") ?? undefined, specialty: p.get("specialty") ?? undefined, userId: user?.id }));
}

export async function POST(req: Request) {
  const auth = await apiAuth();
  if (auth.error) return auth.error;
  const body = await parseBody(req, actionSchema);
  if (body.error) return body.error;
  try {
    const b = body.data;
    if (b.action === "like") return ok(await toggleLike(auth.user, b.postId));
    if (b.action === "comment") return ok(await addComment(auth.user, b.postId, b.body), { status: 201 });
    return ok(await votePoll(auth.user, b.postId, b.option));
  } catch (e) {
    return handle(e);
  }
}
