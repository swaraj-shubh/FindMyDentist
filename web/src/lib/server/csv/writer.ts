import { rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { stringify } from "csv-stringify/sync";
import { DATA_DIR } from "./reader";
import type { RawRow } from "./parser";

const queues = new Map<string, Promise<unknown>>();

// ponytail: in-process per-file lock; only safe for a single Node process. PostgreSQL replaces this.
export function withFileLock<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const run = (queues.get(name) ?? Promise.resolve()).then(fn, fn);
  queues.set(name, run.catch(() => undefined));
  return run;
}

export async function writeCsv(name: string, header: string[], rows: RawRow[]) {
  const file = path.join(DATA_DIR, `${name}.csv`);
  const text = stringify([header, ...rows.map((r) => header.map((h) => r[h] ?? ""))]);
  await writeFile(`${file}.tmp`, text);
  await rename(`${file}.tmp`, file);
}
