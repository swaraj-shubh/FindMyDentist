"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ImagePlus, Languages, Loader2, Mic, MicOff, RotateCcw, Sparkles, Stethoscope, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { AssistantResponse } from "@/lib/server/services/assistant-service";
import { AiDisclaimer, UrgencyBanner } from "./ai-triage-banner";
import { DentistCard } from "./dentist-card";
import { SUGGESTIONS, useVoice } from "./hero-search";

const STAGES = ["Detecting language", "Understanding your concern", "Running safety check", "Finding the right specialty", "Matching dentists near you"];

const LIKELIHOOD = { Common: "bg-primary", Possible: "bg-info", "Less likely": "bg-muted-foreground" } as const;

interface Turn {
  question: string;
  answer: AssistantResponse;
}

function Thinking({ stage }: { stage: number }) {
  return (
    <div className="rounded-2xl border bg-card p-5" aria-live="polite">
      <p className="flex items-center gap-2 text-sm font-medium"><Sparkles className="size-4 text-primary" aria-hidden />Analysing…</p>
      <ol className="mt-3 space-y-2">
        {STAGES.map((s, i) => (
          <li key={s} className={cn("flex items-center gap-2 text-sm transition-colors", i > stage ? "text-muted-foreground/60" : i === stage ? "text-foreground" : "text-muted-foreground")}>
            {i < stage ? <Check className="size-4 text-success" aria-hidden /> : i === stage ? <Loader2 className="size-4 animate-spin text-primary" aria-hidden /> : <span className="size-4 rounded-full border" aria-hidden />}
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Answer({ turn }: { turn: Turn }) {
  const a = turn.answer;
  const bookingQuery = new URLSearchParams({ reason: turn.question.slice(0, 200), from: "assistant" }).toString();
  return (
    <div className="space-y-5 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">{a.intent.label}</span>
        {a.intent.alsoMentioned.map((m) => <span key={m} className="rounded-full border px-2.5 py-1 text-muted-foreground">also: {m}</span>)}
        {a.language !== "English" && (
          <span className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-muted-foreground">
            <Languages className="size-3" aria-hidden />Detected {a.language} · replies in English in this prototype
          </span>
        )}
      </div>

      <p className="text-lg leading-relaxed">{a.summary}</p>
      <UrgencyBanner urgency={a.urgency} messages={a.safetyMessages} />
      {a.imageNote && <p className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">{a.imageNote}</p>}

      <section aria-labelledby="causes">
        <h3 id="causes" className="font-semibold">Possible explanations</h3>
        <p className="text-sm text-muted-foreground">Not a diagnosis — a dentist confirms this with an examination.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {a.possibleCauses.map((c) => (
            <div key={c.name} className="rounded-2xl border bg-card p-4">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span className={cn("size-2 rounded-full", LIKELIHOOD[c.likelihood])} aria-hidden />{c.likelihood} possibility
              </span>
              <p className="mt-1.5 font-medium">{c.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border bg-card p-4" aria-labelledby="next">
          <h3 id="next" className="font-semibold">What to do next</h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {a.nextSteps.map((s) => <li key={s} className="flex gap-2"><ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />{s}</li>)}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">Relevant specialty</p>
          <Link href={`/dentists?specialty=${encodeURIComponent(a.specialty)}`} className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground hover:underline">
            <Stethoscope className="size-3.5" aria-hidden />{a.specialty}
          </Link>
        </section>
        <section className="rounded-2xl border bg-card p-4" aria-labelledby="selfcare">
          <h3 id="selfcare" className="font-semibold">Until you're seen</h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {a.selfCare.map((s) => <li key={s} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />{s}</li>)}
          </ul>
        </section>
      </div>

      {a.dentists.length > 0 && (
        <section aria-labelledby="dentists">
          <div className="flex items-end justify-between">
            <h3 id="dentists" className="font-semibold">Dentists who can help</h3>
            <Link href={`/dentists?specialty=${encodeURIComponent(a.specialty)}`} className="text-sm font-medium text-primary hover:underline">View all</Link>
          </div>
          <div className="mt-3 space-y-3">
            {a.dentists.map((d) => <DentistCard key={d.id} dentist={d} bookingQuery={bookingQuery} />)}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Your description travels with the booking so the dentist has context.</p>
        </section>
      )}

      {a.content.length > 0 && (
        <section aria-labelledby="learn">
          <h3 id="learn" className="font-semibold">Learn more</h3>
          <ul className="mt-2 grid gap-2 sm:grid-cols-3">
            {a.content.map((c) => (
              <li key={c.id}>
                <Link href={`/community/${c.id}`} className="block h-full rounded-xl border bg-card p-3 text-sm transition-colors hover:bg-muted/60">
                  <span className="font-medium">{c.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{c.caption}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <AiDisclaimer />
    </div>
  );
}

export function AiChat({ initialQuestion }: { initialQuestion?: string }) {
  const [text, setText] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  const [stage, setStage] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const voice = useVoice(setText);
  const asked = useRef(false);

  const ask = useCallback(async (question: string, hasImage = false) => {
    const q = question.trim();
    if (q.length < 3) return;
    setPending(q);
    setText("");
    setImage(null);
    setStage(0);
    const timer = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 280);
    try {
      // Let the staged pipeline read as real work even though the prototype answers instantly.
      const [answer] = await Promise.all([api<AssistantResponse>("/api/v1/main/assistant", { body: { message: q, hasImage } }), new Promise((r) => setTimeout(r, 1300))]);
      setTurns((t) => [...t, { question: q, answer }]);
    } catch (e) {
      toast.error((e as Error).message);
      setText(q);
    } finally {
      clearInterval(timer);
      setPending(null);
    }
  }, []);

  useEffect(() => {
    if (initialQuestion && !asked.current) {
      asked.current = true;
      ask(initialQuestion);
    }
  }, [initialQuestion, ask]);

  useEffect(() => {
    if (turns.length || pending) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length, pending]);

  const empty = !turns.length && !pending;

  return (
    <div className="mx-auto max-w-3xl">
      {empty && (
        <div className="py-6 text-center sm:py-12">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary"><Sparkles className="size-6 text-primary" aria-hidden /></span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">FMD Dental Assistant</h1>
          <p className="mt-2 text-muted-foreground">Tell me what's going on with your teeth. Type, speak, or add a photo.</p>
        </div>
      )}

      <div className="space-y-10">
        {turns.map((t, i) => (
          <article key={i} className="space-y-5">
            <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground">{t.question}</p>
            <Answer turn={t} />
          </article>
        ))}
        {pending && (
          <div className="space-y-5">
            <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground">{pending}</p>
            <Thinking stage={stage} />
          </div>
        )}
      </div>
      <div ref={bottomRef} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(text, !!image);
        }}
        className={cn("sticky bottom-20 z-10 mt-8 rounded-3xl border bg-card p-2 shadow-lg md:bottom-4", empty && "static shadow-sm")}
      >
        <label htmlFor="assistant-q" className="sr-only">Describe your dental problem</label>
        <textarea
          id="assistant-q"
          rows={empty ? 3 : 1}
          value={text}
          disabled={!!pending}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              ask(text, !!image);
            }
          }}
          placeholder={turns.length ? "Ask a follow-up or describe something else…" : "My lower molar hurts when I drink cold water…"}
          className="w-full resize-none bg-transparent px-4 pt-3 text-base outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center gap-1 px-2 pb-1">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setImage(e.target.files?.[0]?.name ?? null)}
          />
          <Button type="button" variant="ghost" size="sm" onClick={() => fileRef.current?.click()} disabled={!!pending}>
            <ImagePlus /> <span className="hidden sm:inline">Add photo</span>
          </Button>
          {image && (
            <span className="flex max-w-40 items-center gap-1 truncate rounded-full bg-muted px-2 py-0.5 text-xs">
              {image}
              <button type="button" onClick={() => setImage(null)} aria-label="Remove photo"><X className="size-3" /></button>
            </span>
          )}
          {voice.supported && (
            <Button type="button" variant="ghost" size="icon" onClick={voice.toggle} aria-pressed={voice.listening} aria-label={voice.listening ? "Stop voice input" : "Speak"} className={cn(voice.listening && "animate-pulse text-destructive")}>
              {voice.listening ? <MicOff /> : <Mic />}
            </Button>
          )}
          <span className="flex-1" />
          {turns.length > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setTurns([])}><RotateCcw /> New</Button>
          )}
          <Button type="submit" className="rounded-full" disabled={!!pending || text.trim().length < 3}>
            {pending ? <Loader2 className="animate-spin" /> : <ArrowRight />} Get guidance
          </Button>
        </div>
      </form>

      {empty && (
        <>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => ask(s)} className="rounded-full border bg-card px-3 py-1 text-sm transition-colors hover:border-primary/40 hover:bg-secondary">{s}</button>
            ))}
          </div>
          <AiDisclaimer className="mx-auto mt-10 max-w-xl" />
        </>
      )}
    </div>
  );
}
