import { NextResponse } from "next/server";
import { z } from "zod";

export const ok = <T>(data: T, init?: ResponseInit) => NextResponse.json({ data }, init);

export const fail = (error: string, status = 400, issues?: Record<string, string[] | undefined>) =>
  NextResponse.json({ error, issues }, { status });

/** Parse a JSON body against a schema; returns either the data or a ready 400 response. */
export async function parseBody<S extends z.ZodType>(req: Request, schema: S) {
  const json = await req.json().catch(() => null);
  const result = schema.safeParse(json);
  if (!result.success) {
    const flat = z.flattenError(result.error);
    return { error: fail(flat.formErrors[0] ?? "Please check the highlighted fields", 400, flat.fieldErrors as Record<string, string[]>) };
  }
  return { data: result.data as z.infer<S> };
}

/** Domain errors thrown by services; route handlers turn them into 4xx. */
export class ServiceError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export function handle(e: unknown) {
  if (e instanceof ServiceError) return fail(e.message, e.status);
  console.error(e);
  return fail("Something went wrong. Please try again.", 500);
}
