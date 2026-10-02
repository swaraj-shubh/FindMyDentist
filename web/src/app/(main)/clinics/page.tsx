import type { Metadata } from "next";
import { ClinicCard } from "@/components/main/clinic-card";
import { MapView } from "@/components/main/map-view";
import { SpecialtyChip } from "@/components/main/specialty-chip";
import { PageHeader } from "@/components/shared/page-header";
import { CITIES } from "@/lib/constants";
import { listClinics } from "@/lib/server/services/dentist-service";

export const metadata: Metadata = { title: "Clinics" };

export default async function ClinicsPage({ searchParams }: PageProps<"/clinics">) {
  const { city } = await searchParams;
  const c = typeof city === "string" ? city : "";
  const clinics = await listClinics(c || undefined);
  return (
    <div className="space-y-6">
      <PageHeader title="Dental clinics" description="Verified FMD partner clinics with live online booking." />
      <div className="scrollbar-none flex gap-2 overflow-x-auto">
        <SpecialtyChip name="All cities" href="/clinics" active={!c} />
        {CITIES.map((x) => <SpecialtyChip key={x} name={x} href={`/clinics?city=${x}`} active={c === x} />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-4 sm:grid-cols-2">
          {clinics.map((cl) => <ClinicCard key={cl.id} clinic={cl} dentistCount={cl.dentists.length} />)}
        </div>
        <MapView pins={clinics.map((cl) => ({ id: cl.id, label: cl.name, sub: cl.city, lat: cl.lat, lng: cl.lng, href: `/clinics/${cl.slug}` }))} className="hidden h-[520px] lg:block" />
      </div>
    </div>
  );
}
