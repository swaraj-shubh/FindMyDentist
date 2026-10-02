"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDown, ArrowUp, Copy, GripVertical, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { OutlineSection } from "@/types/academic";

const uid = () => `sec${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export function OutlineEditor({ projectId, outline: initial, onGenerate, generating }: { projectId: string; outline: OutlineSection[]; onGenerate: () => void; generating: boolean }) {
  const router = useRouter();
  const [outline, setOutline] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const total = outline.reduce((s, x) => s + x.slides, 0) + 2;

  const edit = (next: OutlineSection[]) => { setOutline(next); setDirty(true); };
  const patch = (id: string, p: Partial<OutlineSection>) => edit(outline.map((s) => (s.id === id ? { ...s, ...p } : s)));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= outline.length || from === to) return;
    const n = [...outline];
    n.splice(to, 0, n.splice(from, 1)[0]);
    edit(n);
  };

  async function save() {
    setSaving(true);
    try {
      await api("/api/v1/academic/projects", { method: "PATCH", body: { id: projectId, outline } });
      setDirty(false);
      toast.success("Outline saved");
      router.refresh();
      return true;
    } catch (e) {
      toast.error((e as Error).message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function regenerate() {
    try {
      await api("/api/v1/academic/generate", { body: { mode: "blueprint", projectId } });
      toast.success("Blueprint regenerated from your inputs");
      router.refresh();
      setDirty(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <ol className="space-y-2">
        {outline.map((s, i) => (
          <li
            key={s.id}
            draggable
            onDragStart={() => setDrag(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (drag !== null) move(drag, i); setDrag(null); }}
            className={cn("rounded-xl border bg-card transition-shadow", drag === i && "opacity-50", open === s.id && "shadow-md")}
          >
            <div className="flex items-center gap-2 p-2.5">
              <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" aria-hidden />
              <span className="w-7 text-sm text-muted-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <button className="min-w-0 flex-1 truncate text-left font-medium" onClick={() => setOpen(open === s.id ? null : s.id)} aria-expanded={open === s.id}>{s.title}</button>
              <span className="hidden text-xs text-muted-foreground sm:inline">{s.slides} slides</span>
              <Button variant="ghost" size="icon-sm" aria-label="Move up" onClick={() => move(i, i - 1)} disabled={i === 0}><ArrowUp /></Button>
              <Button variant="ghost" size="icon-sm" aria-label="Move down" onClick={() => move(i, i + 1)} disabled={i === outline.length - 1}><ArrowDown /></Button>
              <Button variant="ghost" size="icon-sm" aria-label="Duplicate section" onClick={() => edit([...outline.slice(0, i + 1), { ...s, id: uid(), title: `${s.title} (copy)` }, ...outline.slice(i + 1)])}><Copy /></Button>
              <Button variant="ghost" size="icon-sm" aria-label="Delete section" disabled={outline.length === 1} onClick={() => edit(outline.filter((x) => x.id !== s.id))}><Trash2 /></Button>
            </div>
            {open === s.id && (
              <div className="grid gap-3 border-t p-3 sm:grid-cols-[1fr_100px]">
                <div className="space-y-1"><label htmlFor={`t-${s.id}`} className="text-xs text-muted-foreground">Section title</label><Input id={`t-${s.id}`} value={s.title} onChange={(e) => patch(s.id, { title: e.target.value })} /></div>
                <div className="space-y-1"><label htmlFor={`n-${s.id}`} className="text-xs text-muted-foreground">Slides</label><Input id={`n-${s.id}`} type="number" min={1} max={40} value={s.slides} onChange={(e) => patch(s.id, { slides: Math.max(1, Math.min(40, Number(e.target.value) || 1)) })} /></div>
                <div className="space-y-1 sm:col-span-2"><label htmlFor={`s-${s.id}`} className="text-xs text-muted-foreground">Subtopics (one per line)</label><Textarea id={`s-${s.id}`} rows={Math.max(3, s.subtopics.length)} value={s.subtopics.join("\n")} onChange={(e) => patch(s.id, { subtopics: e.target.value.split("\n") })} onBlur={() => patch(s.id, { subtopics: s.subtopics.map((x) => x.trim()).filter(Boolean) })} /></div>
              </div>
            )}
          </li>
        ))}
      </ol>
      <Button variant="outline" onClick={() => { const id = uid(); edit([...outline, { id, title: "New section", subtopics: ["New topic"], slides: 3 }]); setOpen(id); }}><Plus />Add section</Button>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card/95 p-4 shadow-lg backdrop-blur">
        <p className="text-sm"><strong className="tabular-nums">{total}</strong> slides planned across {outline.length} sections{dirty && <span className="ml-2 text-warning">· unsaved changes</span>}</p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={regenerate} disabled={generating}>Reset outline</Button>
          {dirty && <Button variant="outline" onClick={save} disabled={saving}>{saving && <Loader2 className="animate-spin" />}Save outline</Button>}
          <Button disabled={generating} onClick={async () => { if (dirty && !(await save())) return; onGenerate(); }}>Generate presentation</Button>
        </div>
      </div>
    </div>
  );
}
