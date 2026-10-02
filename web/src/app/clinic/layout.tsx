import type { Metadata } from "next";
import { AppHeader } from "@/components/shared/app-header";
import { AppSidebar, MobileSidebarTrigger } from "@/components/shared/app-sidebar";
import { PersonaGate } from "@/components/shared/persona-gate";
import { clinicsRepo } from "@/lib/server/repositories/clinics";
import { getNotificationsForUser } from "@/lib/server/repositories/users";
import { canAccess, getSession } from "@/lib/server/session";

export const metadata: Metadata = { title: { default: "FMD Clinic", template: "%s · FMD Clinic" } };

export default async function ClinicLayout({ children }: LayoutProps<"/clinic">) {
  const user = await getSession();
  if (!canAccess(user, "clinic")) return <PersonaGate product="clinic" personas={["dentist", "clinic"]} signedIn={!!user} />;
  const [notifications, clinic] = await Promise.all([getNotificationsForUser(user!.id), clinicsRepo.get(user!.clinicId || "c001")]);
  return (
    <div className="flex min-h-dvh bg-background">
      <AppSidebar
        product="clinic"
        footer={
          <div className="mt-4 rounded-xl border bg-card p-3 text-xs">
            <p className="font-medium">{clinic?.name}</p>
            <p className="text-muted-foreground">{clinic?.address}</p>
          </div>
        }
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          product="clinic"
          user={user}
          notifications={notifications}
          settingsHref="/clinic/settings"
          left={
            <>
              <MobileSidebarTrigger product="clinic" />
              <span className="truncate text-sm font-medium lg:text-base">{clinic?.name}</span>
            </>
          }
        />
        <main id="content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
