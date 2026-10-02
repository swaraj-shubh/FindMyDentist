"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { academicNavigation, clinicNavigation, mainNavigation, mainSecondaryNavigation } from "@/lib/config/navigation";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface Hit {
  label: string;
  hint: string;
  href: string;
}

const PAGES: Hit[] = [
  ...mainNavigation.map((n) => ({ label: n.label, hint: "FMD Main", href: n.href })),
  ...mainSecondaryNavigation.map((n) => ({ label: n.label, hint: "FMD Main", href: n.href })),
  ...clinicNavigation.map((n) => ({ label: n.label, hint: "FMD Clinic", href: n.href })),
  ...academicNavigation.map((n) => ({ label: n.label, hint: "FMD Academic", href: n.href })),
  { label: "New seminar", hint: "FMD Academic", href: "/academic/studio/new" },
];

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [dentists, setDentists] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) return;
    const t = setTimeout(async () => {
      const rows = await api<{ name: string; specialty: string; slug: string; city: string }[]>(`/api/v1/main/dentists?q=${encodeURIComponent(q)}`).catch(() => []);
      setDentists(rows.slice(0, 5).map((d) => ({ label: d.name, hint: `${d.specialty} · ${d.city}`, href: `/dentists/${d.slug}` })));
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  const hits = useMemo(() => {
    const term = q.trim().toLowerCase();
    const pages = PAGES.filter((p) => !term || `${p.label} ${p.hint}`.toLowerCase().includes(term)).slice(0, 6);
    return [...(term.length >= 2 ? dentists : []), ...pages];
  }, [q, dentists]);

  function go(h: Hit) {
    setOpen(false);
    setQ("");
    router.push(h.href);
  }

  return (
    <>
      <Button variant="outline" className="hidden h-9 w-56 justify-start gap-2 rounded-full text-muted-foreground md:flex" onClick={() => setOpen(true)}>
        <Search className="size-4" />
        <span className="flex-1 text-left font-normal">Search FMD…</span>
        <kbd className="rounded border bg-muted px-1.5 font-mono text-[10px]">⌘K</kbd>
      </Button>
      <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search" onClick={() => setOpen(true)}>
        <Search />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[20%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg" showCloseButton={false}>
          <DialogTitle className="sr-only">Search FMD</DialogTitle>
          <div className="flex items-center gap-2 border-b px-4">
            <Search className="size-4 text-muted-foreground" aria-hidden />
            <input
              autoFocus
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, hits.length - 1));
                if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
                if (e.key === "Enter" && hits[active]) go(hits[active]);
              }}
              placeholder="Dentists, treatments, pages…"
              className="h-12 flex-1 bg-transparent text-sm outline-none"
              aria-label="Search"
            />
          </div>
          <ul className="max-h-80 overflow-y-auto p-2" role="listbox">
            {hits.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">No matches for “{q}”</li>}
            {hits.map((h, i) => (
              <li key={h.href + h.label} role="option" aria-selected={i === active}>
                <button
                  onClick={() => go(h)}
                  onMouseEnter={() => setActive(i)}
                  className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm", i === active && "bg-muted")}
                >
                  {h.href.startsWith("/dentists/") ? <Stethoscope className="size-4 text-primary" /> : <ArrowRight className="size-4 text-muted-foreground" />}
                  <span className="flex-1 font-medium">{h.label}</span>
                  <span className="text-xs text-muted-foreground">{h.hint}</span>
                </button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
