import { Eye, Play } from "lucide-react";
import { formatCompact } from "@/lib/utils";
import type { Reel } from "@/types/content";
import { specialtyHue } from "./specialty-chip";

// ponytail: reels show a styled poster; real video playback arrives with media storage.
export function ReelCard({ reel, authorName }: { reel: Reel; authorName: string }) {
  const h = specialtyHue(reel.specialty + reel.title);
  return (
    <article
      className="relative flex aspect-[9/16] flex-col justify-end overflow-hidden rounded-2xl p-3 text-white"
      style={{ background: `linear-gradient(180deg, oklch(0.62 0.1 ${h}) 0%, oklch(0.32 0.07 ${(h + 50) % 360}) 100%)` }}
      aria-label={`Reel: ${reel.title} by ${authorName}`}
    >
      <span className="absolute top-2 right-2 rounded-full bg-black/35 px-2 py-0.5 text-[11px] tabular-nums">0:{String(reel.duration).padStart(2, "0")}</span>
      <Play className="absolute inset-0 m-auto size-10 fill-white/90 text-white/90" aria-hidden />
      <p className="text-sm leading-snug font-semibold">{reel.title}</p>
      <p className="mt-1 flex items-center justify-between text-[11px] text-white/80">
        <span className="truncate">{authorName}</span>
        <span className="flex items-center gap-1"><Eye className="size-3" aria-hidden />{formatCompact(reel.views)}</span>
      </p>
    </article>
  );
}
