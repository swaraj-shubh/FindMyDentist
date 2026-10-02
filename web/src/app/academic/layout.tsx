import type { Metadata } from "next";
import { AppHeader } from "@/components/shared/app-header";
import { AppSidebar, MobileSidebarTrigger } from "@/components/shared/app-sidebar";
import { PersonaGate } from "@/components/shared/persona-gate";
import { getNotificationsForUser } from "@/lib/server/repositories/users";
import { canAccess, getSession } from "@/lib/server/session";

export const metadata: Metadata = { title: { default: "FMD Academic", template: "%s · FMD Academic" } };

export default async function AcademicLayout({ children }: LayoutProps<"/academic">) {
  const user = await getSession();
  if (!canAccess(user, "academic")) return <PersonaGate product="academic" personas={["student"]} signedIn={!!user} />;
  const notifications = await getNotificationsForUser(user!.id);
  return (
    <div className="flex min-h-dvh bg-background">
      <AppSidebar product="academic" />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader product="academic" user={user} notifications={notifications} settingsHref="/academic/settings" left={<MobileSidebarTrigger product="academic" />} />
        <main id="content" className="flex-1">{children}</main>
      </div>
    </div>
  );
}
