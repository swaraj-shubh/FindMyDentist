import Link from "next/link";
import { AppHeader } from "@/components/shared/app-header";
import { ProductLogo } from "@/components/shared/brand";
import { MainDesktopNav, MainTabletNav, MobileNav } from "@/components/shared/mobile-nav";
import { getNotificationsForUser } from "@/lib/server/repositories/users";
import { getSession } from "@/lib/server/session";

export default async function MainLayout({ children }: LayoutProps<"/">) {
  const user = await getSession();
  const notifications = user ? await getNotificationsForUser(user.id) : [];
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2">
        Skip to content
      </a>
      <AppHeader
        product="main"
        user={user}
        notifications={notifications}
        left={<ProductLogo product="main" href="/home" />}
        center={
          <>
            <MainDesktopNav />
            <MainTabletNav />
          </>
        }
      />
      <main id="content" className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-28 sm:px-6 md:pb-16 lg:pt-8">
        {children}
      </main>
      <footer className="hidden border-t py-8 text-sm text-muted-foreground md:block no-print">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6">
          <span>© {new Date().getFullYear()} FindMyDentist · Prototype — all people and records are fictional.</span>
          <span className="flex gap-4">
            <Link href="/clinics" className="hover:text-foreground">Clinics</Link>
            <Link href="/jobs" className="hover:text-foreground">Jobs</Link>
            <Link href="/clinic" className="hover:text-foreground">For clinics</Link>
            <Link href="/academic" className="hover:text-foreground">FMD Academic</Link>
          </span>
        </div>
      </footer>
      <MobileNav />
    </div>
  );
}
