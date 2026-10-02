import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck, Clock, Mail, MapPin, Phone } from "lucide-react";
import { ClinicCover } from "@/components/main/clinic-card";
import { DentistCard } from "@/components/main/dentist-card";
import { MapView } from "@/components/main/map-view";
import { getClinicProfile } from "@/lib/server/services/dentist-service";
import { formatTime } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/clinics/[slug]">): Promise<Metadata> {
  const data = await getClinicProfile((await params).slug);
  return { title: data?.clinic.name ?? "Clinic" };
}

export default async function ClinicPage({ params }: PageProps<"/clinics/[slug]">) {
  const data = await getClinicProfile((await params).slug);
  if (!data) notFound();
  const { clinic, dentists } = data;
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="overflow-hidden rounded-3xl border bg-card">
        <ClinicCover name={clinic.name} className="h-40 sm:h-56" />
        <div className="space-y-3 p-6">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {clinic.name}
            {clinic.verified && <BadgeCheck className="size-6 text-primary" aria-label="Verified clinic" />}
          </h1>
          <p className="max-w-2xl text-muted-foreground">{clinic.description}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><MapPin className="size-4" aria-hidden />{clinic.address}, {clinic.city}</span>
            <span className="flex items-center gap-1.5"><Clock className="size-4" aria-hidden />Mon–Sat {formatTime(clinic.openTime)} – {formatTime(clinic.closeTime)}</span>
            <span className="flex items-center gap-1.5"><Phone className="size-4" aria-hidden />{clinic.phone}</span>
            <span className="flex items-center gap-1.5"><Mail className="size-4" aria-hidden />{clinic.email}</span>
          </div>
          <ul className="flex flex-wrap gap-2 pt-1">
            {clinic.amenities.map((a) => <li key={a} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">{a}</li>)}
          </ul>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Dentists ({dentists.length})</h2>
          {dentists.map((d) => <DentistCard key={d.id} dentist={d} />)}
        </section>
        <MapView pins={[{ id: clinic.id, label: clinic.name, sub: clinic.address, lat: clinic.lat, lng: clinic.lng, href: "#" }]} className="h-64" />
      </div>
    </div>
  );
}
