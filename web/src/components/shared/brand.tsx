import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PRODUCTS, type ProductId } from "@/lib/config/products";

/** The FMD logo (public/fmd.png). `color` is accepted for call-site compatibility but the logo keeps its brand colours. */
export function FmdMark({ className }: { className?: string; color?: string }) {
  return <Image src="/fmd.png" alt="" aria-hidden width={545} height={458} priority className={cn("size-8 shrink-0 object-contain", className)} />;
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
