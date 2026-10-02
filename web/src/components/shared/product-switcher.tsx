"use client";

import Link from "next/link";
import { Check, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PRODUCTS, type ProductId } from "@/lib/config/products";
import { FmdMark } from "./brand";

export function ProductSwitcher({ current }: { current: ProductId }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Switch workspace">
          <LayoutGrid />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-1.5">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Switch workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.values(PRODUCTS).map((p) => (
          <DropdownMenuItem key={p.id} asChild className="gap-3 rounded-lg p-2">
            <Link href={p.href} aria-current={p.id === current ? "page" : undefined}>
              <FmdMark color={p.color} className="size-9" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-medium">{p.id === "main" ? "FMD Main" : p.name}</span>
                <span className="text-xs text-muted-foreground">{p.tagline}</span>
              </span>
              {p.id === current && <Check className="text-primary" aria-label="Current workspace" />}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <p className="px-2 py-1.5 text-[11px] leading-snug text-muted-foreground">One FMD identity across every workspace.</p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
