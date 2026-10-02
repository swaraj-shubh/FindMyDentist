"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_PERSONAS, type Persona } from "@/lib/config/demo-users";
import { PRODUCTS, type ProductId } from "@/lib/config/products";
import { FmdMark } from "./brand";
import { useSwitchPersona } from "./user-menu";

/** Permission-denied state with a one-click demo persona switch (no separate login per workspace). */
export function PersonaGate({ product, personas, signedIn }: { product: ProductId; personas: Persona[]; signedIn: boolean }) {
  const switchPersona = useSwitchPersona();
  const p = PRODUCTS[product];
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 text-center shadow-sm">
        <FmdMark color={p.color} className="mx-auto size-12" />
        <h1 className="mt-5 text-xl font-semibold">{p.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
        {signedIn && (
          <p className="mt-6 flex items-start gap-2 rounded-xl bg-muted p-3 text-left text-sm">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
            Your current role doesn't have access to this workspace.
          </p>
        )}
        <div className="mt-6 space-y-2">
          {personas.map((persona) => (
            <Button key={persona} className="h-auto w-full flex-col items-start gap-0 py-3" variant={persona === personas[0] ? "default" : "outline"} onClick={() => switchPersona(persona, true)}>
              <span>Continue as {DEMO_PERSONAS[persona].label}</span>
              <span className="text-xs font-normal opacity-80">{DEMO_PERSONAS[persona].description}</span>
            </Button>
          ))}
        </div>
        <Button asChild variant="link" className="mt-4">
          <Link href="/home">Back to FMD</Link>
        </Button>
      </div>
    </main>
  );
}
