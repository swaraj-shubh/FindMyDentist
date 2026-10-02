import { handle, ok, parseBody } from "@/lib/server/http";
import { getClinicForUser, listThreads, sendMessage } from "@/lib/server/services/clinic-service";
import { apiAuth } from "@/lib/server/session";
import { messageSchema } from "@/lib/validations/clinic";

export async function GET() {
  const auth = await apiAuth("clinic");
  if (auth.error) return auth.error;
  const clinic = await getClinicForUser(auth.user);
  return ok(await listThreads(clinic.id));
}

export async function POST(req: Request) {
  const auth = await apiAuth("clinic");
  if (auth.error) return auth.error;
  const body = await parseBody(req, messageSchema);
  if (body.error) return body.error;
  try {
    const clinic = await getClinicForUser(auth.user);
    return ok(await sendMessage(clinic.id, body.data.patientId, body.data.body), { status: 201 });
  } catch (e) {
    return handle(e);
  }
}
