import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Clock, FileText, MapPin, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { AddToCalendarButton, CancelAppointmentButton } from "@/components/main/appointment-actions";
import { MapView } from "@/components/main/map-view";
import { recordsRepo } from "@/lib/server/repositories/records";
import { getUserAppointments } from "@/lib/server/services/booking-service";
import { requireUser } from "@/lib/server/session";
import { formatDate, formatTime, toISODate } from "@/lib/utils";

export const metadata: Metadata = { title: "Appointment" };

export default async function AppointmentDetailPage({ params }: PageProps<"/appointments/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/appointments/${id}`);
  const a = (await getUserAppointments(user.id)).find((x) => x.id === id);
  if (!a) notFound();
  const upcoming = a.date >= toISODate() && ["scheduled", "confirmed"].includes(a.status);
  const records = await recordsRepo.where((r) => r.patientId === a.patientId && r.date === a.date);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/appointments" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" />Appointments</Link>
      <div className="rounded-3xl border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{formatDate(a.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{a.reason}</h1>
          </div>
          <StatusBadge status={a.status} />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <UserAvatar name={a.dentist.name} size="md" />
            <div>
              <Link href={`/dentists/${a.dentist.slug}`} className="font-medium hover:underline">{a.dentist.name}</Link>
              <p className="text-sm text-muted-foreground">{a.dentist.specialty}</p>
            </div>
          </div>
          <ul className="space-y-1.5 text-sm">
            <li className="flex gap-2"><Clock className="size-4 text-muted-foreground" aria-hidden />{formatTime(a.time)} · {a.duration} min</li>
            <li className="flex gap-2">{a.appointmentType === "video" ? <Video className="size-4 text-muted-foreground" aria-hidden /> : <MapPin className="size-4 text-muted-foreground" aria-hidden />}{a.appointmentType === "video" ? "Video consultation" : `${a.clinic.name}, ${a.clinic.address}`}</li>
            <li className="flex gap-2"><Phone className="size-4 text-muted-foreground" aria-hidden />{a.clinic.phone}</li>
          </ul>
        </div>
        {upcoming && (
          <div className="mt-6 flex flex-wrap gap-2 border-t pt-5">
            <AddToCalendarButton title={`Dental: ${a.reason}`} date={a.date} time={a.time} duration={a.duration} location={`${a.clinic.name}, ${a.clinic.address}`} />
            <Button asChild variant="outline"><Link href={`/booking/${a.dentistId}?reason=${encodeURIComponent(a.reason)}`}>Book another time</Link></Button>
            <CancelAppointmentButton id={a.id} />
          </div>
        )}
      </div>

      {upcoming && (
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">Before your visit</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Arrive 10 minutes early and bring any previous X-rays or reports.</li>
            <li>Tell the dentist about medicines you take — especially blood thinners or bone medicines.</li>
            <li>Your records from other FMD clinics are already in your vault.</li>
          </ul>
        </section>
      )}

      {records.length > 0 && (
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">Records from this visit</h2>
          <ul className="mt-3 space-y-2">
            {records.map((r) => (
              <li key={r.id}>
                <Link href={`/records/${r.id}`} className="flex items-center gap-3 rounded-xl p-2 text-sm hover:bg-muted"><FileText className="size-4 text-primary" aria-hidden />{r.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {a.appointmentType !== "video" && (
        <MapView pins={[{ id: a.clinic.id, label: a.clinic.name, sub: a.clinic.address, lat: a.clinic.lat, lng: a.clinic.lng, href: `/clinics/${a.clinic.slug}` }]} className="h-48" />
      )}
    </div>
  );
}
