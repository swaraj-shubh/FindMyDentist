import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function MetricCard({ label, value, icon: Icon, hint, href, tone }: { label: string; value: React.ReactNode; icon: LucideIcon; hint?: string; href?: string; tone?: "warning" }) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className={cn("size-4 text-muted-foreground", tone === "warning" && "text-warning")} aria-hidden />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </>
  );
  const cls = "block rounded-xl border bg-card p-4 transition-shadow";
  return href ? <Link href={href} className={cn(cls, "hover:shadow-md")}>{body}</Link> : <div className={cls}>{body}</div>;
}
