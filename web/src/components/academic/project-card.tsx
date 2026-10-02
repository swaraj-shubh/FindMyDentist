import Link from "next/link";
import { Presentation } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { timeAgo } from "@/lib/utils";
import type { AcademicProject } from "@/types/academic";

export function ProjectCard({ project: p, slideCount }: { project: AcademicProject; slideCount: number }) {
  return (
    <Link href={`/academic/studio/${p.id}`} className="group flex flex-col rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-10 items-center justify-center rounded-xl bg-[oklch(0.95_0.03_292)] text-product-academic"><Presentation className="size-5" aria-hidden /></span>
        <StatusBadge status={p.status} />
      </div>
      <h3 className="mt-4 font-semibold leading-snug group-hover:underline">{p.title}</h3>
      <p className="text-sm text-muted-foreground">{p.level} {p.specialty}</p>
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>{p.status === "generated" ? `${slideCount} slides` : `${p.slideCount} planned`}</span><span>{p.status === "generated" ? "Ready" : "Outline"}</span></div>
        <Progress value={p.status === "generated" ? 100 : 35} aria-label="Project progress" />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Edited {timeAgo(p.updatedAt)}</p>
    </Link>
  );
}
