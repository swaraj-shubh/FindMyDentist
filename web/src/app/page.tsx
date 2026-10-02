import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GraduationCap, Smile, Stethoscope } from "lucide-react";
import { FmdMark } from "@/components/shared/brand";

export const metadata: Metadata = { title: "Coming soon", description: "FindMyDentist is under construction. Your dental world, connected — launching soon." };

const PRODUCTS = [
  { icon: Smile, name: "FMD", text: "Find dentists, get AI dental guidance, book and keep your records." },
  { icon: Stethoscope, name: "FMD Clinic", text: "Run your practice: calendar, patients, treatments and billing." },
  { icon: GraduationCap, name: "FMD Academic", text: "AI seminars, research, journal club and viva for dental students." },
];

export default function UnderConstruction() {
  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-background">
      <Image src="/website-under-construction.jpg" alt="" fill priority sizes="100vw" className="-z-20 object-cover object-[65%_center]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/70 via-background/20 to-background/70" aria-hidden />

      <header className="mx-auto flex w-full max-w-5xl items-center gap-2.5 px-6 py-6">
        <FmdMark />
        <span className="font-semibold tracking-tight">FindMyDentist</span>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground">
          <span className="relative flex size-2"><span className="absolute inline-flex size-full rounded-full bg-warning opacity-75 motion-safe:animate-ping" /><span className="relative inline-flex size-2 rounded-full bg-warning" /></span>
          Under construction
        </span>
        <h1 className="mt-6 w-fit max-w-[44rem] rounded-3xl border border-white/40 bg-background/55 px-6 py-4 text-4xl font-semibold tracking-tight text-balance shadow-lg backdrop-blur-md sm:px-10 sm:py-6 sm:text-5xl">We're building something for dentistry.</h1>
        <p className="mt-5 max-w-xl text-lg font-medium text-pretty text-foreground [text-shadow:0_0_12px_var(--background),0_0_4px_var(--background)]">FindMyDentist is getting a complete rebuild — one connected platform for patients, clinics and dental academics. The public site is launching soon.</p>

        <ul className="mt-12 grid w-full gap-3 text-left sm:grid-cols-3">
          {PRODUCTS.map((p) => (
            <li key={p.name} className="rounded-2xl border bg-card/80 p-5 backdrop-blur">
              <p.icon className="size-5 text-primary" aria-hidden />
              <h2 className="mt-3 font-semibold">{p.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
            </li>
          ))}
        </ul>

        <Link href="/home" className="group mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          Preview the prototype <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </section>

      <footer className="px-6 py-6 text-center text-sm text-muted-foreground">© {new Date().getFullYear()} FindMyDentist · Prototype build, all data is fictional.</footer>
    </main>
  );
}
