// Pure row codec shared by the app and scripts/seed.ts — keep it free of alias imports.
// Convention: CSV headers are snake_case; arrays/objects live in `<name>_json` columns.

export type RawRow = Record<string, string>;

export interface Codec {
  numbers?: readonly string[];
  booleans?: readonly string[];
}

const toCamel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
const toSnake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

export function decodeRow<T>(row: RawRow, codec: Codec = {}): T {
  const out: Record<string, unknown> = {};
  for (const [col, raw] of Object.entries(row)) {
    if (col.endsWith("_json")) {
      out[toCamel(col.slice(0, -5))] = raw ? JSON.parse(raw) : [];
      continue;
    }
    const key = toCamel(col);
    if (codec.numbers?.includes(key)) out[key] = raw === "" ? 0 : Number(raw);
    else if (codec.booleans?.includes(key)) out[key] = raw === "true";
    else out[key] = raw;
  }
  return out as T;
}

export function encodeRow(obj: object): RawRow {
  const out: RawRow = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && typeof value === "object") out[`${toSnake(key)}_json`] = JSON.stringify(value);
    else out[toSnake(key)] = value === undefined || value === null ? "" : String(value);
  }
  return out;
}
