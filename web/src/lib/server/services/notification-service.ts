import { newId } from "../csv/table";
import { notificationsRepo, usersRepo } from "../repositories/users";
import type { Notification } from "@/types/user";

type NewNotification = Pick<Notification, "type" | "title" | "message" | "href">;

export function notify(userId: string, n: NewNotification) {
  return notificationsRepo.insert({ ...n, id: newId("n"), userId, read: false, createdAt: new Date().toISOString() });
}

/** Fan out to everyone who works at a clinic (dentists + staff). */
export async function notifyClinic(clinicId: string, n: NewNotification) {
  const staff = await usersRepo.where((u) => u.clinicId === clinicId && (u.role === "dentist" || u.role === "clinic"));
  for (const u of staff) await notify(u.id, n);
}

export async function markAllRead(userId: string) {
  const unread = await notificationsRepo.where((n) => n.userId === userId && !n.read);
  for (const n of unread) await notificationsRepo.update(n.id, { read: true });
}
