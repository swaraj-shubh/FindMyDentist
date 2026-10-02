import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { UserAvatar } from "@/components/shared/user-avatar";
import { CommunityPost } from "@/components/main/community-post";
import { SpecialtyChip } from "@/components/main/specialty-chip";
import { SPECIALTIES } from "@/lib/config/specialties";
import { getExplore, getFeed } from "@/lib/server/services/community-service";
import { getSession } from "@/lib/server/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Community" };

const TABS = [["for-you", "For you"], ["following", "Following"], ["trending", "Trending"]] as const;

export default async function CommunityPage({ searchParams }: PageProps<"/community">) {
  const sp = await searchParams;
  const tab = typeof sp.tab === "string" ? sp.tab : "for-you";
  const specialty = typeof sp.specialty === "string" ? sp.specialty : "";
  const user = await getSession();
  const [feed, { stories }] = await Promise.all([getFeed({ tab, specialty, userId: user?.id }), getExplore()]);
  const href = (p: Record<string, string>) => `/community?${new URLSearchParams(Object.entries({ tab, specialty, ...p }).filter(([, v]) => v))}`;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Community" description="Dentistry-first conversations with verified professionals." />
      <section aria-label="Stories" className="scrollbar-none -mx-4 flex gap-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {stories.map((s) => (
          <Link key={s.id} href={`/dentists/${s.author.slug}`} className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-center">
            <span className="rounded-full bg-[conic-gradient(var(--primary),var(--chart-2),var(--primary))] p-0.5">
              <span className="block rounded-full bg-background p-0.5"><UserAvatar name={s.author.name} size="lg" /></span>
            </span>
            <span className="line-clamp-2 text-[11px] leading-tight">{s.title}</span>
          </Link>
        ))}
      </section>
      <nav className="flex gap-1 border-b" aria-label="Feed">
        {TABS.map(([id, label]) => (
          <Link key={id} href={href({ tab: id })} aria-current={tab === id ? "page" : undefined} className={cn("-mb-px border-b-2 px-3 pb-2.5 text-sm font-medium", tab === id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {label}
          </Link>
        ))}
      </nav>
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <SpecialtyChip name="All specialties" href={href({ specialty: "" })} active={!specialty} />
        {SPECIALTIES.slice(0, 8).map((s) => <SpecialtyChip key={s.name} name={s.short} href={href({ specialty: s.name })} active={specialty === s.name} />)}
      </div>
      <div className="space-y-5">
        {feed.length ? feed.map((p) => <CommunityPost key={p.id} post={p} signedIn={!!user} />) : <EmptyState icon={Users} title="Nothing here yet" description="Try another specialty or tab." />}
      </div>
    </div>
  );
}
