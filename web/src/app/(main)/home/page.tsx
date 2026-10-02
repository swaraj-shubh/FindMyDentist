import Link from "next/link";
import { ArrowRight, CalendarDays, GraduationCap, MapPin, Search, Sparkles, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/shared/native-select";
import { StatusBadge } from "@/components/shared/status-badge";
import { ContentCard } from "@/components/main/content-card";
import { DentistCard } from "@/components/main/dentist-card";
import { HeroSearch } from "@/components/main/hero-search";
import { CITIES } from "@/lib/constants";
import { SPECIALTIES } from "@/lib/config/specialties";
import { dentistsRepo } from "@/lib/server/repositories/dentists";
import { postsRepo } from "@/lib/server/repositories/posts";
import { getUserAppointments } from "@/lib/server/services/booking-service";
import { getRecommendedDentists } from "@/lib/server/services/dentist-service";
import { getSession } from "@/lib/server/session";
import { firstName, formatDate, formatTime, greeting, toISODate } from "@/lib/utils";

const QUESTIONS = [
  "Why do my teeth hurt when I drink cold water?",
  "Is it normal for gums to bleed when brushing?",
  "Should my wisdom teeth be removed?",
  "Implant or bridge for a missing tooth?",
  "When should my child first see a dentist?",
  "How long do clear aligners take?",
];

export default async function HomePage() {
  const user = await getSession();
  const [recommended, posts, dentists, appointments] = await Promise.all([
    getRecommendedDentists(user, undefined, 8),
    postsRepo.all(),
    dentistsRepo.all(),
    user ? getUserAppointments(user.id) : Promise.resolve([]),
  ]);
  const today = toISODate();
  const next = appointments.find((a) => a.date >= today && ["scheduled", "confirmed"].includes(a.status));
  const city = user?.city || "Bengaluru";
  const latest = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 4);

  return (
    <div className="space-y-14">
      {/* Hero: answer "what do I need help with?" first */}
      <section className="relative -mx-4 overflow-hidden rounded-none bg-[radial-gradient(ellipse_at_top_left,var(--secondary),transparent_60%)] px-4 pt-6 pb-2 sm:mx-0 sm:rounded-3xl sm:px-10 sm:pt-12 sm:pb-10">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">{user ? `${greeting()}, ${firstName(user.name)}` : "Your dental world, connected"}</p>
          <h1 className="mt-2 text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">How can we help with your dental health?</h1>
          <div className="mt-8">
            <HeroSearch />
          </div>
        </div>
      </section>

      {next && (
        <section aria-label="Your next appointment">
          <Link href={`/appointments/${next.id}`} className="flex flex-col gap-3 rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md sm:flex-row sm:items-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><CalendarDays aria-hidden /></span>
            <span className="flex-1">
              <span className="block text-sm text-muted-foreground">Your next appointment</span>
              <span className="block font-semibold">{next.reason} · {next.dentist.name}</span>
              <span className="block text-sm text-muted-foreground">{formatDate(next.date, { weekday: "long", day: "numeric", month: "long" })} at {formatTime(next.time)} · {next.clinic.name}</span>
            </span>
            <StatusBadge status={next.status} />
          </Link>
        </section>
      )}

      <section aria-labelledby="find-heading">
        <h2 id="find-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">Find a dentist near you</h2>
        <form action="/dentists" className="mt-4 grid gap-2 rounded-2xl border bg-card p-2 sm:grid-cols-[1fr_200px_220px_auto]">
          <label className="relative">
            <span className="sr-only">Dentist, treatment or specialty</span>
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input name="q" placeholder="Dentist, treatment, e.g. root canal" className="h-10 border-none bg-transparent pl-9 shadow-none" />
          </label>
          <NativeSelect name="city" defaultValue={city} aria-label="City">
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </NativeSelect>
          <NativeSelect name="specialty" defaultValue="" aria-label="Specialty">
            <option value="">All specialties</option>
            {SPECIALTIES.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
          </NativeSelect>
          <Button type="submit" size="lg" className="h-10 px-5">Search</Button>
        </form>
      </section>

      <section aria-labelledby="rec-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="rec-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">Recommended for you</h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-3.5" aria-hidden />Top-rated near {city}</p>
          </div>
          <Button asChild variant="ghost"><Link href={`/dentists?city=${city}`}>See all <ArrowRight /></Link></Button>
        </div>
        <div className="scrollbar-none -mx-4 mt-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {recommended.map((d) => <DentistCard key={d.id} dentist={d} compact className="snap-start" />)}
        </div>
      </section>

      <section aria-labelledby="specialty-heading">
        <h2 id="specialty-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">Browse by need</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SPECIALTIES.filter((s) => s.name !== "Oral Pathology" && s.name !== "Public Health Dentistry").map((s) => (
            <Link key={s.name} href={`/dentists?specialty=${encodeURIComponent(s.name)}`} className="group rounded-2xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-secondary/50">
              <span className="block font-medium">{s.patientLabel}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{s.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="questions-heading" className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 id="questions-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">Popular dental questions</h2>
          <p className="mt-1 text-sm text-muted-foreground">Ask the FMD Dental Assistant — guidance in seconds, no account needed.</p>
          <ul className="mt-4 divide-y rounded-2xl border bg-card">
            {QUESTIONS.map((q) => (
              <li key={q}>
                <Link href={`/assistant?q=${encodeURIComponent(q)}`} className="flex items-center gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-muted/60">
                  <Sparkles className="size-4 shrink-0 text-primary" aria-hidden />
                  <span className="flex-1">{q}</span>
                  <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Explore dental content</h2>
            <Button asChild variant="ghost"><Link href="/explore">Explore <ArrowRight /></Link></Button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {latest.map((p) => <ContentCard key={p.id} post={p} authorName={dentists.find((d) => d.id === p.authorId)?.name ?? "FMD"} />)}
          </div>
        </div>
      </section>

      <section aria-label="FMD workspaces" className="grid gap-4 md:grid-cols-2">
        <Link href="/clinic" className="group rounded-3xl border bg-card p-6 transition-shadow hover:shadow-md">
          <Stethoscope className="size-6 text-product-clinic" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">FMD Clinic</h2>
          <p className="mt-1 text-sm text-muted-foreground">Run your practice — calendar, patients, treatment plans and billing, connected to FMD bookings.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">Open FMD Clinic <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
        </Link>
        <Link href="/academic" className="group rounded-3xl border bg-card p-6 transition-shadow hover:shadow-md">
          <GraduationCap className="size-6 text-product-academic" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">FMD Academic</h2>
          <p className="mt-1 text-sm text-muted-foreground">Build better dental knowledge — AI seminars, research, journal club and viva practice.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">Open FMD Academic <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
        </Link>
      </section>
    </div>
  );
}
