import type { Metadata } from "next";
import Link from "next/link";
import { CalendarX2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { AppointmentCard } from "@/components/main/appointment-card";
import { getUserAppointments } from "@/lib/server/services/booking-service";
import { requireUser } from "@/lib/server/session";
import { toISODate } from "@/lib/utils";

export const metadata: Metadata = { title: "Appointments" };

export default async function AppointmentsPage() {
  const user = await requireUser("/appointments");
  const all = await getUserAppointments(user.id);
  const today = toISODate();
  const upcoming = all.filter((a) => a.date >= today && ["scheduled", "confirmed"].includes(a.status));
  const past = all.filter((a) => !upcoming.includes(a)).reverse();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Appointments" description="Bookings across every FMD clinic, in one place." actions={<Button asChild><Link href="/dentists">Book new</Link></Button>} />
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {upcoming.length ? upcoming.map((a) => <AppointmentCard key={a.id} appointment={a} />) : (
            <EmptyState icon={CalendarX2} title="No upcoming appointments" description="You don't have any appointments scheduled." action={<Button asChild><Link href="/dentists">Find a dentist</Link></Button>} />
          )}
        </TabsContent>
        <TabsContent value="past" className="mt-4 space-y-3">
          {past.length ? past.map((a) => <AppointmentCard key={a.id} appointment={a} className="opacity-90" />) : <EmptyState icon={CalendarX2} title="No past appointments yet" />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
