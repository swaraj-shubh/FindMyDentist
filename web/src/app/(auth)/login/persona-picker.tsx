"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, GraduationCap, Loader2, Smile, Stethoscope, UserCog } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { DEMO_PERSONAS, type Persona } from "@/lib/config/demo-users";

const ICONS = { patient: Smile, dentist: Stethoscope, student: GraduationCap, clinic: UserCog };

export function PersonaPicker({ next }: { next?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Persona | null>(null);

  async function pick(p: Persona) {
    setBusy(p);
    try {
      const { home } = await api<{ home: string }>("/api/v1/session", { body: { persona: p } });
      // Only follow same-site relative paths.
      router.push(next?.startsWith("/") && !next.startsWith("//") ? next : home);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
      setBusy(null);
    }
  }

  return (
    <ul className="space-y-2">
      {(Object.keys(DEMO_PERSONAS) as Persona[]).map((p) => {
        const Icon = ICONS[p];
        return (
          <li key={p}>
            <button onClick={() => pick(p)} disabled={!!busy} className="group flex w-full items-center gap-4 rounded-2xl border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm disabled:opacity-60">
              <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><Icon className="size-5" aria-hidden /></span>
              <span className="flex-1">
                <span className="block font-medium">{DEMO_PERSONAS[p].label}</span>
                <span className="block text-sm text-muted-foreground">{DEMO_PERSONAS[p].description}</span>
              </span>
              {busy === p ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
