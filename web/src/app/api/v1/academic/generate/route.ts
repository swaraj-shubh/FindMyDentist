import { handle, ok, parseBody } from "@/lib/server/http";
import { generateSlides, regenerateBlueprint, regenerateOneSlide } from "@/lib/server/services/academic-service";
import { apiAuth } from "@/lib/server/session";
import { generateSchema } from "@/lib/validations/academic";

// ponytail: generation runs inline; production moves it to a queued background job with retries.
export async function POST(req: Request) {
  const auth = await apiAuth("academic");
  if (auth.error) return auth.error;
  const body = await parseBody(req, generateSchema);
  if (body.error) return body.error;
  try {
    const b = body.data;
    if (b.mode === "blueprint") return ok(await regenerateBlueprint(auth.user, b.projectId));
    if (b.mode === "slide") return ok(await regenerateOneSlide(auth.user, b.projectId, b.slideId));
    return ok(await generateSlides(auth.user, b.projectId));
  } catch (e) {
    return handle(e);
  }
}
