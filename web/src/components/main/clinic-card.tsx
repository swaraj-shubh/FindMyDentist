import Link from "next/link";
import { BadgeCheck, Clock, MapPin, Users } from "lucide-react";
import { FmdMark } from "@/components/shared/brand";
import { formatTime } from "@/lib/utils";
import type { Clinic } from "@/types/clinic";
import { specialtyHue } from "./specialty-chip";

export function ClinicCover({ name, className = "h-32" }: { name: string; className?: string }) {
  const h = specialtyHue(name);
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: `linear-gradient(135deg, oklch(0.9 0.05 ${h}), oklch(0.82 0.07 ${(h + 40) % 360}))` }} aria-hidden>
      <div className="absolute -right-6 -bottom-8 opacity-25"><FmdMark className="size-32" color={`oklch(0.45 0.08 ${h})`} /></div>
    </div>
  );
}

export function ClinicCard({ clinic, dentistCount }: { clinic: Clinic; dentistCount?: number }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md">
      <ClinicCover name={clinic.name} />
      <div className="p-5">
        <h3 className="flex items-center gap-1.5 font-semibold">
          <Link href={`/clinics/${clinic.slug}`} className="after:absolute after:inset-0">{clinic.name}</Link>
          {clinic.verified && <BadgeCheck className="size-4 text-primary" aria-label="Verified clinic" />}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="size-3.5" aria-hidden />{clinic.address}, {clinic.city}</p>
        <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="size-3.5" aria-hidden />{formatTime(clinic.openTime)} – {formatTime(clinic.closeTime)}</span>
          <span className="flex items-center gap-1"><Users className="size-3.5" aria-hidden />{dentistCount ?? clinic.dentistCount} dentists</span>
        </div>
      </div>
    </article>
  );
}
