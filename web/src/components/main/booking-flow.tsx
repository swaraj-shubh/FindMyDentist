"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BadgeCheck, CalendarCheck2, Check, Clock, Loader2, MapPin, Sparkles, Stethoscope, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/shared/user-avatar";
import { api } from "@/lib/api-client";
import { cn, formatCurrency, formatDate, formatTime } from "@/lib/utils";
import type { Appointment } from "@/types/appointment";
import type { Clinic } from "@/types/clinic";
import type { Dentist } from "@/types/dentist";

interface Day {
  date: string;
  closed: boolean;
  slots: string[];
}

function Step({ n, title, done, children }: { n: number; title: string; done: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5 motion-safe:animate-in motion-safe:fade-in-0" aria-labelledby={`step-${n}`}>
      <h2 id={`step-${n}`} className="flex items-center gap-3 font-semibold">
        <span className={cn("flex size-7 items-center justify-center rounded-full text-sm", done ? "bg-primary text-primary-foreground" : "bg-muted")}>
          {done ? <Check className="size-4" aria-hidden /> : n}
        </span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function BookingFlow({ dentist, clinic, availability, initialReason, initialDate, fromAssistant }: { dentist: Dentist; clinic: Clinic; availability: Day[]; initialReason: string; initialDate?: string; fromAssistant: boolean }) {
  const router = useRouter();
  const [type, setType] = useState<"in_person" | "video" | null>(initialDate ? "in_person" : null);
  const [date, setDate] = useState<string | null>(availability.find((d) => d.date === initialDate && d.slots.length)?.date ?? null);
  const [time, setTime] = useState<string | null>(null);
  const [reason, setReason] = useState(initialReason);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState<Appointment | null>(null);
  const day = availability.find((d) => d.date === date);

  async function confirm() {
    if (!type || !date || !time) return;
    setSubmitting(true);
    try {
      setBooked(await api<Appointment>("/api/v1/main/appointments", { body: { dentistId: dentist.id, date, time, appointmentType: type, reason } }));
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
      setTime(null);
      router.refresh(); // pull fresh availability if the slot was taken
    } finally {
      setSubmitting(false);
    }
  }

  if (booked)
    return (
      <div className="mx-auto max-w-md rounded-3xl border bg-card p-8 text-center motion-safe:animate-in motion-safe:zoom-in-95">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 text-success"><CalendarCheck2 className="size-8" aria-hidden /></span>
        <h1 className="mt-5 text-2xl font-semibold">Appointment requested</h1>
        <p className="mt-1 text-muted-foreground">{clinic.name} will confirm shortly — we'll notify you.</p>
        <dl className="mt-6 space-y-2 rounded-2xl bg-muted/60 p-4 text-left text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Date</dt><dd className="font-medium">{formatDate(booked.date, { weekday: "long", day: "numeric", month: "long" })}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Time</dt><dd className="font-medium">{formatTime(booked.time)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Dentist</dt><dd className="font-medium">{dentist.name}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Type</dt><dd className="font-medium">{booked.appointmentType === "video" ? "Video consultation" : "In-person visit"}</dd></div>
        </dl>
        <div className="mt-6 flex flex-col gap-2">
          <Button asChild size="lg"><Link href={`/appointments/${booked.id}`}>View appointment</Link></Button>
          <Button asChild variant="ghost"><Link href="/home">Back to home</Link></Button>
        </div>
      </div>
    );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {fromAssistant && initialReason && (
          <p className="flex gap-2 rounded-2xl border border-primary/20 bg-secondary/60 p-4 text-sm">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <span>We've carried over what you told the Dental Assistant, so {dentist.name.split(" ").slice(0, 2).join(" ")} has context before your visit.</span>
          </p>
        )}

        <Step n={1} title="Choose appointment type" done={!!type}>
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Appointment type">
            {([["in_person", "In-person visit", "Examination at the clinic", Stethoscope], ["video", "Video consultation", "Talk it through from home", Video]] as const).map(([v, label, sub, Icon]) => (
              <button
                key={v}
                role="radio"
                aria-checked={type === v}
                onClick={() => setType(v)}
                className={cn("flex items-start gap-3 rounded-xl border p-4 text-left transition-colors hover:border-primary/50", type === v && "border-primary bg-secondary/60 ring-1 ring-primary")}
              >
                <Icon className="mt-0.5 size-5 text-primary" aria-hidden />
                <span><span className="block font-medium">{label}</span><span className="text-sm text-muted-foreground">{sub}</span></span>
              </button>
            ))}
          </div>
        </Step>

        {type && (
          <Step n={2} title="Choose a date" done={!!date}>
            <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="radiogroup" aria-label="Date">
              {availability.map((d) => (
                <button
                  key={d.date}
                  role="radio"
                  aria-checked={date === d.date}
                  disabled={!d.slots.length}
                  onClick={() => {
                    setDate(d.date);
                    setTime(null);
                  }}
                  className={cn("flex min-w-[4.5rem] flex-col items-center rounded-xl border px-2 py-2.5 text-sm transition-colors enabled:hover:border-primary/50 disabled:opacity-40", date === d.date && "border-primary bg-primary text-primary-foreground")}
                >
                  <span className={cn("text-xs", date === d.date ? "text-primary-foreground/80" : "text-muted-foreground")}>{formatDate(d.date, { weekday: "short" })}</span>
                  <span className="text-lg font-semibold">{formatDate(d.date, { day: "numeric" })}</span>
                  <span className={cn("text-[11px]", date === d.date ? "text-primary-foreground/80" : "text-muted-foreground")}>{d.closed ? "Closed" : d.slots.length ? formatDate(d.date, { month: "short" }) : "Full"}</span>
                </button>
              ))}
            </div>
          </Step>
        )}

        {day && (
          <Step n={3} title="Available times" done={!!time}>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Time">
              {day.slots.map((t) => (
                <button key={t} role="radio" aria-checked={time === t} onClick={() => setTime(t)} className={cn("rounded-xl border py-2.5 text-sm font-medium tabular-nums transition-colors hover:border-primary/50", time === t && "border-primary bg-primary text-primary-foreground")}>
                  {formatTime(t)}
                </button>
              ))}
            </div>
          </Step>
        )}

        {time && (
          <Step n={4} title="Anything the dentist should know?" done={false}>
            <Label htmlFor="reason" className="sr-only">Reason for visit</Label>
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} placeholder="e.g. Sensitivity on the lower left when drinking cold water" />
            <p className="mt-1 text-right text-xs text-muted-foreground">{reason.length}/300</p>
          </Step>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">Appointment summary</h2>
          <div className="mt-4 flex items-center gap-3">
            <UserAvatar name={dentist.name} size="md" />
            <div>
              <p className="flex items-center gap-1 font-medium">{dentist.name}{dentist.verified && <BadgeCheck className="size-4 text-primary" aria-label="Verified" />}</p>
              <p className="text-sm text-muted-foreground">{dentist.specialty}</p>
            </div>
          </div>
          <dl className="mt-4 space-y-2.5 border-t pt-4 text-sm">
            <div className="flex gap-2"><Clock className="size-4 text-muted-foreground" aria-hidden /><dd>{date && time ? `${formatTime(time)} · ${formatDate(date, { weekday: "short", day: "numeric", month: "short" })}` : <span className="text-muted-foreground">Pick a date and time</span>}</dd></div>
            <div className="flex gap-2"><MapPin className="size-4 text-muted-foreground" aria-hidden /><dd>{type === "video" ? "Video call link sent after confirmation" : `${clinic.name}, ${clinic.address}`}</dd></div>
            <div className="flex justify-between border-t pt-2.5"><dt className="text-muted-foreground">Consultation fee</dt><dd className="font-medium">{formatCurrency(dentist.consultationFee)}</dd></div>
          </dl>
          <Button size="lg" className="mt-5 w-full" disabled={!type || !date || !time || submitting} onClick={confirm}>
            {submitting && <Loader2 className="animate-spin" />}Confirm appointment
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">Pay at the clinic. Free cancellation.</p>
        </div>
      </aside>
    </div>
  );
}
