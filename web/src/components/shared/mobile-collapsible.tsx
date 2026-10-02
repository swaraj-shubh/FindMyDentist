"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Always visible on desktop; behind a toggle on small screens. One copy of the children, so forms submit once. */
export function MobileCollapsible({ label = "Filters", children, className }: { label?: string; children: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={className}>
      <Button type="button" variant="outline" className="w-full lg:hidden" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <SlidersHorizontal /> {open ? `Hide ${label.toLowerCase()}` : label}
      </Button>
      <div className={cn("mt-4 lg:mt-0 lg:block", !open && "hidden")}>{children}</div>
    </div>
  );
}
