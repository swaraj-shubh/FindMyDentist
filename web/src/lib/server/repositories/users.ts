import { defineTable } from "../csv/table";
import type { Notification, User } from "@/types/user";

export const usersRepo = defineTable<User>("users", { booleans: ["onboarded"] });

export async function getUserByEmail(email: string) {
  return (await usersRepo.where((u) => u.email.toLowerCase() === email.toLowerCase()))[0] ?? null;
}

// Notifications are tiny and identity-scoped, so they live next to users.
export const notificationsRepo = defineTable<Notification>("notifications", { booleans: ["read"] });

export async function getNotificationsForUser(userId: string) {
  return (await notificationsRepo.where((n) => n.userId === userId)).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}
