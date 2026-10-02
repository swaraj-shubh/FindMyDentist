import Link from "next/link";
import { cn, hashUnit } from "@/lib/utils";

export function specialtyHue(name: string) {
  return Math.round(hashUnit(name) * 360);
}

export function SpecialtyChip({ name, href, active, className }: { name: string; href?: string; active?: boolean; className?: string }) {
  const cls = cn(
    "inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-sm font-medium whitespace-nowrap transition-colors",
    active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/40 hover:bg-secondary",
    className,
  );
  return href ? (
    <Link href={href} className={cls} aria-current={active ? "true" : undefined}>
      {name}
    </Link>
  ) : (
    <span className={cls}>{name}</span>
  );
}
