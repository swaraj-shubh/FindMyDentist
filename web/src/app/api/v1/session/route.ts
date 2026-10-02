import { cookies } from "next/headers";
import { z } from "zod";
import { DEMO_PERSONAS } from "@/lib/config/demo-users";
import { SESSION_COOKIE } from "@/lib/constants";
import { getSession } from "@/lib/server/session";
import { ok, parseBody } from "@/lib/server/http";

const schema = z.object({ persona: z.enum(["patient", "dentist", "student", "clinic"]) });

export async function GET() {
  return ok(await getSession());
}

export async function POST(req: Request) {
  const body = await parseBody(req, schema);
  if (body.error) return body.error;
  const persona = DEMO_PERSONAS[body.data.persona];
  (await cookies()).set(SESSION_COOKIE, persona.userId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return ok({ home: persona.home });
}

export async function DELETE() {
  (await cookies()).delete(SESSION_COOKIE);
  return ok(true);
}
