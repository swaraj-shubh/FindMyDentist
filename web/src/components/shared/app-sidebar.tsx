"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { academicNavigation, clinicNavigation, isActive, settingsItem, type NavItem } from "@/lib/config/navigation";
import { cn } from "@/lib/utils";
import { ProductLogo } from "./brand";

const NAV: Record<"clinic" | "academic", { items: NavItem[]; root: string }> = {
  clinic: { items: clinicNavigation, root: "/clinic" },
  academic: { items: academicNavigation, root: "/academic" },
};

function NavList({ product, collapsed, onNavigate }: { product: "clinic" | "academic"; collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { items, root } = NAV[product];
  const link = (item: NavItem) => {
    const active = isActive(pathname, item.href, root);
    const a = (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
          active && "bg-sidebar-accent text-foreground",
          collapsed && "justify-center px-0",
        )}
      >
        <item.icon className={cn("size-4 shrink-0", active && "text-primary")} aria-hidden />
        {collapsed ? <span className="sr-only">{item.label}</span> : item.label}
      </Link>
    );
    return collapsed ? (
      <Tooltip key={item.href}>
        <TooltipTrigger asChild>{a}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    ) : (
      a
    );
  };
  return (
    <nav className="flex flex-1 flex-col gap-1" aria-label={`${product} navigation`}>
      {items.map(link)}
      <div className="mt-auto pt-4">{link(settingsItem(root))}</div>
    </nav>
  );
}

/** Permanent sidebar on desktop, sheet on smaller screens. `collapsed` gives the Studio a slim rail. */
export function AppSidebar({ product, footer }: { product: "clinic" | "academic"; footer?: React.ReactNode }) {
  const pathname = usePathname();
  const collapsed = product === "academic" && /^\/academic\/studio\/(?!new)[^/]+/.test(pathname);
  return (
    <aside className={cn("sticky top-0 hidden h-dvh shrink-0 flex-col border-r bg-sidebar p-3 lg:flex no-print", collapsed ? "w-16" : "w-60")}>
      <div className={cn("mb-6 px-1 pt-1", collapsed && "flex justify-center px-0")}>
        <ProductLogo product={product} href={NAV[product].root} compact={collapsed} />
      </div>
      <NavList product={product} collapsed={collapsed} />
      {!collapsed && footer}
    </aside>
  );
}

export function MobileSidebarTrigger({ product }: { product: "clinic" | "academic" }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
          <PanelLeft />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-sidebar p-3">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="mb-6 px-1 pt-1">
          <ProductLogo product={product} href={NAV[product].root} />
        </div>
        <NavList product={product} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
