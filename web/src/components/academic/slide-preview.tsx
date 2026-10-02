import { cn } from "@/lib/utils";
import type { Slide } from "@/types/academic";

// One renderer for thumbnails, canvas and presenter view. Sizes use container query units (cqw),
// so the same markup scales from a 140px thumbnail to a full-screen slide.
const T = (n: number) => ({ fontSize: `${n}cqw` });

function Flow({ points }: { points: string[] }) {
  return (
    <div className="flex flex-1 items-center gap-[1.2cqw]">
      {points.slice(0, 4).map((p, i) => (
        <div key={i} className="flex flex-1 items-center gap-[1.2cqw]">
          <div className="flex-1 rounded-[1cqw] border-[0.25cqw] border-[var(--sl-accent)] bg-white/70 p-[1.4cqw] leading-tight" style={T(2)}>{p}</div>
          {i < Math.min(points.length, 4) - 1 && <span style={T(3)} className="text-[var(--sl-accent)]" aria-hidden>→</span>}
        </div>
      ))}
    </div>
  );
}

export function SlidePreview({ slide, className, number = true }: { slide: Slide; className?: string; number?: boolean }) {
  const hue = 192;
  const style = { "--sl-accent": `oklch(0.5 0.1 ${hue})`, containerType: "inline-size" } as React.CSSProperties;
  const pts = slide.keyPoints;
  const base = "relative aspect-video w-full overflow-hidden bg-[oklch(0.99_0.004_85)] text-[oklch(0.25_0.02_260)] select-none";

  let body: React.ReactNode;
  if (slide.slideType === "title")
    body = (
      <div className="flex size-full flex-col justify-center bg-[linear-gradient(135deg,oklch(0.38_0.08_192),oklch(0.5_0.1_210))] p-[6cqw] text-white">
        <p style={T(1.8)} className="tracking-widest uppercase opacity-80">FMD Academic · Seminar</p>
        <h3 style={T(6)} className="mt-[1.5cqw] font-semibold leading-[1.05] text-balance">{slide.title}</h3>
        <p style={T(2.2)} className="mt-[2.5cqw] opacity-85">{pts[0]}</p>
      </div>
    );
  else if (slide.slideType === "section")
    body = (
      <div className="flex size-full flex-col justify-center border-l-[1.5cqw] border-[var(--sl-accent)] p-[6cqw]">
        <p style={T(1.8)} className="tracking-widest text-[var(--sl-accent)] uppercase">Section</p>
        <h3 style={T(5)} className="mt-[1cqw] font-semibold leading-tight text-balance">{slide.title}</h3>
      </div>
    );
  else if (slide.slideType === "references")
    body = (
      <div className="size-full p-[4cqw]">
        <h3 style={T(3.6)} className="font-semibold">References</h3>
        <ol className="mt-[1.5cqw] columns-2 gap-[3cqw] [&>li]:mb-[0.8cqw]" style={T(1.25)}>
          {pts.slice(0, 24).map((p, i) => <li key={i} className="list-inside list-decimal leading-snug">{p}</li>)}
        </ol>
      </div>
    );
  else {
    const split = ["image_explanation", "mechanism", "chart", "definition"].includes(slide.slideType);
    body = (
      <div className="flex size-full flex-col p-[4cqw]">
        <p style={T(1.4)} className="tracking-widest text-[var(--sl-accent)] uppercase">{slide.slideType.replace("_", " ")}</p>
        <h3 style={T(3.6)} className="mt-[0.5cqw] font-semibold leading-tight text-balance">{slide.title}</h3>
        {slide.slideType === "clinical_workflow" ? (
          <div className="mt-[3cqw] flex flex-1"><Flow points={pts} /></div>
        ) : slide.slideType === "comparison" ? (
          <div className="mt-[2.5cqw] grid flex-1 grid-cols-2 gap-[1.5cqw]" style={T(1.9)}>
            {pts.slice(0, 4).map((p, i) => <div key={i} className="rounded-[1cqw] bg-[oklch(0.96_0.02_192)] p-[1.6cqw] leading-snug">{p}</div>)}
          </div>
        ) : slide.slideType === "timeline" ? (
          <ol className="relative mt-[3cqw] ml-[1.5cqw] flex-1 space-y-[2cqw] border-l-[0.3cqw] border-[var(--sl-accent)] pl-[3cqw]" style={T(2)}>
            {pts.slice(0, 4).map((p, i) => <li key={i} className="relative before:absolute before:top-[0.6cqw] before:-left-[3.85cqw] before:size-[1.3cqw] before:rounded-full before:bg-[var(--sl-accent)]">{p}</li>)}
          </ol>
        ) : (
          <div className={cn("mt-[2.5cqw] flex flex-1 gap-[3cqw]", !split && "block")}>
            <ul className="flex-1 space-y-[1.2cqw]" style={T(2.1)}>
              {pts.slice(0, 6).map((p, i) => <li key={i} className="flex gap-[1.2cqw] leading-snug"><span className="mt-[0.9cqw] size-[0.8cqw] shrink-0 rounded-full bg-[var(--sl-accent)]" />{p}</li>)}
            </ul>
            {split && (
              <div className="flex w-[34%] shrink-0 items-center justify-center rounded-[1.2cqw] bg-[oklch(0.95_0.025_192)] p-[1.5cqw] text-center text-[var(--sl-accent)]" style={T(1.4)}>
                <span><span className="block" style={T(5)}>{slide.slideType === "chart" ? "▇▅▇" : slide.slideType === "mechanism" ? "◉→◎" : "▣"}</span>{slide.visualRequirement.replace(/_/g, " ")}</span>
              </div>
            )}
          </div>
        )}
        {slide.citations.length > 0 && <p style={T(1.1)} className="mt-auto pt-[1cqw] text-[oklch(0.5_0.02_260)]">Sources: {slide.citations.length}</p>}
      </div>
    );
  }
  return (
    <div className={cn(base, className)} style={style}>
      {body}
      {number && <span style={T(1.2)} className="absolute right-[1.5cqw] bottom-[1cqw] tabular-nums opacity-50">{slide.slideNumber}</span>}
    </div>
  );
}
