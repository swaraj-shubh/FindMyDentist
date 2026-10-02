import { cp, readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";
import type { RawRow } from "./parser";

const SEED_DIR = path.join(process.cwd(), "data");

// ponytail: on Vercel the deployed filesystem is read-only, so the seed CSVs are copied to /tmp once per
// instance and edits live only as long as that instance. A real database replaces this.
export const DATA_DIR = process.env.VERCEL ? "/tmp/fmd-data" : SEED_DIR;

let ready: Promise<void> | undefined;
export function ensureData() {
  if (!process.env.VERCEL) return Promise.resolve();
  return (ready ??= cp(SEED_DIR, DATA_DIR, { recursive: true, force: false }));
}

export async function readCsv(name: string): Promise<{ header: string[]; rows: RawRow[] }> {
  await ensureData();
  let text: string;
  try {
    text = await readFile(path.join(DATA_DIR, `${name}.csv`), "utf8");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return { header: [], rows: [] };
    throw e;
  }
  const records: string[][] = parse(text, { skip_empty_lines: true });
  const [header = [], ...body] = records;
  const rows = body.map((cells) => Object.fromEntries(header.map((h, i) => [h, cells[i] ?? ""])));
  return { header, rows };
}
