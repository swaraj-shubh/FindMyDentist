"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, Maximize2, Shuffle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VivaQuestion } from "@/types/academic";

const LEVEL = { basic: 1, intermediate: 2, advanced: 3 } as const;

/** Full-screen faculty-style questioning, generated from the exact presentation. */
export function VivaPanel({ questions, title, onExit }: { questions: VivaQuestion[]; title: string; onExit?: () => void }) {
  const [order, setOrder] = useState(() => questions.map((_, i) => i));
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const [self, setSelf] = useState<Record<string, boolean>>({});
  const q = questions[order[i]];
  if (!q) return <p className="p-8 text-center text-muted-foreground">No viva questions yet — generate the presentation first.</p>;
  const go = (n: number) => { setI(Math.max(0, Math.min(order.length - 1, n))); setShown(false); };
  const known = Object.values(self).filter(Boolean).length;

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-3xl flex-col justify-center gap-8 px-4 py-10">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="font-medium tracking-widest uppercase">Viva mode · {title}</span>
        <span className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setOrder([...order].sort(() => Math.random() - 0.5)); setI(0); setShown(false); }}><Shuffle />Shuffle</Button>
          {onExit && <Button variant="ghost" size="sm" onClick={onExit}><X />Exit</Button>}
        </span>
      </div>
      <div>
        <p className="mb-3 text-sm text-muted-foreground tabular-nums">Question {String(i + 1).padStart(2, "0")} / {order.length} · {known} confident</p>
        <h2 className="text-3xl leading-snug font-semibold tracking-tight text-balance sm:text-4xl">{q.question}</h2>
        <div className="mt-5 flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">Difficulty</span>
          <span className="flex gap-1" aria-label={q.difficulty}>{[1, 2, 3].map((n) => <span key={n} className={cn("h-2 w-8 rounded-full", n <= LEVEL[q.difficulty] ? "bg-primary" : "bg-muted")} />)}</span>
          <span className="capitalize">{q.difficulty}</span>
        </div>
      </div>
      {shown ? (
        <div className="space-y-4 rounded-2xl border bg-card p-6 motion-safe:animate-in motion-safe:fade-in-0">
          <p className="leading-relaxed">{q.answer}</p>
          <div>
            <p className="mb-2 text-sm font-medium">Expected concepts</p>
            <ul className="flex flex-wrap gap-2">{q.concepts.map((c) => <li key={c} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"><Check className="size-3.5 text-success" aria-hidden />{c}</li>)}</ul>
          </div>
          <div className="flex gap-2 border-t pt-4">
            <Button variant={self[q.id] ? "default" : "outline"} onClick={() => setSelf({ ...self, [q.id]: true })}>I knew this</Button>
            <Button variant={self[q.id] === false ? "default" : "outline"} onClick={() => setSelf({ ...self, [q.id]: false })}>Revise</Button>
          </div>
        </div>
      ) : (
        <Button size="lg" variant="outline" className="w-fit" onClick={() => setShown(true)}><Eye />Show answer</Button>
      )}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => go(i - 1)} disabled={i === 0}><ArrowLeft />Previous</Button>
        <Button onClick={() => go(i + 1)} disabled={i === order.length - 1}>Next<ArrowRight /></Button>
      </div>
    </div>
  );
}

export function FullscreenButton() {
  return <Button variant="ghost" size="icon" aria-label="Toggle full screen" onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen())}><Maximize2 /></Button>;
}
