import type { Metadata } from "next";
import Image from "next/image";
import { Mail } from "lucide-react";
import { FmdMark } from "@/components/shared/brand";
import { SiteFooter } from "@/components/shared/site-footer";
import { Instrument_Serif } from "next/font/google";
import { CONTACT } from "@/lib/config/contact";
import { cn } from "@/lib/utils";

const serif = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"] });

export const metadata: Metadata = { title: "FindMyDentist", description: "Something good is coming to dentistry. Stay tuned. Be ready." };

export default function UnderConstruction() {
  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-background text-left">
      <Image src="/website-under-construction.jpg" alt="" fill priority sizes="100vw" className="-z-20 object-cover object-[65%_center]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/85 to-background/30" aria-hidden />

      <header className="border-b bg-card px-6 sm:px-10">
        <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between" aria-label="Site">
          <span className="flex items-center gap-2.5">
            <FmdMark className="size-9" />
            <span className="text-lg font-semibold tracking-tight">FindMyDentist</span>
          </span>
          <a href={`mailto:${CONTACT.email}`} className="inline-flex h-9 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
            <Mail className="size-4" aria-hidden />
            Contact us
          </a>
        </nav>
      </header>

      <section className="flex flex-1 flex-col justify-center px-6 py-16 sm:px-10">
        <div className="mx-auto w-full max-w-5xl">
          <p className="font-mono text-[11px] font-medium tracking-[0.1em] text-muted-foreground uppercase sm:text-xs sm:tracking-[0.18em]">
            For patients · clinics · dental students
          </p>
          <h1 className={cn(serif.className, "mt-4 max-w-3xl text-[clamp(3rem,7vw,5.75rem)] leading-[0.95] tracking-tight text-foreground")}>
            Something good is coming to dentistry.
          </h1>
          <p className={cn(serif.className, "mt-5 text-[clamp(1.75rem,3.2vw,2.5rem)] text-muted-foreground italic")}>
            Stay tuned. Be ready.
          </p>
          {/* Construction-tape progress bar */}
          <div className="mt-10 h-3.5 w-64 overflow-hidden rounded-full border bg-card p-0.5" role="img" aria-label="Work in progress">
            <div className="tape-bar h-full w-full animate-[tape_1.2s_linear_infinite] rounded-full bg-[repeating-linear-gradient(135deg,var(--warning)_0_10px,oklch(0.25_0.02_260)_10px_20px)] bg-[length:28px_100%]" />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
