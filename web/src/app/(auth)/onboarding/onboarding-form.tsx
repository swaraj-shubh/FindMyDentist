"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/shared/native-select";
import { api } from "@/lib/api-client";
import { CITIES } from "@/lib/constants";
import { SPECIALTY_NAMES } from "@/lib/config/specialties";
import { firstName } from "@/lib/utils";
import type { UserRole } from "@/types/user";

export function OnboardingForm({ name, role }: { name: string; role: UserRole }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const professional = role !== "patient";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await api("/api/v1/users", { method: "PATCH", body: { city: fd.get("city"), specialty: fd.get("specialty") ?? "", level: fd.get("level") ?? "", onboarded: true } });
      router.push(role === "student" || role === "faculty" ? "/academic" : role === "dentist" ? "/clinic" : "/home");
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md space-y-5">
      <div>
        <p className="text-sm font-medium text-primary">Step 2 of 2</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Welcome, {firstName(name)}</h1>
        <p className="mt-1 text-muted-foreground">A couple of details so FMD can personalise your experience.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="city">City</Label>
        <NativeSelect id="city" name="city" defaultValue="Bengaluru" className="w-full">
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </NativeSelect>
      </div>
      {professional && (
        <div className="space-y-1.5">
          <Label htmlFor="specialty">Specialty</Label>
          <NativeSelect id="specialty" name="specialty" className="w-full">
            {SPECIALTY_NAMES.map((s) => <option key={s}>{s}</option>)}
          </NativeSelect>
        </div>
      )}
      {(role === "student" || role === "faculty") && (
        <div className="space-y-1.5">
          <Label htmlFor="level">Academic level</Label>
          <NativeSelect id="level" name="level" defaultValue={role === "faculty" ? "Faculty" : "MDS"} className="w-full">
            <option>BDS</option>
            <option>MDS</option>
            <option>Faculty</option>
          </NativeSelect>
        </div>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Finish setup</Button>
    </form>
  );
}
