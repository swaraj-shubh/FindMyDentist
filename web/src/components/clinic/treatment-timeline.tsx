import { Check } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { TreatmentStep } from "@/types/patient";

/** Vertical treatment roadmap: done ✓, current ●, pending ○ — readable in seconds. */
export function TreatmentTimeline({ steps, compact }: { steps: TreatmentStep[]; compact?: boolean }) {
  return (
    <ol className="relative">
      {steps.map((s, i) => (
        <li key={`${s.label}-${i}`} className={cn("relative flex gap-3", compact ? "pb-3" : "pb-5", "last:pb-0")}>
          {i < steps.length - 1 && <span className={cn("absolute top-6 left-[11px] h-[calc(100%-1rem)] w-0.5", s.status === "done" ? "bg-primary" : "bg-border")} aria-hidden />}
          <span
            className={cn(
              "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2",
              s.status === "done" && "border-primary bg-primary text-primary-foreground",
              s.status === "current" && "border-primary bg-card",
              s.status === "pending" && "border-border bg-card",
            )}
          >
            {s.status === "done" && <Check className="size-3.5" aria-hidden />}
            {s.status === "current" && <span className="size-2.5 rounded-full bg-primary motion-safe:animate-pulse" aria-hidden />}
          </span>
          <div className="-mt-0.5 min-w-0">
            <p className={cn("text-sm font-medium", s.status === "pending" && "text-muted-foreground")}>{s.label}</p>
            <p className="text-xs text-muted-foreground">
              {s.status === "done" ? `Completed${s.date ? ` · ${formatDate(s.date, { day: "numeric", month: "short" })}` : ""}` : s.status === "current" ? "In progress" : "Pending"}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
