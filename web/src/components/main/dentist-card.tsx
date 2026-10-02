import Link from "next/link";
import { BadgeCheck, Clock, Languages, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn, formatCurrency, formatDate, formatTime, toISODate } from "@/lib/utils";
import type { DentistListItem } from "@/lib/server/services/dentist-service";
import { Rating } from "./rating";

function nextSlotLabel(slot: DentistListItem["nextSlot"]) {
  if (!slot) return "No slots this week";
  const today = toISODate();
  const day = slot.date === today ? "Today" : formatDate(slot.date, { weekday: "short", day: "numeric", month: "short" });
  return `${day}, ${formatTime(slot.time)}`;
}

export function DentistCard({ dentist, compact, bookingQuery, className }: { dentist: DentistListItem; compact?: boolean; bookingQuery?: string; className?: string }) {
  const bookHref = `/booking/${dentist.id}${bookingQuery ? `?${bookingQuery}` : ""}`;
  if (compact)
    return (
      <article className={cn("group relative flex w-64 shrink-0 flex-col rounded-2xl border bg-card p-4 transition-shadow hover:shadow-md", className)}>
        <div className="flex items-center gap-3">
          <UserAvatar name={dentist.name} size="lg" />
          <div className="min-w-0">
            <h3 className="flex items-center gap-1 truncate font-semibold">
              <Link href={`/dentists/${dentist.slug}`} className="after:absolute after:inset-0">{dentist.name}</Link>
              {dentist.verified && <BadgeCheck className="size-4 shrink-0 text-primary" aria-label="Verified" />}
            </h3>
            <p className="truncate text-sm text-muted-foreground">{dentist.specialty}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <Rating value={dentist.rating} />
          <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="size-3.5" aria-hidden />{dentist.city}</span>
        </div>
        <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-secondary/70 px-2.5 py-1.5 text-xs font-medium text-secondary-foreground">
          <Clock className="size-3.5" aria-hidden /> {nextSlotLabel(dentist.nextSlot)}
        </p>
      </article>
    );

  return (
    <article className={cn("flex flex-col gap-4 rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md sm:flex-row", className)}>
      <UserAvatar name={dentist.name} size="lg" className="sm:size-16 sm:text-xl" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="flex items-center gap-1.5 text-lg font-semibold">
              <Link href={`/dentists/${dentist.slug}`} className="hover:underline">{dentist.name}</Link>
              {dentist.verified && <BadgeCheck className="size-5 text-primary" aria-label="Verified credentials" />}
            </h3>
            <p className="text-sm text-muted-foreground">{dentist.specialty} · {dentist.experience} yrs experience</p>
          </div>
          <Rating value={dentist.rating} count={dentist.reviewCount} />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><MapPin className="size-4" aria-hidden />{dentist.clinic.name}, {dentist.city}</span>
          <span className="flex items-center gap-1.5"><Languages className="size-4" aria-hidden />{dentist.languages.join(", ")}</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div className="text-sm">
            <span className="flex items-center gap-1.5 font-medium text-secondary-foreground"><Clock className="size-4 text-primary" aria-hidden />Next available: {nextSlotLabel(dentist.nextSlot)}</span>
            <span className="text-muted-foreground">Consultation {formatCurrency(dentist.consultationFee)}</span>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link href={`/dentists/${dentist.slug}`}>View profile</Link></Button>
            <Button asChild disabled={!dentist.nextSlot}><Link href={bookHref}>Book</Link></Button>
          </div>
        </div>
      </div>
    </article>
  );
}
