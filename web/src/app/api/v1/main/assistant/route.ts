import { ok, parseBody } from "@/lib/server/http";
import { analyzeSymptoms } from "@/lib/server/services/assistant-service";
import { getSession } from "@/lib/server/session";
import { assistantSchema } from "@/lib/validations/assistant";

// Public: guidance doesn't require an account. Nothing the user types is stored.
export async function POST(req: Request) {
  const body = await parseBody(req, assistantSchema);
  if (body.error) return body.error;
  return ok(await analyzeSymptoms(body.data.message, await getSession(), body.data.hasImage));
}
