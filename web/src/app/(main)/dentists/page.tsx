import type { Metadata } from "next";
import Link from "next/link";
import { Search, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { MobileCollapsible } from "@/components/shared/mobile-collapsible";
import { NativeSelect } from "@/components/shared/native-select";
import { DentistCard } from "@/components/main/dentist-card";
import { MapSheet, MapView } from "@/components/main/map-view";
import { SpecialtyChip } from "@/components/main/specialty-chip";
import { CITIES, LANGUAGES } from "@/lib/constants";
import { SPECIALTIES } from "@/lib/config/specialties";
import { listDentists, type SortKey } from "@/lib/server/services/dentist-service";

export const metadata: Metadata = { title: "Find a dentist" };

const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

export default async function DentistsPage({ searchParams }: PageProps<"/dentists">) {
  const sp = await searchParams;
  const f = {
    q: one(sp.q),
    city: one(sp.city),
    specialty: one(sp.specialty),
    gender: one(sp.gender),
    language: one(sp.language),
    minExperience: Number(one(sp.minExperience)) || 0,
    sort: (one(sp.sort) || "relevance") as SortKey,
  };
  const dentists = await listDentists(f);
  const pins = dentists.map((d) => ({ id: d.clinic.id, label: d.clinic.name, sub: `${d.name} · ${d.specialty}`, lat: d.clinic.lat, lng: d.clinic.lng, href: `/dentists/${d.slug}` }));
  const qs = (patch: Record<string, string>) => {
    const p = new URLSearchParams(Object.entries({ ...f, minExperience: f.minExperience ? String(f.minExperience) : "", ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/dentists?${p}`;
  };
  const filters = (
    <>
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">City</legend>
        <NativeSelect name="city" defaultValue={f.city} className="w-full" aria-label="City">
          <option value="">Anywhere</option>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </NativeSelect>
      </fieldset>
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Experience</legend>
        <NativeSelect name="minExperience" defaultValue={String(f.minExperience || "")} className="w-full" aria-label="Minimum experience">
          <option value="">Any</option>
          <option value="5">5+ years</option>
          <option value="10">10+ years</option>
          <option value="15">15+ years</option>
        </NativeSelect>
      </fieldset>
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Dentist gender</legend>
        <NativeSelect name="gender" defaultValue={f.gender} className="w-full" aria-label="Gender">
          <option value="">No preference</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </NativeSelect>
      </fieldset>
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Language</legend>
        <NativeSelect name="language" defaultValue={f.language} className="w-full" aria-label="Language">
          <option value="">Any</option>
          {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
        </NativeSelect>
      </fieldset>
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Sort by</legend>
        <NativeSelect name="sort" defaultValue={f.sort} className="w-full" aria-label="Sort">
          <option value="relevance">Best match</option>
          <option value="rating">Highest rated</option>
          <option value="experience">Most experienced</option>
          <option value="fee">Lowest fee</option>
        </NativeSelect>
      </fieldset>
    </>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Find a dentist</h1>
        <p className="mt-1 text-muted-foreground">Verified dental professionals, real availability.</p>
      </div>

      <form action="/dentists" className="space-y-4">
        <input type="hidden" name="specialty" value={f.specialty} />
        <div className="flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Search dentists or treatments</span>
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input name="q" defaultValue={f.q} placeholder="Dentist, treatment or specialty" className="h-11 rounded-xl bg-card pl-9" />
          </label>
          <Button type="submit" size="lg" className="h-11 px-5">Search</Button>
          <MapSheet pins={pins} />
        </div>
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <SpecialtyChip name="All" href={qs({ specialty: "" })} active={!f.specialty} />
          {SPECIALTIES.map((s) => <SpecialtyChip key={s.name} name={s.name} href={qs({ specialty: s.name })} active={f.specialty === s.name} />)}
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr] xl:grid-cols-[220px_1fr_380px]">
          <MobileCollapsible>
            <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5" aria-label="Filters">
              {filters}
              <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
                <Button type="submit" className="flex-1">Apply</Button>
                <Button asChild variant="ghost"><Link href="/dentists">Reset</Link></Button>
              </div>
            </aside>
          </MobileCollapsible>

          <section aria-label="Results" className="min-w-0 space-y-4">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {dentists.length} {dentists.length === 1 ? "dentist" : "dentists"}{f.specialty && ` in ${f.specialty}`}{f.city && ` · ${f.city}`}
            </p>
            {dentists.length === 0 ? (
              <EmptyState icon={SearchX} title="No dentists match these filters" description="Try another city, or remove a filter." action={<Button asChild variant="outline"><Link href="/dentists">Clear all filters</Link></Button>} />
            ) : (
              dentists.map((d) => <DentistCard key={d.id} dentist={d} />)
            )}
          </section>

          <div className="hidden xl:block">
            <MapView pins={pins} className="sticky top-24 h-[calc(100dvh-8rem)]" />
          </div>
        </div>
      </form>
    </div>
  );
}
