import type { NextRequest } from "next/server";
import { toISODate } from "@/lib/utils";
import { handle, ok, parseBody } from "@/lib/server/http";
import { createClinicAppointment, getClinicForUser, getSchedule, updateAppointment } from "@/lib/server/services/clinic-service";
import { apiAuth } from "@/lib/server/session";
import { appointmentUpdateSchema, clinicAppointmentSchema } from "@/lib/validations/clinic";

export async function GET(req: NextRequest) {
  const auth = await apiAuth("clinic");
  if (auth.error) return auth.error;
  const clinic = await getClinicForUser(auth.user);
  const from = req.nextUrl.searchParams.get("from") ?? toISODate();
  return ok(await getSchedule(clinic.id, from, req.nextUrl.searchParams.get("to") ?? from));
}

export async function POST(req: Request) {
  const auth = await apiAuth("clinic");
  if (auth.error) return auth.error;
  const body = await parseBody(req, clinicAppointmentSchema);
  if (body.error) return body.error;
  try {
    const clinic = await getClinicForUser(auth.user);
    return ok(await createClinicAppointment(clinic.id, body.data), { status: 201 });
  } catch (e) {
    return handle(e);
  }
}

export async function PATCH(req: Request) {
  const auth = await apiAuth("clinic");
  if (auth.error) return auth.error;
  const body = await parseBody(req, appointmentUpdateSchema);
  if (body.error) return body.error;
  try {
    const clinic = await getClinicForUser(auth.user);
    const { id, ...patch } = body.data;
    return ok(await updateAppointment(clinic.id, id, patch));
  } catch (e) {
    return handle(e);
  }
}
