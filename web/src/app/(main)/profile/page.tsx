import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, FolderHeart, GraduationCap, MapPin, Settings, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { dentistsRepo } from "@/lib/server/repositories/dentists";
import { getUserAppointments } from "@/lib/server/services/booking-service";
import { getUserRecords } from "@/lib/server/services/records-service";
import { requireUser } from "@/lib/server/session";
import { toISODate } from "@/lib/utils";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const [appointments, records, dentist] = await Promise.all([
    getUserAppointments(user.id),
    getUserRecords(user.id),
    user.role === "dentist" ? dentistsRepo.where((d) => d.userId === user.id).then((r) => r[0]) : Promise.resolve(undefined),
  ]);
  const upcoming = appointments.filter((a) => a.date >= toISODate() && ["scheduled", "confirmed"].includes(a.status)).length;
  const stats = [
    { label: "Upcoming visits", value: upcoming, href: "/appointments", icon: CalendarDays },
    { label: "Records", value: records.length, href: "/records", icon: FolderHeart },
  ];
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col items-center rounded-3xl border bg-card p-8 text-center">
        <UserAvatar name={user.name} size="xl" />
        <h1 className="mt-4 text-2xl font-semibold">{user.name}</h1>
        <p className="text-muted-foreground capitalize">{user.role === "clinic" ? "Clinic staff" : user.role}{user.specialty && ` · ${user.specialty}`}{user.level && ` · ${user.level}`}</p>
        {user.city && <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-3.5" aria-hidden />{user.city}</p>}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button asChild variant="outline"><Link href="/settings"><Settings />Settings</Link></Button>
          {dentist && <Button asChild variant="outline"><Link href={`/dentists/${dentist.slug}`}>Public profile</Link></Button>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border bg-card p-4 hover:shadow-md">
            <s.icon className="size-5 text-primary" aria-hidden />
            <p className="mt-3 text-2xl font-semibold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/clinic" className="flex items-center gap-3 rounded-2xl border bg-card p-4 hover:shadow-md"><Stethoscope className="size-5 text-product-clinic" aria-hidden /><span><span className="block font-medium">FMD Clinic</span><span className="text-sm text-muted-foreground">Practice workspace</span></span></Link>
        <Link href="/academic" className="flex items-center gap-3 rounded-2xl border bg-card p-4 hover:shadow-md"><GraduationCap className="size-5 text-product-academic" aria-hidden /><span><span className="block font-medium">FMD Academic</span><span className="text-sm text-muted-foreground">Seminars & research</span></span></Link>
      </div>
    </div>
  );
}
