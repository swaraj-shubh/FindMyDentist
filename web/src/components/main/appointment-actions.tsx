"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarPlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/lib/api-client";

export function CancelAppointmentButton({ id, label = "Cancel" }: { id: string; label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  async function cancel() {
    setBusy(true);
    try {
      await api("/api/v1/main/appointments", { method: "PATCH", body: { id, action: "cancel" } });
      toast.success("Appointment cancelled");
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-destructive hover:text-destructive"><X />{label}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this appointment?</DialogTitle>
          <DialogDescription>The clinic will be notified and the slot released. You can book again anytime.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Keep appointment</Button></DialogClose>
          <Button variant="destructive" onClick={cancel} disabled={busy}>{busy && <Loader2 className="animate-spin" />}Cancel appointment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Native calendar export: a tiny .ics file, no calendar SDK needed. */
export function AddToCalendarButton({ title, date, time, duration, location }: { title: string; date: string; time: string; duration: number; location: string }) {
  function download() {
    const start = new Date(`${date}T${time}:00`);
    const end = new Date(start.getTime() + duration * 60000);
    const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//FMD//EN", "BEGIN:VEVENT", `UID:${date}${time}@fmd`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`, `SUMMARY:${title}`, `LOCATION:${location}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "fmd-appointment.ics";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  return <Button variant="outline" onClick={download}><CalendarPlus />Add to calendar</Button>;
}
