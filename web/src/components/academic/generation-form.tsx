"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/shared/native-select";
import { api } from "@/lib/api-client";
import { BLUEPRINT_STAGES, DURATIONS } from "@/lib/academic-shared";
import { SPECIALTY_NAMES } from "@/lib/config/specialties";
import type { AcademicProject, ProjectKind } from "@/types/academic";
import { StageProgress } from "./blueprint-stepper";

const COPY: Record<ProjectKind, { title: string; cta: string }> = {
  seminar: { title: "Create seminar", cta: "Create blueprint" },
  journal_club: { title: "Journal club", cta: "Create blueprint" },
  case: { title: "Case presentation", cta: "Create blueprint" },
  poster: { title: "Poster", cta: "Create blueprint" },
};

export function GenerationForm({ kind = "seminar", defaults }: { kind?: ProjectKind; defaults: { specialty: string; level: string; topic?: string } }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [topic, setTopic] = useState(defaults.topic ?? "");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setErrors({});
    try {
      const [project] = await Promise.all([api<AcademicProject>("/api/v1/academic/projects", { body: { ...f, kind } }), new Promise((r) => setTimeout(r, 2300))]);
      router.push(`/academic/studio/${project.id}`);
    } catch (err) {
      const x = err as Error & { issues?: Record<string, string[]> };
      setErrors(x.issues ?? {});
      toast.error(x.message);
      setBusy(false);
    }
  }

  if (busy) return <div className="mx-auto max-w-xl"><StageProgress title="Generating blueprint…" stages={BLUEPRINT_STAGES} running /></div>;

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-xl space-y-5 rounded-2xl border bg-card p-6">
      <div className="space-y-1.5">
        <Label htmlFor="topic">Topic</Label>
        <Input id="topic" name="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Calcium Metabolism" className="h-11 text-base" aria-invalid={!!errors.topic} autoFocus />
        {errors.topic && <p className="text-sm text-destructive">{errors.topic[0]}</p>}
        {!topic && <button type="button" onClick={() => setTopic("Calcium Metabolism")} className="text-xs text-primary hover:underline">Try the flagship benchmark: Calcium Metabolism</button>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5"><Label htmlFor="specialty">Specialty</Label><NativeSelect id="specialty" name="specialty" defaultValue={defaults.specialty} className="w-full">{SPECIALTY_NAMES.map((s) => <option key={s}>{s}</option>)}</NativeSelect></div>
        <div className="space-y-1.5"><Label htmlFor="level">Academic level</Label><NativeSelect id="level" name="level" defaultValue={defaults.level} className="w-full"><option>BDS</option><option>MDS</option><option>Faculty</option></NativeSelect></div>
        <div className="space-y-1.5"><Label htmlFor="duration">Presentation duration</Label><NativeSelect id="duration" name="duration" defaultValue="45–60 min" className="w-full">{DURATIONS.map((d) => <option key={d}>{d}</option>)}</NativeSelect></div>
        <div className="space-y-1.5"><Label htmlFor="slideCount">Number of slides</Label><Input id="slideCount" name="slideCount" type="number" min={10} max={150} defaultValue={kind === "seminar" ? 100 : 30} aria-invalid={!!errors.slideCount} />{errors.slideCount && <p className="text-sm text-destructive">{errors.slideCount[0]}</p>}</div>
      </div>
      <div className="space-y-1.5"><Label htmlFor="citationStyle">Citation style</Label><NativeSelect id="citationStyle" name="citationStyle" defaultValue="Vancouver" className="w-full"><option>Vancouver</option><option>APA</option><option>Harvard</option></NativeSelect></div>
      <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">The specialty changes the academic emphasis — the same topic is framed differently for each specialty. You'll review and edit the outline before any slide is generated.</p>
      <Button type="submit" size="lg" className="w-full">{busy ? <Loader2 className="animate-spin" /> : <Wand2 />}{COPY[kind].cta}</Button>
    </form>
  );
}
