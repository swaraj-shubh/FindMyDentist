import { handle, ok, parseBody } from "@/lib/server/http";
import { editSlides } from "@/lib/server/services/academic-service";
import { apiAuth } from "@/lib/server/session";
import { slideUpdateSchema } from "@/lib/validations/academic";
import type { Slide } from "@/types/academic";

export async function PATCH(req: Request) {
  const auth = await apiAuth("academic");
  if (auth.error) return auth.error;
  const body = await parseBody(req, slideUpdateSchema);
  if (body.error) return body.error;
  try {
    return ok(await editSlides(auth.user, { ...body.data, patch: body.data.patch as Partial<Slide> | undefined }));
  } catch (e) {
    return handle(e);
  }
}
