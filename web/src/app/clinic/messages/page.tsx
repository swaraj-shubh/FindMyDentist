import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { UserAvatar } from "@/components/shared/user-avatar";
import { MessageThread } from "@/components/clinic/clinic-message-panel";
import { getClinicForUser, listThreads } from "@/lib/server/services/clinic-service";
import { requireUser } from "@/lib/server/session";
import { cn, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: PageProps<"/clinic/messages">) {
  const sp = await searchParams;
  const user = await requireUser("/clinic/messages");
  const clinic = await getClinicForUser(user);
  const threads = await listThreads(clinic.id);
  const active = threads.find((t) => t.patient.id === sp.patient) ?? threads[0];
  return (
    <div className="space-y-6">
      <PageHeader title="Messages" description="Patient conversations, with AI-suggested replies." />
      {!threads.length ? <EmptyState icon={MessageSquare} title="No conversations yet" /> : (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <ul className="divide-y overflow-hidden rounded-xl border bg-card">
            {threads.map((t) => (
              <li key={t.patient.id}>
                <Link href={`/clinic/messages?patient=${t.patient.id}`} aria-current={t.patient.id === active.patient.id ? "true" : undefined} className={cn("flex items-center gap-3 p-3 hover:bg-muted/50", t.patient.id === active.patient.id && "bg-secondary/60")}>
                  <UserAvatar name={t.patient.name} size="md" />
                  <span className="min-w-0 flex-1"><span className="flex justify-between gap-2"><span className="truncate font-medium">{t.patient.name}</span><span className="shrink-0 text-xs text-muted-foreground">{timeAgo(t.last.createdAt)}</span></span><span className="block truncate text-sm text-muted-foreground">{t.last.body}</span></span>
                  {t.unread > 0 && <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground" aria-label={`${t.unread} unread`}>{t.unread}</span>}
                </Link>
              </li>
            ))}
          </ul>
          <div className="space-y-3">
            <Link href={`/clinic/patients/${active.patient.id}`} className="flex items-center gap-3 font-semibold hover:underline"><UserAvatar name={active.patient.name} size="sm" />{active.patient.name}</Link>
            <MessageThread key={active.patient.id} patientId={active.patient.id} patientName={active.patient.name} messages={active.messages} />
          </div>
        </div>
      )}
    </div>
  );
}
