"use client";

/** Typed fetch for /api/v1 — throws an Error carrying the server's message. */
export async function api<T = unknown>(url: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(url, {
    method: init.method ?? (init.body ? "POST" : "GET"),
    headers: init.body ? { "Content-Type": "application/json" } : undefined,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.error ?? "Something went wrong") as Error & { issues?: Record<string, string[]> };
    err.issues = json.issues;
    throw err;
  }
  return json.data as T;
}
