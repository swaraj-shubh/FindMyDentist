"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Ban, Check, CheckCheck, Loader2, UserX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { api } from "@/lib/api-client";
import { age, formatDate, formatTime } from "@/lib/utils";
import type { ScheduleItem } from "@/lib/server/services/clinic-service";
import type { AppointmentStatus } from "@/types/appointment";

const TYPE_LABEL = { in_person: "In-person", video: "Video", follow_up: "Follow-up", procedure: "Procedure" };

export function AppointmentDrawer({ appointment: a, onOpenChange }: { appointment: ScheduleItem | null; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [reschedule, setReschedule] = useState(false);

  async function update(patch: { status?: AppointmentStatus; date?: string; time?: string }, label: string) {
    if (!a) return;
    setBusy(label);
    try {
      await api("/api/v1/clinic/appointments", { method: "PATCH", body: { id: a.id, ...patch } });
      toast.success(label);
      setReschedule(false);
      onOpenChange(false);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const open = ["scheduled", "confirmed"].includes(a?.status ?? "");

  return (
    <Sheet open={!!a} onOpenChange={(o) => { onOpenChange(o); setReschedule(false); }}>
      <SheetContent className="w-full sm:max-w-md">
        {a && (
          <>
            <SheetHeader className="border-b">
              <SheetTitle>Appointment details</SheetTitle>
              <SheetDescription>{formatDate(a.date, { weekday: "long", day: "numeric", month: "long" })} · {formatTime(a.time)}</SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-5 overflow-y-auto px-4">
              <div className="flex items-center gap-3">
                <UserAvatar name={a.patient?.name ?? "?"} size="md" />
                <div>
                  <p className="font-medium">{a.patient?.name}</p>
                  <p className="text-sm text-muted-foreground">{a.patient && `${age(a.patient.dob)} yrs · ${a.patient.phone}`}</p>
                </div>
              </div>
              <StatusBadge status={a.status} />
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2"><dt className="text-muted-foreground">Reason</dt><dd className="font-medium">{a.reason}</dd></div>
                <div><dt className="text-muted-foreground">Dentist</dt><dd className="font-medium">{a.dentistName}</dd></div>
                <div><dt className="text-muted-foreground">Chair</dt><dd className="font-medium">Chair {a.chair}</dd></div>
                <div><dt className="text-muted-foreground">Type</dt><dd className="font-medium">{TYPE_LABEL[a.appointmentType]}</dd></div>
                <div><dt className="text-muted-foreground">Duration</dt><dd className="font-medium">{a.duration} min</dd></div>
              </dl>
              {a.patient && (a.patient.allergies.length > 0 || a.patient.medicalHistory.length > 0) && (
                <div className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
                  <p className="font-medium">Medical alerts</p>
                  <p className="text-muted-foreground">{[...a.patient.allergies.map((x) => `Allergy: ${x}`), ...a.patient.medicalHistory].join(" · ")}</p>
                </div>
              )}
              {reschedule && (
                <form
                  className="space-y-3 rounded-xl border p-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    update({ date: String(fd.get("date")), time: String(fd.get("time")), status: "scheduled" }, "Appointment rescheduled");
                  }}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1"><Label htmlFor="rs-date">Date</Label><Input id="rs-date" name="date" type="date" defaultValue={a.date} required /></div>
                    <div className="space-y-1"><Label htmlFor="rs-time">Time</Label><Input id="rs-time" name="time" type="time" step={900} defaultValue={a.time} required /></div>
                  </div>
                  <Button type="submit" size="sm" disabled={!!busy}>{busy === "Appointment rescheduled" && <Loader2 className="animate-spin" />}Save new time</Button>
                </form>
              )}
            </div>
            <div className="grid gap-2 border-t p-4">
              {a.status === "scheduled" && <Button onClick={() => update({ status: "confirmed" }, "Appointment confirmed")} disabled={!!busy}><Check />Confirm</Button>}
              {a.status === "confirmed" && <Button onClick={() => update({ status: "completed" }, "Marked as completed")} disabled={!!busy}><CheckCheck />Mark completed</Button>}
              <div className="grid grid-cols-2 gap-2">
                {open && <Button variant="outline" onClick={() => setReschedule((r) => !r)}>Reschedule</Button>}
                {a.patient && <Button asChild variant="outline"><Link href={`/clinic/patients/${a.patient.id}`}>Open patient</Link></Button>}
                {open && <Button variant="ghost" onClick={() => update({ status: "no_show" }, "Marked as no-show")} disabled={!!busy}><UserX />No-show</Button>}
                {open && <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => update({ status: "cancelled" }, "Appointment cancelled")} disabled={!!busy}><Ban />Cancel</Button>}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
