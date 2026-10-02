import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Clock, GraduationCap, Languages, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ClinicCover } from "@/components/main/clinic-card";
import { ContentCard } from "@/components/main/content-card";
import { MapView } from "@/components/main/map-view";
import { Rating } from "@/components/main/rating";
import { ReelCard } from "@/components/main/reel-card";
import { getDentistProfile } from "@/lib/server/services/dentist-service";
import { formatCompact, formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Film } from "lucide-react";

export async function generateMetadata({ params }: PageProps<"/dentists/[slug]">): Promise<Metadata> {
  const data = await getDentistProfile((await params).slug);
  return { title: data ? `${data.dentist.name} — ${data.dentist.specialty}` : "Dentist" };
}

export default async function DentistProfilePage({ params }: PageProps<"/dentists/[slug]">) {
  const data = await getDentistProfile((await params).slug);
  if (!data) notFound();
  const { dentist: d, clinic, reviews, posts, reels, availability, colleagues } = data;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
        <UserAvatar name={d.name} size="xl" className="sm:size-32 sm:text-4xl" />
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center justify-center gap-2 text-2xl font-semibold tracking-tight sm:justify-start sm:text-3xl">
            {d.name}
            {d.verified && <BadgeCheck className="size-6 text-primary" aria-label="Verified credentials" />}
          </h1>
          <p className="mt-1 text-lg">{d.specialty}</p>
          <p className="text-sm text-muted-foreground">{d.qualification} · {d.experience} years experience</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm sm:justify-start">
            <Rating value={d.rating} count={d.reviewCount} />
            <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="size-4" aria-hidden />{d.city}</span>
            <span><strong>{formatCompact(d.followers)}</strong> <span className="text-muted-foreground">followers</span></span>
            <span><strong>{posts.length + reels.length}</strong> <span className="text-muted-foreground">posts</span></span>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
            <Button asChild size="lg" className="px-6"><Link href={`/booking/${d.id}`}>Book appointment</Link></Button>
            <span className="self-center text-sm text-muted-foreground">Consultation {formatCurrency(d.consultationFee)}</span>
          </div>
        </div>
      </header>

      <section aria-labelledby="avail" className="rounded-2xl border bg-card p-4">
        <h2 id="avail" className="mb-3 text-sm font-medium">Availability this week</h2>
        <div className="scrollbar-none flex gap-2 overflow-x-auto">
          {availability.map((day) => (
            <Link
              key={day.date}
              href={day.slots.length ? `/booking/${d.id}?date=${day.date}` : "#"}
              aria-disabled={!day.slots.length}
              className={`flex min-w-20 flex-col items-center rounded-xl border px-3 py-2 text-center text-sm transition-colors ${day.slots.length ? "hover:border-primary hover:bg-secondary" : "pointer-events-none opacity-50"}`}
            >
              <span className="text-xs text-muted-foreground">{formatDate(day.date, { weekday: "short" })}</span>
              <span className="font-semibold">{formatDate(day.date, { day: "numeric", month: "short" })}</span>
              <span className="text-xs text-primary">{day.closed ? "Closed" : `${day.slots.length} slots`}</span>
            </Link>
          ))}
        </div>
      </section>

      <Tabs defaultValue="about">
        <TabsList variant="line" className="w-full justify-start border-b">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="content">Content ({posts.length + reels.length})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section>
              <h2 className="font-semibold">About</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{d.bio}</p>
            </section>
            <section>
              <h2 className="font-semibold">Treatments</h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {d.services.map((s) => <li key={s} className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">{s}</li>)}
              </ul>
            </section>
            <section>
              <h2 className="font-semibold">Education</h2>
              <ul className="mt-2 space-y-2 text-sm">
                {d.education.map((e) => <li key={e} className="flex gap-2"><GraduationCap className="size-4 shrink-0 text-muted-foreground" aria-hidden />{e}</li>)}
              </ul>
            </section>
            <section>
              <h2 className="font-semibold">Languages</h2>
              <p className="mt-2 flex items-center gap-2 text-sm"><Languages className="size-4 text-muted-foreground" aria-hidden />{d.languages.join(", ")}</p>
            </section>
            {colleagues.length > 0 && (
              <section>
                <h2 className="font-semibold">Also at {clinic.name}</h2>
                <ul className="mt-3 flex flex-wrap gap-3">
                  {colleagues.map((c) => (
                    <li key={c.id}>
                      <Link href={`/dentists/${c.slug}`} className="flex items-center gap-2 rounded-full border bg-card py-1 pr-3 pl-1 text-sm hover:bg-muted">
                        <UserAvatar name={c.name} size="sm" />{c.name}<span className="text-muted-foreground">· {c.specialty.split(" ")[0]}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
          <aside className="overflow-hidden rounded-2xl border bg-card">
            <ClinicCover name={clinic.name} className="h-24" />
            <div className="space-y-2 p-4 text-sm">
              <Link href={`/clinics/${clinic.slug}`} className="font-semibold hover:underline">{clinic.name}</Link>
              <p className="flex gap-2 text-muted-foreground"><MapPin className="size-4 shrink-0" aria-hidden />{clinic.address}, {clinic.city}</p>
              <p className="flex gap-2 text-muted-foreground"><Clock className="size-4 shrink-0" aria-hidden />Mon–Sat · {formatTime(clinic.openTime)} – {formatTime(clinic.closeTime)}</p>
              <p className="flex gap-2 text-muted-foreground"><Phone className="size-4 shrink-0" aria-hidden />{clinic.phone}</p>
              <MapView pins={[{ id: clinic.id, label: clinic.name, sub: clinic.city, lat: clinic.lat, lng: clinic.lng, href: `/clinics/${clinic.slug}` }]} className="mt-3 h-36" />
            </div>
          </aside>
        </TabsContent>

        <TabsContent value="content" className="mt-6 space-y-6">
          {reels.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {reels.map((r) => <ReelCard key={r.id} reel={r} authorName={d.name} />)}
            </div>
          )}
          {posts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => <ContentCard key={p.id} post={p} authorName={d.name} />)}
            </div>
          ) : (
            !reels.length && <EmptyState icon={Film} title="No posts yet" description={`${d.name} hasn't shared any content yet.`} />
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <ul className="grid gap-4 sm:grid-cols-2">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-2xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium"><UserAvatar name={r.author} size="xs" />{r.author}</span>
                  <Rating value={r.rating} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(r.date)} · Verified visit</p>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
