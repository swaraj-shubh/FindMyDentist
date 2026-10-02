"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { cn, timeAgo } from "@/lib/utils";
import type { Message } from "@/types/clinic";

/** Clinic AI (blueprint §4): suggested replies are generated server-side in the prototype's rule engine. */
export function suggest(last: string, name: string) {
  const first = name.split(" ")[0];
  const m = last.toLowerCase();
  if (/sore|pain|hurt|bleed/.test(m)) return [`Hi ${first}, some soreness for 2–3 days is normal. Warm salt-water rinses help. If it worsens or swells, call us and we'll see you today.`, `Sorry you're uncomfortable, ${first}. Shall we book a quick review tomorrow?`];
  if (/chew|eat|food/.test(m)) return [`Hi ${first}, please stay on soft food on that side until the doctor reviews it.`, `Good to hear! Avoid hard or sticky food on that side for now.`];
  if (/bring|inside|accompan|daughter|son|family/.test(m)) return [`Of course, ${first} — one family member is welcome in the operatory.`];
  if (/time|reschedul|late|cancel/.test(m)) return [`No problem, ${first}. Which day and time suit you? We'll check availability.`];
  return [`Hi ${first}, thanks for your message — the doctor will get back to you shortly.`, `Thanks ${first}! Anything else we can help with before your visit?`];
}

export function MessageThread({ patientId, patientName, messages }: { patientId: string; patientName: string; messages: Message[] }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [messages.length]);
  const lastPatient = [...messages].reverse().find((m) => m.sender === "patient");
  const suggestions = lastPatient && messages.at(-1)?.sender === "patient" ? suggest(lastPatient.body, patientName) : [];

  async function send(text = body) {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await api("/api/v1/clinic/messages", { body: { patientId, body: text } });
      setBody("");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-[28rem] flex-col rounded-xl border bg-card">
      <div className="flex-1 space-y-2 overflow-y-auto p-4" aria-live="polite">
        {messages.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No messages yet. Say hello to {patientName.split(" ")[0]}.</p>}
        {messages.map((m) => (
          <div key={m.id} className={cn("max-w-[80%] rounded-2xl px-3.5 py-2 text-sm", m.sender === "clinic" ? "ml-auto rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted")}>
            {m.body}
            <span className={cn("mt-0.5 block text-[10px]", m.sender === "clinic" ? "text-primary-foreground/70" : "text-muted-foreground")}>{timeAgo(m.createdAt)}</span>
          </div>
        ))}
        <div ref={end} />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t px-3 py-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground"><Sparkles className="size-3.5 text-primary" aria-hidden />Suggested</span>
          {suggestions.map((s) => <button key={s} onClick={() => setBody(s)} className="max-w-full truncate rounded-full border px-3 py-1 text-xs hover:bg-secondary" title={s}>{s}</button>)}
        </div>
      )}
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t p-3">
        <label htmlFor={`msg-${patientId}`} className="sr-only">Message</label>
        <input id={`msg-${patientId}`} value={body} onChange={(e) => setBody(e.target.value)} maxLength={1000} placeholder="Write a message…" className="h-10 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" />
        <Button type="submit" disabled={busy || !body.trim()}>{busy ? <Loader2 className="animate-spin" /> : <Send />}Send</Button>
      </form>
    </div>
  );
}
