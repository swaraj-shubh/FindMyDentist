import { formatCurrency, formatDate } from "@/lib/utils";

// ponytail: dependency-free SVG charts; swap for recharts if interactivity (tooltips, zoom) is needed.
export function BarChart({ data, label, format = (n: number) => String(n) }: { data: { key: string; value: number }[]; label: string; format?: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <figure>
      <svg viewBox={`0 0 ${data.length * 12} 100`} preserveAspectRatio="none" className="h-44 w-full" role="img" aria-label={label}>
        {data.map((d, i) => {
          const h = (d.value / max) * 92;
          return <rect key={d.key} x={i * 12 + 1.5} y={100 - h} width={9} height={h} rx={1.5} className="fill-primary/80 hover:fill-primary"><title>{`${d.key}: ${format(d.value)}`}</title></rect>;
        })}
      </svg>
      <figcaption className="mt-1 flex justify-between text-xs text-muted-foreground"><span>{formatDate(data[0].key, { day: "numeric", month: "short" })}</span><span>peak {format(max)}</span><span>{formatDate(data.at(-1)!.key, { day: "numeric", month: "short" })}</span></figcaption>
    </figure>
  );
}

export function HorizontalBars({ rows }: { rows: { label: string; value: number; display?: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1 flex justify-between text-sm"><span>{r.label}</span><span className="font-medium tabular-nums">{r.display ?? r.value}</span></div>
          <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(r.value / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}

export const money = formatCurrency;
