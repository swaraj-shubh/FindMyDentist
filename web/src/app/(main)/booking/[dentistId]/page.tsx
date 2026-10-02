import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { BookingFlow } from "@/components/main/booking-flow";
import { clinicsRepo } from "@/lib/server/repositories/clinics";
import { dentistsRepo } from "@/lib/server/repositories/dentists";
import { getAvailability } from "@/lib/server/services/booking-service";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Book an appointment" };

export default async function BookingPage({ params, searchParams }: PageProps<"/booking/[dentistId]">) {
  const { dentistId } = await params;
  const sp = await searchParams;
  const query = new URLSearchParams(Object.entries(sp).filter(([, v]) => typeof v === "string") as [string, string][]).toString();
  await requireUser(`/booking/${dentistId}${query ? `?${query}` : ""}`);
  const dentist = await dentistsRepo.get(dentistId);
  if (!dentist) notFound();
  const [clinic, availability] = await Promise.all([clinicsRepo.get(dentist.clinicId), getAvailability(dentist.id, 14)]);
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href={`/dentists/${dentist.slug}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" />{dentist.name}</Link>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Book an appointment</h1>
      <BookingFlow
        dentist={dentist}
        clinic={clinic!}
        availability={availability}
        initialReason={typeof sp.reason === "string" ? sp.reason : ""}
        initialDate={typeof sp.date === "string" ? sp.date : undefined}
        fromAssistant={sp.from === "assistant"}
      />
    </div>
  );
}
