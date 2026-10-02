"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/shared/native-select";
import { api } from "@/lib/api-client";

export function AdvanceTreatmentButton({ id, hasCurrent }: { id: string; hasCurrent: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function act(action: "advance" | "cancel") {
    setBusy(true);
    try {
      await api("/api/v1/clinic/treatments", { method: "PATCH", body: { id, action } });
      toast.success(action === "cancel" ? "Treatment cancelled" : "Treatment plan updated");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => act("advance")} disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <ArrowRight />}{hasCurrent ? "Complete step" : "Start treatment"}</Button>
      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => act("cancel")} disabled={busy}><X />Cancel</Button>
    </div>
  );
}

export function NewTreatmentDialog({ patients, dentists, patientId, trigger }: { patients: { id: string; name: string }[]; dentists: { id: string; name: string }[]; patientId?: string; trigger: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    try {
      await api("/api/v1/clinic/treatments", { body: { ...f, steps: String(f.steps).split("\n").map((s) => s.trim()).filter(Boolean) } });
      toast.success("Treatment plan created");
      setOpen(false);
      router.refresh();
    } catch (err) {
      const x = err as Error & { issues?: Record<string, string[]> };
      setErrors(x.issues ?? {});
      toast.error(x.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New treatment plan</DialogTitle><DialogDescription>One step per line — the patient sees this roadmap in their FMD records.</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="space-y-3" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label htmlFor="nt-p">Patient</Label><NativeSelect id="nt-p" name="patientId" defaultValue={patientId ?? ""} className="w-full"><option value="" disabled>Choose</option>{patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</NativeSelect></div>
            <div className="space-y-1"><Label htmlFor="nt-d">Dentist</Label><NativeSelect id="nt-d" name="dentistId" defaultValue="" className="w-full"><option value="" disabled>Choose</option>{dentists.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</NativeSelect></div>
          </div>
          <div className="space-y-1"><Label htmlFor="nt-t">Treatment</Label><Input id="nt-t" name="treatment" placeholder="e.g. Root canal + crown" aria-invalid={!!errors.treatment} />{errors.treatment && <p className="text-sm text-destructive">{errors.treatment[0]}</p>}</div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1"><Label htmlFor="nt-to">Tooth</Label><Input id="nt-to" name="tooth" placeholder="36" /></div>
            <div className="space-y-1"><Label htmlFor="nt-c">Cost (₹)</Label><Input id="nt-c" name="cost" type="number" min={0} defaultValue={0} /></div>
            <div className="space-y-1"><Label htmlFor="nt-w">Warranty (months)</Label><Input id="nt-w" name="warrantyMonths" type="number" min={0} defaultValue={0} /></div>
          </div>
          <div className="space-y-1"><Label htmlFor="nt-s">Steps</Label><Textarea id="nt-s" name="steps" rows={4} defaultValue={"Consultation\nX-ray\nTreatment\nFollow-up"} />{errors.steps && <p className="text-sm text-destructive">{errors.steps[0]}</p>}</div>
          <div className="space-y-1"><Label htmlFor="nt-n">Notes</Label><Input id="nt-n" name="notes" /></div>
          <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}<Plus />Create plan</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddRecordDialog({ patientId, treatments, trigger }: { patientId: string; treatments: { id: string; treatment: string }[]; trigger: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    try {
      await api("/api/v1/clinic/records", { body: { ...f, patientId } });
      toast.success("Record added — the patient can see it in FMD");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add record</DialogTitle><DialogDescription>Prototype stores details only — files go to secure object storage in production.</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label htmlFor="ar-t">Type</Label><NativeSelect id="ar-t" name="recordType" className="w-full"><option value="xray">X-ray</option><option value="photo">Photo</option><option value="diagnosis_note">Clinical note</option><option value="prescription">Prescription</option><option value="treatment">Treatment</option><option value="document">Document</option></NativeSelect></div>
            <div className="space-y-1"><Label htmlFor="ar-tr">Treatment</Label><NativeSelect id="ar-tr" name="treatmentId" className="w-full"><option value="">None</option>{treatments.map((t) => <option key={t.id} value={t.id}>{t.treatment}</option>)}</NativeSelect></div>
          </div>
          <div className="space-y-1"><Label htmlFor="ar-ti">Title</Label><Input id="ar-ti" name="title" required minLength={2} /></div>
          <div className="space-y-1"><Label htmlFor="ar-d">Description</Label><Textarea id="ar-d" name="description" rows={3} /></div>
          <div className="space-y-1"><Label htmlFor="ar-f">File (optional)</Label><Input id="ar-f" type="file" onChange={(e) => setFile(e.target.files?.[0]?.name ?? "")} />{file && <p className="text-xs text-muted-foreground">{file} — not uploaded in this prototype</p>}</div>
          <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Add record</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
