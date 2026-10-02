"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, BookOpen, CalendarDays, CheckCheck, FileText, Receipt, Settings2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { api } from "@/lib/api-client";
import { cn, timeAgo } from "@/lib/utils";
import type { Notification } from "@/types/user";
import { EmptyState } from "./empty-state";

const ICONS = { appointment: CalendarDays, record: FileText, community: Users, academic: BookOpen, billing: Receipt, system: Settings2 };

export function NotificationCenter({ notifications }: { notifications: Notification[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  async function markAll() {
    await api("/api/v1/notifications", { method: "PATCH" });
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}>
          <Bell />
          {unread > 0 && (
            <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">{unread}</span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>{unread ? `${unread} unread` : "You're all caught up"}</SheetDescription>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="mt-2 w-fit" onClick={markAll}>
              <CheckCheck /> Mark all as read
            </Button>
          )}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-2">
          {notifications.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications yet" description="Booking updates, records and replies will show up here." className="m-2 border-none" />
          ) : (
            <ul className="space-y-1">
              {notifications.map((n) => {
                const Icon = ICONS[n.type] ?? Bell;
                return (
                  <li key={n.id}>
                    <Link
                      href={n.href || "#"}
                      onClick={() => setOpen(false)}
                      className={cn("flex gap-3 rounded-xl p-3 transition-colors hover:bg-muted", !n.read && "bg-secondary/60")}
                    >
                      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
                        <Icon className="size-4 text-primary" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{n.title}</span>
                          {!n.read && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                        </span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">{n.message}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">{timeAgo(n.createdAt)}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
