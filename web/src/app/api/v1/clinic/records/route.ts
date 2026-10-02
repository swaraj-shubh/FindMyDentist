import { handle, ok, parseBody } from "@/lib/server/http";
import { addRecord, getClinicForUser } from "@/lib/server/services/clinic-service";
import { apiAuth } from "@/lib/server/session";
import { newRecordSchema } from "@/lib/validations/patient";

// ponytail: metadata only — file uploads go to secure object storage in production.
export async function POST(req: Request) {
  const auth = await apiAuth("clinic");
  if (auth.error) return auth.error;
  const body = await parseBody(req, newRecordSchema);
  if (body.error) return body.error;
  try {
    const clinic = await getClinicForUser(auth.user);
    return ok(await addRecord(clinic.id, auth.user, body.data), { status: 201 });
  } catch (e) {
    return handle(e);
  }
}
