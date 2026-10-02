import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GenerationForm } from "@/components/academic/generation-form";
import { requireUser } from "@/lib/server/session";
import type { ProjectKind } from "@/types/academic";

export const metadata: Metadata = { title: "Create project" };

const KINDS = ["seminar", "journal_club", "case", "poster"];

export default async function NewProject({ searchParams }: PageProps<"/academic/studio/new">) {
  const sp = await searchParams;
  const user = await requireUser("/academic/studio/new");
  const kind = (KINDS.includes(String(sp.kind)) ? sp.kind : "seminar") as ProjectKind;
  return (
    <div className="space-y-6 p-4 sm:p-8">
      <Link href="/academic/studio" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Projects</Link>
      <div className="mx-auto max-w-xl">
        <p className="text-sm font-medium text-product-academic">Step 1 · Define the project</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Create Academic Project</h1>
      </div>
      <GenerationForm kind={kind} defaults={{ specialty: user.specialty || "Prosthodontics", level: user.level || "MDS", topic: typeof sp.topic === "string" ? sp.topic : undefined }} />
    </div>
  );
}
