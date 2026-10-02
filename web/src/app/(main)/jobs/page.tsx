import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { jobsRepo } from "@/lib/server/repositories/jobs";
import { getSession } from "@/lib/server/session";
import { JobsBoard } from "./jobs-board";

export const metadata: Metadata = { title: "Dental jobs" };

// ponytail: applications are acknowledged client-side only; an applications table comes with real hiring flows.
export default async function JobsPage() {
  const [jobs, user] = await Promise.all([jobsRepo.all(), getSession()]);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Dental jobs" description="Associate, locum, faculty and internship roles across India." />
      <JobsBoard jobs={jobs.sort((a, b) => b.postedAt.localeCompare(a.postedAt))} signedIn={!!user} />
    </div>
  );
}
