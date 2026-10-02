import { AlertCircle, Ban, CheckCircle2, CircleDashed, Clock, FileClock, Loader, UserX, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "info" | "danger" | "neutral";

// Rule 5: never colour alone — every status carries an icon and a label.
const STATUSES: Record<string, { label: string; icon: LucideIcon; tone: Tone }> = {
  scheduled: { label: "Awaiting confirmation", icon: Clock, tone: "warning" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, tone: "info" },
  completed: { label: "Completed", icon: CheckCircle2, tone: "success" },
  cancelled: { label: "Cancelled", icon: Ban, tone: "neutral" },
  no_show: { label: "No-show", icon: UserX, tone: "danger" },
  paid: { label: "Paid", icon: CheckCircle2, tone: "success" },
  pending: { label: "Pending", icon: FileClock, tone: "warning" },
  overdue: { label: "Overdue", icon: AlertCircle, tone: "danger" },
  draft: { label: "Draft", icon: CircleDashed, tone: "neutral" },
  planned: { label: "Planned", icon: CircleDashed, tone: "neutral" },
  in_progress: { label: "In progress", icon: Loader, tone: "info" },
  active: { label: "Active", icon: Loader, tone: "info" },
  blueprint: { label: "Blueprint", icon: CircleDashed, tone: "warning" },
  generated: { label: "Generated", icon: CheckCircle2, tone: "success" },
};

const TONES: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/20",
  warning: "bg-warning/15 text-[oklch(0.5_0.12_65)] dark:text-warning border-warning/30",
  info: "bg-info/10 text-info border-info/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status, label, className }: { status: string; label?: string; className?: string }) {
  const s = STATUSES[status] ?? { label: status, icon: CircleDashed, tone: "neutral" as Tone };
  const Icon = s.icon;
  return (
    <span className={cn("inline-flex h-6 shrink-0 items-center gap-1 rounded-full border px-2 text-xs font-medium whitespace-nowrap", TONES[s.tone], className)}>
      <Icon className="size-3.5" aria-hidden />
      {label ?? s.label}
    </span>
  );
}
