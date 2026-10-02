"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const SUGGESTIONS = ["Tooth pain", "Bleeding gums", "Broken tooth", "Whitening", "Missing tooth", "Braces for adults"];

type Recognition = { start(): void; stop(): void; lang: string; interimResults: boolean; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null };

/** Voice input via the browser's native speech recognition where available. */
export function useVoice(onText: (t: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const rec = useRef<Recognition | null>(null);
  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = "en-IN";
    r.interimResults = false;
    r.onresult = (e) => onText(Array.from(e.results).map((x) => x[0].transcript).join(" "));
    r.onend = () => setListening(false);
    rec.current = r;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- feature detection must run client-side
    setSupported(true);
  }, [onText]);
  return {
    supported,
    listening,
    toggle: () => {
      if (!rec.current) return;
      if (listening) rec.current.stop();
      else {
        rec.current.start();
        setListening(true);
      }
    },
  };
}

export function HeroSearch() {
  const router = useRouter();
  const [text, setText] = useState("");
  const voice = useVoice(setText);

  function submit(q = text) {
    if (q.trim().length < 3) return;
    router.push(`/assistant?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="relative rounded-3xl border bg-card p-2 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-3 focus-within:ring-ring/20"
      >
        <label htmlFor="hero-q" className="sr-only">Describe your dental problem</label>
        <textarea
          id="hero-q"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Describe your dental problem… e.g. “My lower molar hurts when I drink cold water”"
          className="w-full resize-none bg-transparent px-4 pt-3 text-base outline-none placeholder:text-muted-foreground sm:text-lg"
        />
        <div className="flex items-center justify-end gap-2 px-2 pb-1">
          {voice.supported && (
            <Button type="button" variant="ghost" size="icon-lg" onClick={voice.toggle} aria-pressed={voice.listening} aria-label={voice.listening ? "Stop voice input" : "Speak your problem"} className={cn(voice.listening && "animate-pulse text-destructive")}>
              {voice.listening ? <MicOff /> : <Mic />}
            </Button>
          )}
          <Button type="submit" size="lg" className="rounded-full px-4" disabled={text.trim().length < 3}>
            Get guidance <ArrowRight />
          </Button>
        </div>
      </form>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Try:</span>
        {SUGGESTIONS.slice(0, 4).map((s) => (
          <button key={s} type="button" onClick={() => submit(s)} className="rounded-full border bg-card px-3 py-1 text-sm transition-colors hover:border-primary/40 hover:bg-secondary">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
