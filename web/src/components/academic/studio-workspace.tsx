"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Loader2, Mic, Play, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api-client";
import { GENERATION_STAGES } from "@/lib/academic-shared";
import { cn } from "@/lib/utils";
import type { AcademicProject, OutlineSection, Paper, QcReport, Slide, VivaQuestion } from "@/types/academic";
import { StageProgress } from "./blueprint-stepper";
import { CitationList } from "./citation-list";
import { ExportMenu } from "./export-panel";
import { OutlineEditor } from "./outline-editor";
import { QcPanel } from "./qc-panel";
import { SlideRail } from "./slide-grid";
import { SlideProperties, SpeakerNotesPanel } from "./slide-editor";
import { SlidePreview } from "./slide-preview";
import { FullscreenButton, VivaPanel } from "./viva-panel";

type SlidePatch = Partial<Slide>;
type SaveState = "saved" | "saving" | "error";

export function StudioWorkspace({ project, slides: initialSlides, qc, papers, viva }: { project: AcademicProject; slides: Slide[]; qc: QcReport; papers: Paper[]; viva: VivaQuestion[] }) {
  const router = useRouter();
  const [slides, setSlides] = useState(initialSlides);
  const [selectedId, setSelectedId] = useState(initialSlides[0]?.id ?? "");
  const [save, setSave] = useState<SaveState>("saved");
  const [mode, setMode] = useState<"edit" | "present" | "viva">("edit");
  const [regenId, setRegenId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => setSlides(initialSlides), [initialSlides]);

  const selected = slides.find((s) => s.id === selectedId) ?? slides[0];
  const index = slides.findIndex((s) => s.id === selected?.id);
  const cited = useMemo(() => (selected ? selected.citations.map((id) => papers.find((p) => p.id === id)).filter((p): p is Paper => !!p) : []), [selected, papers]);

  const mutate = useCallback(async (body: Record<string, unknown>) => {
    setSave("saving");
    try {
      const next = await api<Slide[]>("/api/v1/academic/slides", { method: "PATCH", body: { projectId: project.id, ...body } });
      setSlides(next);
      setSave("saved");
      clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => router.refresh(), 600); // refresh QC after edits settle
      return next;
    } catch (e) {
      setSave("error");
      toast.error((e as Error).message);
      return null;
    }
  }, [project.id, router]);

  const commit = (slideId: string) => (patch: SlidePatch) => {
    setSlides((s) => s.map((x) => (x.id === slideId ? { ...x, ...patch } : x))); // optimistic
    mutate({ op: "update", slideId, patch });
  };

  async function regenerate(id: string) {
    setRegenId(id);
    try {
      const updated = await api<Slide>("/api/v1/academic/generate", { body: { mode: "slide", projectId: project.id, slideId: id } });
      setSlides((s) => s.map((x) => (x.id === id ? updated : x)));
      toast.success("Slide regenerated — only this slide changed");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setRegenId(null);
    }
  }

  async function generate() {
    setGenerating(true);
    try {
      await Promise.all([api("/api/v1/academic/generate", { body: { mode: "slides", projectId: project.id } }), new Promise((r) => setTimeout(r, 3600))]);
      toast.success("Presentation generated");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  const step = useCallback((d: number) => {
    const n = slides[Math.max(0, Math.min(slides.length - 1, index + d))];
    if (n) setSelectedId(n.id);
  }, [slides, index]);

  // Keyboard: arrows move between slides (when not typing), Esc leaves present/viva.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement)?.tagName);
      if (e.key === "Escape" && mode !== "edit") setMode("edit");
      if (typing || (mode !== "edit" && mode !== "present")) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || (mode === "present" && e.key === " ")) { e.preventDefault(); step(1); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); step(-1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, step]);

  // ── Blueprint stage ────────────────────────────────────────────────────────
  if (project.status !== "generated" || !selected)
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-8">
        <Link href="/academic/studio" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Projects</Link>
        <div>
          <p className="text-sm font-medium text-product-academic">Step 2 · Review the blueprint</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{project.title}</h1>
          <p className="mt-1 text-muted-foreground">{project.level} {project.specialty} · {project.duration} · {project.citationStyle}. Reorder, edit or remove sections — slides are generated from this outline in controlled batches.</p>
        </div>
        {generating ? <StageProgress title="Generating presentation…" stages={GENERATION_STAGES} running durationMs={3400} /> : <OutlineEditor projectId={project.id} outline={project.outline as OutlineSection[]} onGenerate={generate} generating={generating} />}
      </div>
    );

  // ── Present mode ───────────────────────────────────────────────────────────
  if (mode === "present")
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
        <div className="flex items-center justify-between p-3 text-sm">
          <span className="opacity-70">{selected.slideNumber} / {slides.length}</span>
          <span className="flex gap-1"><FullscreenButton /><Button variant="ghost" size="icon" onClick={() => setMode("edit")} aria-label="Exit presentation" className="text-white hover:bg-white/10 hover:text-white"><X /></Button></span>
        </div>
        <div className="flex flex-1 items-center justify-center px-4"><div className="w-full max-w-[min(100%,calc((100dvh-9rem)*16/9))] overflow-hidden rounded-lg"><SlidePreview slide={selected} /></div></div>
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-3">
          <Button variant="ghost" size="icon" onClick={() => step(-1)} disabled={index === 0} aria-label="Previous slide" className="text-white hover:bg-white/10 hover:text-white"><ChevronLeft /></Button>
          <p className="line-clamp-2 text-center text-sm text-white/70">{selected.speakerNotes}</p>
          <Button variant="ghost" size="icon" onClick={() => step(1)} disabled={index === slides.length - 1} aria-label="Next slide" className="text-white hover:bg-white/10 hover:text-white"><ChevronRight /></Button>
        </div>
      </div>
    );

  if (mode === "viva")
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
        <VivaPanel questions={viva} title={project.title} onExit={() => setMode("edit")} />
      </div>
    );

  // ── Editor ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col no-print">
      <div className="flex flex-wrap items-center gap-3 border-b px-4 py-2.5">
        <Button asChild variant="ghost" size="sm"><Link href="/academic/studio"><ArrowLeft />Projects</Link></Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-semibold">{project.title}</h1>
          <p className="flex items-center gap-1 text-xs text-muted-foreground" aria-live="polite">
            {save === "saving" ? <><Loader2 className="size-3 animate-spin" />Saving…</> : save === "error" ? <span className="text-destructive">Couldn't save</span> : <><Check className="size-3 text-success" />Saved</>}
            <span>· {slides.length} slides · {project.level} {project.specialty}</span>
          </p>
        </div>
        <Button onClick={() => setMode("present")}><Play />Present</Button>
        <Button variant="outline" onClick={() => setMode("viva")} disabled={!viva.length}><Mic />Viva</Button>
        <ExportMenu projectId={project.id} />
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[200px_1fr_340px] xl:grid-cols-[220px_1fr_360px]">
        <aside className="hidden overflow-y-auto border-r bg-muted/30 lg:block"><SlideRail slides={slides} selectedId={selected.id} onSelect={setSelectedId} onMove={(id, to) => mutate({ op: "move", slideId: id, toIndex: to })} onDuplicate={(id) => mutate({ op: "duplicate", slideId: id })} onDelete={(id) => { mutate({ op: "delete", slideId: id }).then(() => setSelectedId((cur) => (cur === id ? slides[Math.max(0, index - 1)]?.id ?? cur : cur))); }} onRegenerate={regenerate} /></aside>

        <section className="flex min-h-0 flex-col overflow-y-auto bg-[oklch(0.95_0.006_260)] p-4 dark:bg-muted/20 lg:p-8" aria-label="Slide canvas">
          <div className="mx-auto w-full max-w-4xl">
            <div className={cn("overflow-hidden rounded-xl shadow-lg ring-1 ring-black/10 transition-opacity", regenId === selected.id && "opacity-50")}><SlidePreview slide={selected} /></div>
            <div className="mt-4 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => step(-1)} disabled={index === 0}><ChevronLeft />Prev</Button>
              <span className="text-sm text-muted-foreground tabular-nums">Slide {selected.slideNumber} of {slides.length}</span>
              <Button variant="outline" size="sm" onClick={() => step(1)} disabled={index === slides.length - 1}>Next<ChevronRight /></Button>
            </div>
            <p className="mt-6 rounded-xl bg-card p-4 text-sm ring-1 ring-border"><span className="font-medium">Speaker notes · </span><span className="text-muted-foreground">{selected.speakerNotes}</span></p>
          </div>
        </section>

        <aside className="min-h-0 overflow-y-auto border-t bg-card lg:border-t-0 lg:border-l">
          <Tabs defaultValue="properties" className="gap-0">
            <TabsList variant="line" className="w-full justify-start overflow-x-auto border-b px-2">
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="citations">Citations{cited.length ? ` (${cited.length})` : ""}</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="review">Review{qc.issues.length ? ` (${qc.issues.length})` : ""}</TabsTrigger>
            </TabsList>
            <div className="p-4">
              <TabsContent value="properties"><SlideProperties slide={selected} onCommit={commit(selected.id)} onRegenerate={() => regenerate(selected.id)} regenerating={regenId === selected.id} /></TabsContent>
              <TabsContent value="citations">
                <CitationList papers={cited} />
                <p className="mt-4 text-xs text-muted-foreground">Add sources from the Research workspace, then assign them to slides.</p>
              </TabsContent>
              <TabsContent value="notes"><SpeakerNotesPanel slide={selected} onCommit={(speakerNotes) => commit(selected.id)({ speakerNotes })} /></TabsContent>
              <TabsContent value="review"><QcPanel qc={qc} onSelectSlide={(n) => { const s = slides.find((x) => x.slideNumber === n); if (s) setSelectedId(s.id); }} /></TabsContent>
            </div>
          </Tabs>
        </aside>
      </div>

      <div className="print-only">{slides.map((s) => <div key={s.id} className="print-slide"><SlidePreview slide={s} /></div>)}</div>
    </div>
  );
}
