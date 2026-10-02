import { handle, ok, parseBody } from "@/lib/server/http";
import { createTreatment, getClinicForUser, listTreatments, updateTreatment } from "@/lib/server/services/clinic-service";
import { apiAuth } from "@/lib/server/session";
import { treatmentSchema, treatmentUpdateSchema } from "@/lib/validations/clinic";

export async function GET() {
  const auth = await apiAuth("clinic");
  if (auth.error) return auth.error;
  const clinic = await getClinicForUser(auth.user);
  return ok(await listTreatments(clinic.id));
}

export async function POST(req: Request) {
  const auth = await apiAuth("clinic");
  if (auth.error) return auth.error;
  const body = await parseBody(req, treatmentSchema);
  if (body.error) return body.error;
  try {
    const clinic = await getClinicForUser(auth.user);
    return ok(await createTreatment(clinic.id, body.data), { status: 201 });
  } catch (e) {
    return handle(e);
  }
}

export async function PATCH(req: Request) {
  const auth = await apiAuth("clinic");
  if (auth.error) return auth.error;
  const body = await parseBody(req, treatmentUpdateSchema);
  if (body.error) return body.error;
  try {
    const clinic = await getClinicForUser(auth.user);
    return ok(await updateTreatment(clinic.id, body.data.id, body.data.action));
  } catch (e) {
    return handle(e);
  }
}
