import { ok } from "@/lib/server/http";
import { getNotificationsForUser } from "@/lib/server/repositories/users";
import { markAllRead } from "@/lib/server/services/notification-service";
import { apiAuth } from "@/lib/server/session";

export async function GET() {
  const auth = await apiAuth();
  if (auth.error) return auth.error;
  return ok(await getNotificationsForUser(auth.user.id));
}

export async function PATCH() {
  const auth = await apiAuth();
  if (auth.error) return auth.error;
  await markAllRead(auth.user.id);
  return ok(true);
}
