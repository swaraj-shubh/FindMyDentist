import type { Metadata } from "next";
import Image from "next/image";
import { FmdMark } from "@/components/shared/brand";
import { SiteFooter } from "@/components/shared/site-footer";

export const metadata: Metadata = { title: "FindMyDentist", description: "FindMyDentist is under construction. Launching soon." };

export default function UnderConstruction() {
  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center gap-6 overflow-hidden bg-background text-center">
      <Image src="/website-under-construction.jpg" alt="" fill priority sizes="100vw" className="-z-20 object-cover object-[65%_center]" />
      <div className="absolute inset-0 -z-10 bg-background/60" aria-hidden />

      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
        <div className="glass flex size-24 items-center justify-center rounded-3xl"><FmdMark className="size-16" /></div>
        <h1 className="w-fit max-w-[44rem] glass rounded-3xl px-6 py-4 text-4xl font-semibold tracking-tight text-balance sm:px-10 sm:py-6 sm:text-5xl">
          Site under construction
        </h1>
        <p className="max-w-md text-lg font-medium text-foreground [text-shadow:0_0_12px_var(--background),0_0_4px_var(--background)]">
          FindMyDentist is launching soon.
        </p>
        {/* Construction-tape progress bar */}
        <div className="glass h-3.5 w-64 overflow-hidden rounded-full p-0.5" role="img" aria-label="Work in progress">
          <div className="tape-bar h-full w-full animate-[tape_1.2s_linear_infinite] rounded-full bg-[repeating-linear-gradient(135deg,var(--warning)_0_10px,oklch(0.25_0.02_260)_10px_20px)] bg-[length:28px_100%]" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
