import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { ClinicCard } from "@/components/main/clinic-card";
import { ContentCard } from "@/components/main/content-card";
import { ReelCard } from "@/components/main/reel-card";
import { SpecialtyChip } from "@/components/main/specialty-chip";
import { SPECIALTIES } from "@/lib/config/specialties";
import { clinicsRepo } from "@/lib/server/repositories/clinics";
import { dentistsRepo } from "@/lib/server/repositories/dentists";
import { postsRepo } from "@/lib/server/repositories/posts";
import { getExplore } from "@/lib/server/services/community-service";
import { getSession } from "@/lib/server/session";

export const metadata: Metadata = { title: "Explore" };

export default async function ExplorePage({ searchParams }: PageProps<"/explore">) {
  const { specialty } = await searchParams;
  const sp = typeof specialty === "string" ? specialty : "";
  const user = await getSession();
  const [{ reels }, posts, dentists, clinics] = await Promise.all([getExplore(), postsRepo.all(), dentistsRepo.all(), clinicsRepo.all()]);
  const name = (id: string) => dentists.find((d) => d.id === id)?.name ?? "FMD";
  const filteredPosts = posts.filter((p) => !sp || p.specialty === sp);
  const filteredReels = reels.filter((r) => !sp || r.specialty === sp);
  const city = user?.city || "Bengaluru";

  return (
    <div className="space-y-10">
      <PageHeader title="Explore" description="Short videos, guides and clinics — curated by dentists." />
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <SpecialtyChip name="For you" href="/explore" active={!sp} />
        {SPECIALTIES.slice(0, 8).map((s) => <SpecialtyChip key={s.name} name={s.patientLabel} href={`/explore?specialty=${encodeURIComponent(s.name)}`} active={sp === s.name} />)}
      </div>

      {filteredReels.length > 0 && (
        <section aria-labelledby="reels">
          <h2 id="reels" className="text-xl font-semibold tracking-tight">Reels</h2>
          <div className="scrollbar-none -mx-4 mt-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-6">
            {filteredReels.map((r) => <div key={r.id} className="w-36 shrink-0 sm:w-auto"><ReelCard reel={r} authorName={r.author.name} /></div>)}
          </div>
        </section>
      )}

      <section aria-labelledby="guides">
        <h2 id="guides" className="text-xl font-semibold tracking-tight">Guides & posts</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredPosts.map((p) => <ContentCard key={p.id} post={p} authorName={name(p.authorId)} />)}
        </div>
      </section>

      <section aria-labelledby="clinics">
        <div className="flex items-end justify-between">
          <h2 id="clinics" className="text-xl font-semibold tracking-tight">Clinics in {city}</h2>
          <Button asChild variant="ghost"><Link href={`/clinics?city=${city}`}>All clinics <ArrowRight /></Link></Button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clinics.filter((c) => c.city === city).map((c) => <ClinicCard key={c.id} clinic={c} />)}
        </div>
      </section>
    </div>
  );
}
