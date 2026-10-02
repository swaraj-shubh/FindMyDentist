"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { NativeSelect } from "@/components/shared/native-select";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { age, formatDate } from "@/lib/utils";
import type { PatientRow } from "@/lib/server/services/clinic-service";

export function PatientTable({ patients, dentists }: { patients: PatientRow[]; dentists: { id: string; name: string }[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [dentist, setDentist] = useState("");
  const [sort, setSort] = useState("recent");
  const rows = useMemo(() => {
    const t = q.toLowerCase();
    return patients
      .filter((p) => (!t || `${p.name} ${p.phone} ${p.id} ${p.treatment}`.toLowerCase().includes(t)) && (!status || p.status === status) && (!dentist || p.dentistId === dentist))
      .sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : b.lastVisit.localeCompare(a.lastVisit)));
  }, [patients, q, status, dentist, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <label className="relative min-w-56 flex-1">
          <span className="sr-only">Search patients</span>
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, treatment…" className="h-10 bg-card pl-9" />
        </label>
        <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status"><option value="">All statuses</option><option value="active">Active</option><option value="completed">Completed</option></NativeSelect>
        <NativeSelect value={dentist} onChange={(e) => setDentist(e.target.value)} aria-label="Doctor"><option value="">All doctors</option>{dentists.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</NativeSelect>
        <NativeSelect value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort"><option value="recent">Last visit</option><option value="name">Name</option></NativeSelect>
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={Users} title="No patients found" description="Try a different search or clear the filters." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Last visit</TableHead><TableHead className="hidden md:table-cell">Next visit</TableHead><TableHead>Treatment</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id} className="relative cursor-pointer">
                  <TableCell>
                    <Link href={`/clinic/patients/${p.id}`} className="flex items-center gap-3 font-medium after:absolute after:inset-0">
                      <UserAvatar name={p.name} size="sm" />
                      <span>{p.name}<span className="block text-xs font-normal text-muted-foreground">{p.id.toUpperCase()} · {age(p.dob)} yrs</span></span>
                    </Link>
                  </TableCell>
                  <TableCell>{p.lastVisit ? formatDate(p.lastVisit, { day: "numeric", month: "short" }) : "—"}</TableCell>
                  <TableCell className="hidden md:table-cell">{p.nextVisit ? formatDate(p.nextVisit, { day: "numeric", month: "short" }) : "—"}</TableCell>
                  <TableCell className="max-w-48 truncate">{p.treatment || "—"}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <p className="text-xs text-muted-foreground">{rows.length} of {patients.length} patients</p>
    </div>
  );
}
