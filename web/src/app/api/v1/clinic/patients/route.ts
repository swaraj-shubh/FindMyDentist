import type { NextRequest } from "next/server";
import { handle, ok, parseBody } from "@/lib/server/http";
import { addPatient, getClinicForUser, getPatientDetail, listPatients } from "@/lib/server/services/clinic-service";
import { apiAuth } from "@/lib/server/session";
import { newPatientSchema } from "@/lib/validations/patient";

export async function GET(req: NextRequest) {
  const auth = await apiAuth("clinic");
  if (auth.error) return auth.error;
  try {
    const clinic = await getClinicForUser(auth.user);
    const id = req.nextUrl.searchParams.get("id");
    return ok(id ? await getPatientDetail(clinic.id, id) : await listPatients(clinic.id, req.nextUrl.searchParams.get("q") ?? ""));
  } catch (e) {
    return handle(e);
  }
}

export async function POST(req: Request) {
  const auth = await apiAuth("clinic");
  if (auth.error) return auth.error;
  const body = await parseBody(req, newPatientSchema);
  if (body.error) return body.error;
  const clinic = await getClinicForUser(auth.user);
  return ok(await addPatient(clinic.id, body.data), { status: 201 });
}
