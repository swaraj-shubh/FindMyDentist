"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/shared/native-select";
import { SLIDE_TYPES } from "@/lib/academic-shared";
import type { Slide } from "@/types/academic";

type Patch = Partial<Pick<Slide, "title" | "purpose" | "keyPoints" | "slideType" | "visualRequirement" | "specialtyRelevance" | "speakerNotes">>;

/** Controlled by the selected slide; commits to the parent on blur so typing never fights the server. */
export function SlideProperties({ slide, onCommit, onRegenerate, regenerating }: { slide: Slide; onCommit: (p: Patch) => void; onRegenerate: () => void; regenerating: boolean }) {
  const [draft, setDraft] = useState({ title: slide.title, purpose: slide.purpose, keyPoints: slide.keyPoints, visualRequirement: slide.visualRequirement, specialtyRelevance: slide.specialtyRelevance });
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the draft when a different slide (or a regeneration) arrives
    setDraft({ title: slide.title, purpose: slide.purpose, keyPoints: slide.keyPoints, visualRequirement: slide.visualRequirement, specialtyRelevance: slide.specialtyRelevance });
  }, [slide.id, slide.title, slide.purpose, slide.keyPoints, slide.visualRequirement, slide.specialtyRelevance]);
  const locked = ["title", "references"].includes(slide.slideType);
  const commit = (p: Patch) => onCommit(p);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="p-type">Slide type</Label>
        <NativeSelect id="p-type" value={slide.slideType} onChange={(e) => commit({ slideType: e.target.value as Slide["slideType"] })} className="w-full" disabled={locked}>
          {SLIDE_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
        </NativeSelect>
      </div>
      <div className="space-y-1.5"><Label htmlFor="p-title">Title</Label><Input id="p-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} onBlur={() => draft.title !== slide.title && commit({ title: draft.title })} maxLength={200} /></div>
      <div className="space-y-1.5"><Label htmlFor="p-purpose">Purpose</Label><Textarea id="p-purpose" rows={2} value={draft.purpose} onChange={(e) => setDraft({ ...draft, purpose: e.target.value })} onBlur={() => draft.purpose !== slide.purpose && commit({ purpose: draft.purpose })} /></div>
      {slide.slideType !== "references" && (
        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium">Key points</legend>
          {draft.keyPoints.map((k, i) => (
            <div key={i} className="flex gap-1">
              <Textarea aria-label={`Key point ${i + 1}`} rows={2} value={k} onChange={(e) => setDraft({ ...draft, keyPoints: draft.keyPoints.map((x, j) => (j === i ? e.target.value : x)) })} onBlur={() => JSON.stringify(draft.keyPoints) !== JSON.stringify(slide.keyPoints) && commit({ keyPoints: draft.keyPoints.filter((x) => x.trim()) })} className="min-h-0 flex-1 text-sm" />
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove point ${i + 1}`} onClick={() => { const next = draft.keyPoints.filter((_, j) => j !== i); setDraft({ ...draft, keyPoints: next }); commit({ keyPoints: next }); }}><Trash2 /></Button>
            </div>
          ))}
          {draft.keyPoints.length < 8 && <Button type="button" variant="outline" size="sm" onClick={() => setDraft({ ...draft, keyPoints: [...draft.keyPoints, ""] })}><Plus />Add point</Button>}
        </fieldset>
      )}
      <div className="space-y-1.5"><Label htmlFor="p-vis">Visual</Label><Input id="p-vis" value={draft.visualRequirement} onChange={(e) => setDraft({ ...draft, visualRequirement: e.target.value })} onBlur={() => draft.visualRequirement !== slide.visualRequirement && commit({ visualRequirement: draft.visualRequirement })} /></div>
      <div className="space-y-1.5"><Label htmlFor="p-rel">Specialty relevance</Label><Textarea id="p-rel" rows={2} value={draft.specialtyRelevance} onChange={(e) => setDraft({ ...draft, specialtyRelevance: e.target.value })} onBlur={() => draft.specialtyRelevance !== slide.specialtyRelevance && commit({ specialtyRelevance: draft.specialtyRelevance })} /></div>
      <div className="flex items-center justify-between border-t pt-3 text-sm">
        <span className="text-muted-foreground">Confidence <strong className="text-foreground">{Math.round(slide.confidence * 100)}%</strong></span>
        {!["title", "section", "references"].includes(slide.slideType) && <Button variant="outline" size="sm" onClick={onRegenerate} disabled={regenerating}><RefreshCw className={regenerating ? "animate-spin" : ""} />Regenerate</Button>}
      </div>
    </div>
  );
}

export function SpeakerNotesPanel({ slide, onCommit }: { slide: Slide; onCommit: (notes: string) => void }) {
  const [notes, setNotes] = useState(slide.speakerNotes);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset when the selected slide changes
    setNotes(slide.speakerNotes);
  }, [slide.id, slide.speakerNotes]);
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Speaker notes</Label>
      <Textarea id="notes" rows={12} value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== slide.speakerNotes && onCommit(notes)} maxLength={4000} />
      <p className="text-xs text-muted-foreground">{notes.split(/\s+/).filter(Boolean).length} words · about {Math.max(1, Math.round(notes.split(/\s+/).filter(Boolean).length / 130))} min</p>
    </div>
  );
}
