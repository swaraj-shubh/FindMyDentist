"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Staged pipeline progress (blueprint §6) — runs for `durationMs` while the real work happens. */
export function StageProgress({ title, stages, running, durationMs = 2400 }: { title: string; stages: readonly string[]; running: boolean; durationMs?: number }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!running) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restart the animation each run
    setActive(0);
    const t = setInterval(() => setActive((a) => Math.min(a + 1, stages.length - 1)), durationMs / stages.length);
    return () => clearInterval(t);
  }, [running, stages.length, durationMs]);
  return (
    <div className="rounded-2xl border bg-card p-6" role="status" aria-live="polite">
      <p className="font-semibold">{title}</p>
      <ol className="mt-4 space-y-2.5">
        {stages.map((s, i) => (
          <li key={s} className={cn("flex items-center gap-3 text-sm", i > active ? "text-muted-foreground/60" : "")}>
            {i < active ? <Check className="size-4 text-success" aria-hidden /> : i === active ? <Loader2 className="size-4 animate-spin text-primary" aria-hidden /> : <span className="size-4 rounded-full border" aria-hidden />}
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}
