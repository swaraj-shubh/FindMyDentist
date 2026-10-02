"use client";

import { useMemo, useState } from "react";
import { Briefcase, Building2, Check, MapPin, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { NativeSelect } from "@/components/shared/native-select";
import { CITIES } from "@/lib/constants";
import { SPECIALTY_NAMES } from "@/lib/config/specialties";
import { timeAgo } from "@/lib/utils";
import type { Job } from "@/types/content";

const TYPE_LABEL: Record<Job["type"], string> = { full_time: "Full-time", part_time: "Part-time", locum: "Locum", internship: "Internship", faculty: "Faculty" };

export function JobsBoard({ jobs, signedIn }: { jobs: Job[]; signedIn: boolean }) {
  const [type, setType] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [city, setCity] = useState("");
  const [applied, setApplied] = useState<string[]>([]);
  const shown = useMemo(() => jobs.filter((j) => (!type || j.type === type) && (!specialty || j.specialty === specialty) && (!city || j.location === city)), [jobs, type, specialty, city]);

  return (
    <div className="space-y-5">
      <div className="grid gap-2 sm:grid-cols-3">
        <NativeSelect value={type} onChange={(e) => setType(e.target.value)} aria-label="Job type">
          <option value="">All job types</option>
          {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </NativeSelect>
        <NativeSelect value={specialty} onChange={(e) => setSpecialty(e.target.value)} aria-label="Specialty">
          <option value="">All specialties</option>
          {SPECIALTY_NAMES.map((s) => <option key={s}>{s}</option>)}
        </NativeSelect>
        <NativeSelect value={city} onChange={(e) => setCity(e.target.value)} aria-label="City">
          <option value="">All cities</option>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </NativeSelect>
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">{shown.length} openings</p>
      {shown.length === 0 ? (
        <EmptyState icon={Briefcase} title="No openings match" description="Try widening your filters." />
      ) : (
        <ul className="space-y-3">
          {shown.map((j) => (
            <li key={j.id} className="rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{j.title}</h2>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground"><Building2 className="size-3.5" aria-hidden />{j.organization}</p>
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{TYPE_LABEL[j.type]}</span>
              </div>
              <p className="mt-3 text-sm">{j.description}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="size-3.5" aria-hidden />{j.location}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="size-3.5" aria-hidden />{j.experience} · {j.specialty}</span>
                <span className="flex items-center gap-1.5"><Wallet className="size-3.5" aria-hidden />{j.salary}</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <span className="text-xs text-muted-foreground">Posted {timeAgo(j.postedAt)}</span>
                {applied.includes(j.id) ? (
                  <span className="flex items-center gap-1 text-sm font-medium text-success"><Check className="size-4" aria-hidden />Applied</span>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!signedIn) return toast("Sign in with your FMD profile to apply");
                      setApplied((a) => [...a, j.id]);
                      toast.success(`Application sent to ${j.organization}`, { description: "Your FMD professional profile was shared." });
                    }}
                  >
                    Apply with FMD profile
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
