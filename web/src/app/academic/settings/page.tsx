import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { PreferenceSettings } from "@/components/shared/preference-settings";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Settings" };

export default async function AcademicSettings() {
  const user = await requireUser("/academic/settings");
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-8">
      <PageHeader title="Settings" description={`${user.name} · ${user.level || "Academic"} ${user.specialty}`} />
      <section className="rounded-2xl border bg-card px-5 py-2">
        <h2 className="pt-3 font-semibold">Generation defaults</h2>
        <PreferenceSettings storageKey="fmd-academic" items={[
          { id: "notes", label: "Always generate speaker notes", description: "Presenter-ready notes for every slide." },
          { id: "viva", label: "Prepare viva questions with each presentation", description: "Faculty-style questions from your exact slides." },
          { id: "unverified", label: "Warn about unverified citations", description: "Flag sources awaiting DOI/PubMed verification.", defaultOn: true },
        ]} />
      </section>
    </div>
  );
}
