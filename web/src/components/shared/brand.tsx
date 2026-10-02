import Link from "next/link";
import { cn } from "@/lib/utils";
import { PRODUCTS, type ProductId } from "@/lib/config/products";

export function FmdMark({ className, color = "var(--product-main)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8 shrink-0", className)}>
      <rect width="32" height="32" rx="9" fill={color} />
      {/* Stylised molar */}
      <path
        d="M10.2 9.5c1.6-1.1 3.5-.9 5.8.2 2.3-1.1 4.2-1.3 5.8-.2 1.9 1.3 2.1 4 1.2 6.6-.6 1.8-1 3.6-1.3 5.5-.2 1.4-1 2.2-1.9 2.2-1.2 0-1.6-1.2-1.9-2.6-.3-1.5-.8-2.6-1.9-2.6s-1.6 1.1-1.9 2.6c-.3 1.4-.7 2.6-1.9 2.6-.9 0-1.7-.8-1.9-2.2-.3-1.9-.7-3.7-1.3-5.5-.9-2.6-.7-5.3 1.2-6.6Z"
        fill="white"
      />
    </svg>
  );
}

export function ProductLogo({ product, href, compact = false }: { product: ProductId; href?: string; compact?: boolean }) {
  const p = PRODUCTS[product];
  const inner = (
    <span className="flex items-center gap-2.5">
      <FmdMark color={p.color} className="size-8" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-tight">{product === "main" ? "FindMyDentist" : p.name}</span>
          <span className="mt-0.5 text-[11px] text-muted-foreground">{product === "main" ? "FMD" : p.tagline}</span>
        </span>
      )}
    </span>
  );
  return href ? (
    <Link href={href} className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50" aria-label={`${p.name} home`}>
      {inner}
    </Link>
  ) : (
    inner
  );
}
