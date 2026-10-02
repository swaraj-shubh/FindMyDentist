import { BadgeCheck, CircleHelp, ExternalLink } from "lucide-react";
import type { Paper } from "@/types/academic";

export function CitationList({ papers, empty = "No citations on this slide." }: { papers: Paper[]; empty?: string }) {
  if (!papers.length) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <ol className="space-y-3">
      {papers.map((p, i) => (
        <li key={p.id} className="flex gap-2 text-sm">
          <span className="text-muted-foreground tabular-nums">[{i + 1}]</span>
          <div className="min-w-0">
            <p className="leading-snug">{p.citation}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
              <span>{p.evidenceType}</span>
              {p.doi ? <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">DOI <ExternalLink className="size-3" aria-hidden /></a> : <span className="inline-flex items-center gap-1"><CircleHelp className="size-3" aria-hidden />DOI not on file</span>}
              {p.verified ? <span className="inline-flex items-center gap-1 text-success"><BadgeCheck className="size-3" aria-hidden />Verified</span> : <span>Unverified</span>}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
