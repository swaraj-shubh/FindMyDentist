import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/constants";
import { WORKSPACE_ROLES } from "@/lib/config/demo-users";
import { usersRepo } from "./repositories/users";
import { fail } from "./http";
import type { User } from "@/types/user";

// ponytail: demo session = a user id in a cookie. Real auth (OTP, signed sessions, RBAC) replaces this file.
export async function getSession(): Promise<User | null> {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  return id ? usersRepo.get(id) : null;
}

export async function requireUser(next: string): Promise<User> {
  const user = await getSession();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export function canAccess(user: User | null, workspace: keyof typeof WORKSPACE_ROLES) {
  return !!user && WORKSPACE_ROLES[workspace].includes(user.role);
}

/** Route-handler guard: returns the user, or a ready 401/403 response. */
export async function apiAuth(workspace?: keyof typeof WORKSPACE_ROLES) {
  const user = await getSession();
  if (!user) return { error: fail("Please sign in to continue.", 401) } as const;
  if (workspace && !canAccess(user, workspace)) return { error: fail("Your role doesn't have access to this workspace.", 403) } as const;
  return { user } as const;
}
