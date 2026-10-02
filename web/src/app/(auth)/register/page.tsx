"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const ROLES = [
  ["patient", "Patient", "Find dentists & manage care"],
  ["dentist", "Dentist", "Profile, content & clinic"],
  ["student", "Student", "BDS / MDS academic tools"],
  ["faculty", "Faculty", "Teaching & research"],
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<(typeof ROLES)[number][0]>("patient");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await api("/api/v1/users", { body: { name: fd.get("name"), email: fd.get("email"), role } });
      router.push("/onboarding");
      router.refresh();
    } catch (err) {
      const x = err as Error & { issues?: Record<string, string[]> };
      setErrors(x.issues ?? {});
      toast.error(x.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md space-y-5" noValidate>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create your FMD account</h1>
        <p className="mt-1 text-muted-foreground">One identity across every FMD product.</p>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">I am a…</legend>
        <div className="grid grid-cols-2 gap-2" role="radiogroup">
          {ROLES.map(([v, label, sub]) => (
            <button type="button" key={v} role="radio" aria-checked={role === v} onClick={() => setRole(v)} className={cn("rounded-xl border bg-card p-3 text-left transition-colors hover:border-primary/50", role === v && "border-primary ring-1 ring-primary")}>
              <span className="block text-sm font-medium">{label}</span>
              <span className="block text-xs text-muted-foreground">{sub}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" autoComplete="name" required aria-invalid={!!errors.name} className="h-10 bg-card" />
        {errors.name && <p className="text-sm text-destructive">{errors.name[0]}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!errors.email} className="h-10 bg-card" />
        {errors.email && <p className="text-sm text-destructive">{errors.email[0]}</p>}
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Continue</Button>
      <p className="text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link></p>
    </form>
  );
}
