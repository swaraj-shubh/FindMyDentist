"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn, formatTime } from "@/lib/utils";
import type { ScheduleItem } from "@/lib/server/services/clinic-service";
import { AppointmentDrawer } from "./appointment-drawer";

/** Today's schedule as time-ordered rows; clicking opens the details drawer (Rule 4: drawers before pages). */
export function ScheduleList({ items }: { items: ScheduleItem[] }) {
  const [selected, setSelected] = useState<ScheduleItem | null>(null);
  const now = new Date().toTimeString().slice(0, 5);
  return (
    <>
      <ul className="divide-y">
        {items.map((a) => (
          <li key={a.id}>
            <button onClick={() => setSelected(a)} className={cn("flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/50", a.status === "cancelled" && "opacity-50")}>
              <span className={cn("w-20 shrink-0 text-sm font-semibold whitespace-nowrap tabular-nums", a.time <= now && ["scheduled", "confirmed"].includes(a.status) && "text-primary")}>{formatTime(a.time)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{a.patient?.name ?? "Unknown patient"}</span>
                <span className="block truncate text-sm text-muted-foreground">{a.reason} · {a.dentistName.replace("Dr. ", "Dr ")} · Chair {a.chair}</span>
              </span>
              <StatusBadge status={a.status} className="hidden sm:inline-flex" />
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <AppointmentDrawer appointment={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </>
  );
}
