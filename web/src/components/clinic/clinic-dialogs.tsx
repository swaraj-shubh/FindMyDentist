"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/shared/native-select";
import { api } from "@/lib/api-client";
import { toISODate } from "@/lib/utils";

type Errors = Record<string, string[]>;
const Err = ({ e, k }: { e: Errors; k: string }) => (e[k] ? <p className="text-sm text-destructive">{e[k][0]}</p> : null);

function useSubmit(url: string, done: string, close: () => void) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  async function submit(body: unknown, then?: (r: { id: string }) => void) {
    setBusy(true);
    setErrors({});
    try {
      const r = await api<{ id: string }>(url, { body });
      toast.success(done);
      close();
      router.refresh();
      then?.(r);
    } catch (e) {
      const x = e as Error & { issues?: Errors };
      setErrors(x.issues ?? {});
      toast.error(x.message);
    } finally {
      setBusy(false);
    }
  }
  return { busy, errors, submit };
}

export function NewPatientDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { busy, errors, submit } = useSubmit("/api/v1/clinic/patients", "Patient added", () => setOpen(false));
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add patient</DialogTitle><DialogDescription>Register a new patient. Use fictional details in this prototype.</DialogDescription></DialogHeader>
        <form
          className="space-y-3"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const f = Object.fromEntries(new FormData(e.currentTarget));
            submit(f, (r) => router.push(`/clinic/patients/${r.id}`));
          }}
        >
          <div className="space-y-1"><Label htmlFor="np-name">Full name</Label><Input id="np-name" name="name" required aria-invalid={!!errors.name} /><Err e={errors} k="name" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label htmlFor="np-dob">Date of birth</Label><Input id="np-dob" name="dob" type="date" max={toISODate()} required aria-invalid={!!errors.dob} /><Err e={errors} k="dob" /></div>
            <div className="space-y-1"><Label htmlFor="np-g">Gender</Label><NativeSelect id="np-g" name="gender" className="w-full"><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></NativeSelect></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label htmlFor="np-ph">Phone</Label><Input id="np-ph" name="phone" type="tel" placeholder="+91 90000 00000" required aria-invalid={!!errors.phone} /><Err e={errors} k="phone" /></div>
            <div className="space-y-1"><Label htmlFor="np-em">Email (optional)</Label><Input id="np-em" name="email" type="email" aria-invalid={!!errors.email} /><Err e={errors} k="email" /></div>
          </div>
          <div className="space-y-1"><Label htmlFor="np-al">Allergies (comma separated)</Label><Input id="np-al" name="allergies" /></div>
          <div className="space-y-1"><Label htmlFor="np-mh">Medical history (comma separated)</Label><Input id="np-mh" name="medicalHistory" /></div>
          <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Add patient</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function NewAppointmentDialog({ trigger, patients, dentists, patientId }: { trigger: React.ReactNode; patients: { id: string; name: string }[]; dentists: { id: string; name: string }[]; patientId?: string }) {
  const [open, setOpen] = useState(false);
  const { busy, errors, submit } = useSubmit("/api/v1/clinic/appointments", "Appointment booked", () => setOpen(false));
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New appointment</DialogTitle><DialogDescription>Booked as confirmed. The patient is notified if they have an FMD account.</DialogDescription></DialogHeader>
        <form className="space-y-3" noValidate onSubmit={(e) => { e.preventDefault(); submit(Object.fromEntries(new FormData(e.currentTarget))); }}>
          <div className="space-y-1">
            <Label htmlFor="na-p">Patient</Label>
            <NativeSelect id="na-p" name="patientId" defaultValue={patientId ?? ""} className="w-full"><option value="" disabled>Choose patient</option>{patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</NativeSelect>
            <Err e={errors} k="patientId" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="na-d">Dentist</Label>
            <NativeSelect id="na-d" name="dentistId" defaultValue="" className="w-full"><option value="" disabled>Choose dentist</option>{dentists.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</NativeSelect>
            <Err e={errors} k="dentistId" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label htmlFor="na-date">Date</Label><Input id="na-date" name="date" type="date" min={toISODate()} defaultValue={toISODate()} required /></div>
            <div className="space-y-1"><Label htmlFor="na-time">Time</Label><Input id="na-time" name="time" type="time" step={900} defaultValue="10:00" required /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1"><Label htmlFor="na-t">Type</Label><NativeSelect id="na-t" name="appointmentType" className="w-full"><option value="in_person">In-person</option><option value="procedure">Procedure</option><option value="follow_up">Follow-up</option><option value="video">Video</option></NativeSelect></div>
            <div className="space-y-1"><Label htmlFor="na-c">Chair</Label><Input id="na-c" name="chair" type="number" min={1} max={10} defaultValue={1} /></div>
          </div>
          <div className="space-y-1"><Label htmlFor="na-r">Reason</Label><Input id="na-r" name="reason" aria-invalid={!!errors.reason} /><Err e={errors} k="reason" /></div>
          <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Book appointment</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
