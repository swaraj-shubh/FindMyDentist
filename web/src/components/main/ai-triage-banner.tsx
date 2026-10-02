import { AlertOctagon, AlertTriangle, Info, ShieldCheck } from "lucide-react";
import { AI_DISCLAIMER } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Urgency } from "@/lib/server/services/assistant-service";

const LEVELS: Record<Urgency, { title: string; icon: typeof Info; cls: string }> = {
  routine: { title: "Routine — book a regular visit", icon: ShieldCheck, cls: "border-success/30 bg-success/8" },
  soon: { title: "See a dentist soon", icon: Info, cls: "border-info/30 bg-info/8" },
  urgent: { title: "Get care today", icon: AlertTriangle, cls: "border-warning/40 bg-warning/12" },
  emergency: { title: "Seek emergency care now", icon: AlertOctagon, cls: "border-destructive/40 bg-destructive/10" },
};

export function UrgencyBanner({ urgency, messages }: { urgency: Urgency; messages: string[] }) {
  const l = LEVELS[urgency];
  return (
    <div role={urgency === "emergency" || urgency === "urgent" ? "alert" : "status"} className={cn("flex gap-3 rounded-2xl border p-4", l.cls)}>
      <l.icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div>
        <p className="font-semibold">{l.title}</p>
        {messages.map((m) => (
          <p key={m} className="mt-1 text-sm">{m}</p>
        ))}
      </div>
    </div>
  );
}

export function AiDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("flex gap-2 rounded-xl bg-muted/70 p-3 text-xs leading-relaxed text-muted-foreground", className)}>
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      {AI_DISCLAIMER}
    </p>
  );
}
