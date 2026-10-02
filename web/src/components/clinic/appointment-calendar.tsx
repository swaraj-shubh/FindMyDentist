"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, addDays, formatDate, formatTime, toISODate } from "@/lib/utils";
import type { ScheduleItem } from "@/lib/server/services/clinic-service";
import { AppointmentDrawer } from "./appointment-drawer";

const HOURS = Array.from({ length: 11 }, (_, i) => i + 9); // 9:00–19:00
const STATUS_STYLE: Record<string, string> = {
  scheduled: "border-warning/50 bg-warning/15",
  confirmed: "border-info/40 bg-info/10",
  completed: "border-success/40 bg-success/10",
  cancelled: "border-border bg-muted opacity-60 line-through",
  no_show: "border-destructive/40 bg-destructive/10",
};

type View = "day" | "week" | "month";

export function AppointmentCalendar({ items, date, view, dentists }: { items: ScheduleItem[]; date: string; view: View; dentists: { id: string; name: string }[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<ScheduleItem | null>(null);
  const go = (d: string, v: View = view) => router.push(`/clinic/appointments?view=${v}&date=${d}`);
  const step = view === "day" ? 1 : view === "week" ? 7 : 30;
  const dow = new Date(date + "T00:00").getDay();
  const weekStart = addDays(date, -((dow + 6) % 7));
  const days = view === "week" ? Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)) : [date];
  const label = view === "month" ? formatDate(date, { month: "long", year: "numeric" }) : view === "week" ? `${formatDate(days[0], { day: "numeric", month: "short" })} – ${formatDate(days[5], { day: "numeric", month: "short" })}` : formatDate(date, { weekday: "long", day: "numeric", month: "long" });

  const block = (a: ScheduleItem) => (
    <button key={a.id} onClick={() => setSelected(a)} className={cn("w-full overflow-hidden rounded-md border px-2 py-1 text-left text-xs leading-tight transition-shadow hover:shadow-md", STATUS_STYLE[a.status])} title={a.status.replace("_", " ")}>
      <span className="font-semibold tabular-nums">{formatTime(a.time)}</span> {a.patient?.name.split(" ")[0]}
      <span className="block truncate text-muted-foreground">{a.reason}</span>
    </button>
  );

  // Month grid
  const first = new Date(date.slice(0, 7) + "-01T00:00");
  const gridStart = addDays(toISODate(first), -((first.getDay() + 6) % 7));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => go(addDays(date, -step))} aria-label="Previous"><ChevronLeft /></Button>
        <Button variant="outline" size="icon" onClick={() => go(addDays(date, step))} aria-label="Next"><ChevronRight /></Button>
        <Button variant="outline" onClick={() => go(toISODate())}>Today</Button>
        <h2 className="mx-2 text-lg font-semibold">{label}</h2>
        <div className="ml-auto inline-flex rounded-lg border bg-muted p-0.5" role="tablist" aria-label="Calendar view">
          {(["day", "week", "month"] as const).map((v) => (
            <button key={v} role="tab" aria-selected={view === v} onClick={() => go(date, v)} className={cn("rounded-md px-3 py-1 text-sm font-medium capitalize", view === v && "bg-card shadow-sm")}>{v}</button>
          ))}
        </div>
      </div>

      {view === "day" && (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <div className="grid min-w-[640px]" style={{ gridTemplateColumns: `80px repeat(${dentists.length}, 1fr)` }}>
            <div className="border-b" />
            {dentists.map((d) => <div key={d.id} className="border-b border-l px-3 py-2 text-sm font-medium">{d.name}</div>)}
            {HOURS.map((h) => (
              <div key={h} className="contents">
                <div className="px-2 py-3 text-xs whitespace-nowrap text-muted-foreground tabular-nums">{formatTime(`${String(h).padStart(2, "0")}:00`)}</div>
                {dentists.map((d) => {
                  const cell = items.filter((a) => a.dentistId === d.id && Number(a.time.slice(0, 2)) === h);
                  return <div key={d.id} className="min-h-14 space-y-1 border-t border-l p-1">{cell.map(block)}</div>;
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "week" && (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <div className="grid min-w-[760px] grid-cols-6">
            {days.map((d) => (
              <div key={d} className={cn("min-h-96 border-l first:border-l-0", d === toISODate() && "bg-secondary/30")}>
                <button onClick={() => go(d, "day")} className="w-full border-b px-3 py-2 text-left text-sm font-medium hover:bg-muted">
                  {formatDate(d, { weekday: "short", day: "numeric" })}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">{items.filter((a) => a.date === d && a.status !== "cancelled").length}</span>
                </button>
                <div className="space-y-1 p-1">{items.filter((a) => a.date === d).map(block)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "month" && (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="grid grid-cols-7 border-b text-center text-xs text-muted-foreground">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="py-2">{d}</div>)}</div>
          <div className="grid grid-cols-7">
            {Array.from({ length: 42 }, (_, i) => addDays(gridStart, i)).map((d) => {
              const n = items.filter((a) => a.date === d && a.status !== "cancelled").length;
              return (
                <button key={d} onClick={() => go(d, "day")} className={cn("min-h-20 border-t border-l p-2 text-left text-sm hover:bg-muted/50", d.slice(0, 7) !== date.slice(0, 7) && "text-muted-foreground/50", d === toISODate() && "bg-secondary/40")}>
                  <span className="font-medium">{Number(d.slice(8))}</span>
                  {n > 0 && <span className="mt-1 block w-fit rounded-full bg-primary/15 px-1.5 text-xs font-medium text-primary">{n}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <AppointmentDrawer appointment={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
