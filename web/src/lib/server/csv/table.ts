import { readCsv } from "./reader";
import { withFileLock, writeCsv } from "./writer";
import { decodeRow, encodeRow, type Codec, type RawRow } from "./parser";

/**
 * Minimal CRUD over one CSV file. Repositories wrap this; services never see CSV.
 * Swapping to PostgreSQL means re-implementing this interface, not the services.
 */
export function defineTable<T extends { id: string }>(name: string, codec: Codec = {}) {
  const decode = (r: RawRow) => decodeRow<T>(r, codec);

  async function all(): Promise<T[]> {
    return (await readCsv(name)).rows.map(decode);
  }

  async function mutate(fn: (rows: T[]) => T[]) {
    return withFileLock(name, async () => {
      const { header, rows } = await readCsv(name);
      const next = fn(rows.map(decode)).map(encodeRow);
      const cols = [...header];
      for (const r of next) for (const k of Object.keys(r)) if (!cols.includes(k)) cols.push(k);
      await writeCsv(name, cols, next);
    });
  }

  return {
    all,
    async get(id: string) {
      return (await all()).find((r) => r.id === id) ?? null;
    },
    async where(pred: (row: T) => boolean) {
      return (await all()).filter(pred);
    },
    async insert(row: T) {
      await mutate((rows) => [...rows, row]);
      return row;
    },
    async update(id: string, patch: Partial<T>) {
      let updated: T | null = null;
      await mutate((rows) =>
        rows.map((r) => (r.id === id ? (updated = { ...r, ...patch, id }) : r)),
      );
      return updated as T | null;
    },
    async remove(id: string) {
      await mutate((rows) => rows.filter((r) => r.id !== id));
    },
    async replaceWhere(pred: (row: T) => boolean, next: T[]) {
      await mutate((rows) => [...rows.filter((r) => !pred(r)), ...next]);
    },
  };
}

export function newId(prefix: string) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
