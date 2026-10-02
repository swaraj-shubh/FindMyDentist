import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { QC_DIMENSIONS, overallScore } from "@/lib/academic-shared";
import type { QcReport } from "@/types/academic";

const KIND_LABEL: Record<string, string> = { missing_citation: "Missing citation", duplicate: "Possible duplicate", dense: "Too dense", low_confidence: "Low confidence", missing_section: "Missing section", unverified_source: "Unverified sources" };

export function QcPanel({ qc, onSelectSlide, limit }: { qc: QcReport; onSelectSlide?: (n: number) => void; limit?: number }) {
  const overall = overallScore(qc);
  const grouped = qc.issues.filter((i) => i.kind !== "unverified_source" || true);
  const shown = limit ? grouped.slice(0, limit) : grouped;
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className={cn("flex size-16 items-center justify-center rounded-full text-xl font-semibold ring-4", overall >= 85 ? "bg-success/10 text-success ring-success/20" : overall >= 70 ? "bg-warning/15 ring-warning/30" : "bg-destructive/10 text-destructive ring-destructive/20")}>{overall}</div>
        <div><p className="font-semibold">Academic quality</p><p className="text-sm text-muted-foreground">{overall >= 85 ? "Ready for review" : "Needs attention before presenting"}</p></div>
      </div>
      <ul className="space-y-2.5">
        {QC_DIMENSIONS.map((d) => {
          const v = qc[d.key] as number;
          return (
            <li key={d.key}>
              <div className="mb-1 flex justify-between text-sm"><span>{d.label}</span><span className="flex items-center gap-1 font-medium tabular-nums">{v >= 85 ? <CheckCircle2 className="size-3.5 text-success" aria-label="Good" /> : <AlertTriangle className="size-3.5 text-warning" aria-label="Needs work" />}{v}%</span></div>
              <Progress value={v} aria-label={d.label} />
            </li>
          );
        })}
      </ul>
      <div>
        <p className="mb-2 font-medium">Issues detected ({qc.issues.length})</p>
        {shown.length === 0 ? <p className="text-sm text-muted-foreground">No issues found.</p> : (
          <ul className="space-y-1.5">
            {shown.map((i, k) => (
              <li key={k}>
                <button disabled={!i.slideNumber || !onSelectSlide} onClick={() => onSelectSlide?.(i.slideNumber)} className="flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm enabled:hover:bg-muted">
                  {i.kind === "unverified_source" || i.kind === "missing_section" ? <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden /> : <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />}
                  <span><span className="font-medium">{i.slideNumber ? `Slide ${i.slideNumber} — ` : ""}{KIND_LABEL[i.kind]}</span><span className="block text-muted-foreground">{i.message}</span></span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {limit && qc.issues.length > limit && <p className="mt-2 text-xs text-muted-foreground">+{qc.issues.length - limit} more in the Review tab</p>}
      </div>
    </div>
  );
}
