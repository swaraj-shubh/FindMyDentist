"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, mainMobileNavigation, mainNavigation } from "@/lib/config/navigation";
import { cn } from "@/lib/utils";

export function MainDesktopNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 xl:flex" aria-label="Main navigation">
      {mainNavigation.map((item) => {
        const active = isActive(pathname, item.href, "/home");
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn("rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground", active && "bg-secondary text-secondary-foreground")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MainTabletNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-0.5 md:flex xl:hidden" aria-label="Main navigation">
      {mainNavigation.map((item) => {
        const active = isActive(pathname, item.href, "/home");
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            aria-current={active ? "page" : undefined}
            className={cn("flex size-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground", active && "bg-secondary text-secondary-foreground")}
          >
            <item.icon className="size-4" aria-hidden />
            <span className="sr-only">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden no-print" aria-label="Main navigation">
      <ul className="grid grid-cols-5">
        {mainMobileNavigation.map((item) => {
          const active = isActive(pathname, item.href, "/home");
          return (
            <li key={item.href}>
              <Link href={item.href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground", active && "text-primary")}>
                <span className={cn("flex h-7 w-12 items-center justify-center rounded-full", active && "bg-secondary")}>
                  <item.icon className="size-5" aria-hidden />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
