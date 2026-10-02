import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { AppointmentCalendar } from "@/components/clinic/appointment-calendar";
import { NewAppointmentDialog } from "@/components/clinic/clinic-dialogs";
import { dentistsRepo } from "@/lib/server/repositories/dentists";
import { getClinicForUser, getSchedule, listPatients } from "@/lib/server/services/clinic-service";
import { requireUser } from "@/lib/server/session";
import { addDays, toISODate } from "@/lib/utils";

export const metadata: Metadata = { title: "Appointments" };

export default async function ClinicAppointments({ searchParams }: PageProps<"/clinic/appointments">) {
  const sp = await searchParams;
  const user = await requireUser("/clinic/appointments");
  const clinic = await getClinicForUser(user);
  const view = (["day", "week", "month"].includes(String(sp.view)) ? sp.view : "day") as "day" | "week" | "month";
  const date = typeof sp.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : toISODate();
  const dow = new Date(date + "T00:00").getDay();
  const weekStart = addDays(date, -((dow + 6) % 7));
  const [from, to] = view === "day" ? [date, date] : view === "week" ? [weekStart, addDays(weekStart, 6)] : [addDays(date.slice(0, 7) + "-01", -7), addDays(date.slice(0, 7) + "-01", 42)];
  const [items, dentists, patients] = await Promise.all([getSchedule(clinic.id, from, to), dentistsRepo.where((d) => d.clinicId === clinic.id), listPatients(clinic.id)]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Doctors across, time down. Click any block for details."
        actions={<NewAppointmentDialog patients={patients.map((p) => ({ id: p.id, name: p.name }))} dentists={dentists.map((d) => ({ id: d.id, name: d.name }))} trigger={<Button><Plus />New appointment</Button>} />}
      />
      <AppointmentCalendar items={items} date={date} view={view} dentists={dentists.map((d) => ({ id: d.id, name: d.name }))} />
    </div>
  );
}
