"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Slide } from "@/types/academic";
import { SlidePreview } from "./slide-preview";

/** Thumbnail rail: click to select, drag to reorder, quick duplicate/delete/regenerate on the active slide. */
export function SlideRail({ slides, selectedId, onSelect, onMove, onDuplicate, onDelete, onRegenerate }: {
  slides: Slide[]; selectedId: string; onSelect: (id: string) => void; onMove: (id: string, to: number) => void; onDuplicate: (id: string) => void; onDelete: (id: string) => void; onRegenerate: (id: string) => void;
}) {
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const active = useRef<HTMLLIElement>(null);
  useEffect(() => active.current?.scrollIntoView({ block: "nearest" }), [selectedId]);
  return (
    <ol className="space-y-3 p-3" aria-label="Slides">
      {slides.map((s, i) => (
        <li
          key={s.id}
          ref={s.id === selectedId ? active : undefined}
          draggable
          onDragStart={() => setDrag(s.id)}
          onDragEnd={() => { setDrag(null); setOver(null); }}
          onDragOver={(e) => { e.preventDefault(); setOver(i); }}
          onDrop={() => { if (drag && drag !== s.id) onMove(drag, i); setDrag(null); setOver(null); }}
          className={cn("group relative", over === i && drag && drag !== s.id && "before:absolute before:-top-2 before:right-0 before:left-0 before:h-0.5 before:bg-primary")}
        >
          <button onClick={() => onSelect(s.id)} aria-current={s.id === selectedId} aria-label={`Slide ${s.slideNumber}: ${s.title}`} className={cn("flex w-full gap-2 rounded-lg p-1 text-left", s.id === selectedId && "bg-secondary ring-2 ring-primary")}>
            <span className="w-5 pt-1 text-right text-xs text-muted-foreground tabular-nums">{s.slideNumber}</span>
            <span className="min-w-0 flex-1 overflow-hidden rounded-md border shadow-sm"><SlidePreview slide={s} number={false} /></span>
          </button>
          {s.id === selectedId && (
            <div className="absolute top-2 right-2 flex gap-0.5 rounded-md bg-card/95 p-0.5 shadow">
              {!["title", "section", "references"].includes(s.slideType) && <Button variant="ghost" size="icon-xs" aria-label="Regenerate slide" onClick={() => onRegenerate(s.id)}><RefreshCw /></Button>}
              <Button variant="ghost" size="icon-xs" aria-label="Duplicate slide" onClick={() => onDuplicate(s.id)}><Copy /></Button>
              <Button variant="ghost" size="icon-xs" aria-label="Delete slide" onClick={() => onDelete(s.id)}><Trash2 /></Button>
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
