import { cookies } from "next/headers";
import { z } from "zod";
import { SESSION_COOKIE } from "@/lib/constants";
import { newId } from "@/lib/server/csv/table";
import { fail, ok, parseBody } from "@/lib/server/http";
import { getUserByEmail, usersRepo } from "@/lib/server/repositories/users";
import { apiAuth } from "@/lib/server/session";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.email("Enter a valid email"),
  role: z.enum(["patient", "dentist", "student", "faculty"]),
});

const profileSchema = z.object({
  city: z.string().trim().max(60).optional(),
  specialty: z.string().max(80).optional(),
  level: z.string().max(20).optional(),
  onboarded: z.boolean().optional(),
});

// ponytail: registration without verification — demo only. OTP/email verification comes with real auth.
export async function POST(req: Request) {
  const body = await parseBody(req, registerSchema);
  if (body.error) return body.error;
  if (await getUserByEmail(body.data.email)) return fail("An account with this email already exists — use a demo persona to sign in.", 409);
  const user = await usersRepo.insert({
    id: newId("u"),
    ...body.data,
    avatar: "",
    city: "",
    specialty: "",
    clinicId: body.data.role === "dentist" ? "c001" : "",
    level: "",
    onboarded: false,
  });
  (await cookies()).set(SESSION_COOKIE, user.id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return ok(user, { status: 201 });
}

export async function PATCH(req: Request) {
  const auth = await apiAuth();
  if (auth.error) return auth.error;
  const body = await parseBody(req, profileSchema);
  if (body.error) return body.error;
  return ok(await usersRepo.update(auth.user.id, body.data));
}
