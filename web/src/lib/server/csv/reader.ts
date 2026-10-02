import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";
import type { RawRow } from "./parser";

export const DATA_DIR = path.join(process.cwd(), "data");

export async function readCsv(name: string): Promise<{ header: string[]; rows: RawRow[] }> {
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
