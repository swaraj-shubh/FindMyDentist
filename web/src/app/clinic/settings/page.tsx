import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { PreferenceSettings } from "@/components/shared/preference-settings";
import { getClinicForUser } from "@/lib/server/services/clinic-service";
import { requireUser } from "@/lib/server/session";
import { formatTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Settings" };

export default async function ClinicSettings() {
  const user = await requireUser("/clinic/settings");
  const c = await getClinicForUser(user);
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" description={c.name} />
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Clinic profile</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          {[["Address", `${c.address}, ${c.city}`], ["Phone", c.phone], ["Email", c.email], ["Hours", `${formatTime(c.openTime)} – ${formatTime(c.closeTime)}`], ["Chairs", String(c.chairs)], ["Verification", c.verified ? "Verified" : "Pending"]].map(([k, v]) => <div key={k}><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>)}
        </dl>
      </section>
      <section className="rounded-xl border bg-card px-5 py-2">
        <h2 className="pt-3 font-semibold">Automation</h2>
        <PreferenceSettings storageKey="fmd-clinic-auto" items={[
          { id: "reminders", label: "Automatic appointment reminders", description: "Send patients a reminder 24 hours before." },
          { id: "recall", label: "Recall prompts", description: "Suggest follow-ups for patients not seen in 6 months." },
          { id: "ai", label: "AI-suggested message replies", description: "Show suggested replies in Messages." },
        ]} />
      </section>
      <p className="rounded-xl bg-muted/70 p-4 text-sm text-muted-foreground">Prototype note: clinic data is isolated by the signed-in user's clinic. Production adds role-based access, audit logs and tenant-level encryption.</p>
    </div>
  );
}
