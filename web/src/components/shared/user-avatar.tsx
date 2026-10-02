import { cn, hashUnit, initials } from "@/lib/utils";

const SIZES = { xs: "size-6 text-[10px]", sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-14 text-lg", xl: "size-24 text-3xl" };

/** Initials on a soft, name-derived tint — no stock photos of real people in a demo. */
export function UserAvatar({ name, size = "sm", className, ring }: { name: string; size?: keyof typeof SIZES; className?: string; ring?: boolean }) {
  const hue = Math.round(hashUnit(name) * 360);
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold", SIZES[size], ring && "ring-2 ring-background ring-offset-2 ring-offset-primary", className)}
      style={{ background: `oklch(0.93 0.04 ${hue})`, color: `oklch(0.38 0.08 ${hue})` }}
    >
      {initials(name)}
    </span>
  );
}
