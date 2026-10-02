"use client";

import Link from "next/link";
import { Map as MapIcon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface Pin {
  id: string;
  label: string;
  sub: string;
  lat: number;
  lng: number;
  href: string;
}

// ponytail: stylised map projected from lat/lng — no tile provider or API key. Swap for Leaflet/Mapbox when needed.
export function MapView({ pins, className, activeId, onHover }: { pins: Pin[]; className?: string; activeId?: string | null; onHover?: (id: string | null) => void }) {
  const unique = [...new Map(pins.map((p) => [`${p.lat},${p.lng}`, p])).values()];
  const lats = unique.map((p) => p.lat);
  const lngs = unique.map((p) => p.lng);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const pos = (p: Pin) => ({
    left: `${unique.length < 2 ? 50 : 12 + ((p.lng - minLng) / (maxLng - minLng || 1)) * 76}%`,
    top: `${unique.length < 2 ? 50 : 12 + ((maxLat - p.lat) / (maxLat - minLat || 1)) * 76}%`,
  });
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border bg-[oklch(0.95_0.02_160)] dark:bg-[oklch(0.25_0.02_200)]", className)} role="img" aria-label={`Map showing ${pins.length} locations`}>
      <svg className="absolute inset-0 size-full opacity-60" aria-hidden>
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" fill="none" stroke="currentColor" strokeOpacity="0.08" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <path d="M-20 140 C 120 90, 220 260, 420 180 S 700 120, 900 220" stroke="oklch(0.85 0.05 230)" strokeWidth="26" fill="none" />
        <path d="M60 -20 C 120 160, 60 320, 180 520" stroke="white" strokeOpacity="0.8" strokeWidth="6" fill="none" />
        <path d="M-20 360 C 200 330, 400 420, 900 360" stroke="white" strokeOpacity="0.8" strokeWidth="5" fill="none" />
      </svg>
      {unique.map((p) => (
        <Link
          key={p.id}
          href={p.href}
          style={pos(p)}
          onMouseEnter={() => onHover?.(p.id)}
          onMouseLeave={() => onHover?.(null)}
          className={cn("group absolute -translate-x-1/2 -translate-y-full transition-transform", activeId === p.id && "z-10 scale-110")}
        >
          <MapPin className={cn("size-8 drop-shadow", activeId === p.id ? "fill-primary text-primary-foreground" : "fill-card text-primary")} aria-hidden />
          <span className={cn("pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded-lg border bg-popover px-2 py-1 text-xs whitespace-nowrap shadow-sm transition-opacity", activeId === p.id ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100")}>
            <span className="block font-medium">{p.label}</span>
            <span className="block text-muted-foreground">{p.sub}</span>
          </span>
        </Link>
      ))}
      <span className="absolute right-2 bottom-2 rounded bg-background/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">Schematic map</span>
    </div>
  );
}

export function MapSheet({ pins }: { pins: Pin[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden"><MapIcon /> Map</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[75dvh] p-4">
        <SheetTitle>Map</SheetTitle>
        <MapView pins={pins} className="flex-1" />
      </SheetContent>
    </Sheet>
  );
}
