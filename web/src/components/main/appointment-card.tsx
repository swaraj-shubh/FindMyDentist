import Link from "next/link";
import { MapPin, Video } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn, formatDate, formatTime } from "@/lib/utils";
import type { UserAppointment } from "@/lib/server/services/booking-service";

export function AppointmentCard({ appointment: a, className }: { appointment: UserAppointment; className?: string }) {
  return (
    <Link href={`/appointments/${a.id}`} className={cn("flex gap-4 rounded-2xl border bg-card p-4 transition-shadow hover:shadow-md sm:p-5", className)}>
      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary py-2 text-secondary-foreground">
        <span className="text-xs uppercase">{formatDate(a.date, { month: "short" })}</span>
        <span className="text-2xl leading-none font-semibold">{formatDate(a.date, { day: "numeric" })}</span>
        <span className="text-[11px]">{formatDate(a.date, { weekday: "short" })}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="font-semibold">{a.reason}</p>
          <StatusBadge status={a.status} />
        </div>
        <p className="mt-1 flex items-center gap-2 text-sm"><UserAvatar name={a.dentist.name} size="xs" />{a.dentist.name} · <span className="text-muted-foreground">{a.dentist.specialty}</span></p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          {a.appointmentType === "video" ? <Video className="size-3.5" aria-hidden /> : <MapPin className="size-3.5" aria-hidden />}
          {formatTime(a.time)} · {a.appointmentType === "video" ? "Video consultation" : a.clinic.name}
        </p>
      </div>
    </Link>
  );
}
