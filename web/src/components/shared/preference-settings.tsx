"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

/**
 * Per-viewer preferences kept in localStorage.
 * ponytail: browser-only; move to a user_preferences table when preferences must sync across devices.
 */
export function PreferenceSettings({ storageKey, items }: { storageKey: string; items: { id: string; label: string; description: string; defaultOn?: boolean }[] }) {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => Object.fromEntries(items.map((i) => [i.id, i.defaultOn ?? true])));
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage after mount
      if (saved) setPrefs((p) => ({ ...p, ...JSON.parse(saved) }));
    } catch {}
  }, [storageKey]);
  function toggle(id: string, v: boolean) {
    const next = { ...prefs, [id]: v };
    setPrefs(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
  }
  return (
    <ul className="divide-y">
      {items.map((i) => (
        <li key={i.id} className="flex items-center justify-between gap-4 py-3.5">
          <div>
            <Label htmlFor={`${storageKey}-${i.id}`} className="font-medium">{i.label}</Label>
            <p className="text-sm text-muted-foreground">{i.description}</p>
          </div>
          <Switch id={`${storageKey}-${i.id}`} checked={prefs[i.id]} onCheckedChange={(v) => toggle(i.id, v)} />
        </li>
      ))}
    </ul>
  );
}
