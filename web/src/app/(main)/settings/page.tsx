import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { PreferenceSettings } from "@/components/shared/preference-settings";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser("/settings");
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" description={`Signed in as ${user.email}`} />
      <section className="rounded-2xl border bg-card px-5 py-2">
        <h2 className="pt-3 font-semibold">Notifications</h2>
        <PreferenceSettings
          storageKey="fmd-notify"
          items={[
            { id: "reminders", label: "Appointment reminders", description: "A reminder the day before and 2 hours before." },
            { id: "records", label: "New records", description: "When a clinic adds an X-ray, prescription or note." },
            { id: "community", label: "Community replies", description: "Replies to your comments and posts.", defaultOn: false },
          ]}
        />
      </section>
      <section className="rounded-2xl border bg-card px-5 py-2">
        <h2 className="pt-3 font-semibold">Privacy & consent</h2>
        <PreferenceSettings
          storageKey="fmd-consent"
          items={[
            { id: "share", label: "Share records with clinics I visit", description: "Lets a new clinic see your history before your appointment." },
            { id: "assistant", label: "Use my records to personalise AI guidance", description: "The Dental Assistant can consider past treatments.", defaultOn: false },
            { id: "research", label: "Anonymised research", description: "Contribute de-identified data to dental research.", defaultOn: false },
          ]}
        />
      </section>
      <p className="rounded-xl bg-muted/70 p-4 text-sm text-muted-foreground">This is a prototype: preferences are stored in this browser only, and all data is fictional. Run <code className="font-mono">npm run seed</code> to reset demo data.</p>
    </div>
  );
}
