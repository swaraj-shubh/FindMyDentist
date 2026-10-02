import { handle, ok, parseBody } from "@/lib/server/http";
import { createBill, getClinicForUser, listBills, markBillPaid } from "@/lib/server/services/clinic-service";
import { apiAuth } from "@/lib/server/session";
import { billSchema, billUpdateSchema } from "@/lib/validations/clinic";

export async function GET() {
  const auth = await apiAuth("clinic");
  if (auth.error) return auth.error;
  const clinic = await getClinicForUser(auth.user);
  return ok(await listBills(clinic.id));
}

export async function POST(req: Request) {
  const auth = await apiAuth("clinic");
  if (auth.error) return auth.error;
  const body = await parseBody(req, billSchema);
  if (body.error) return body.error;
  try {
    const clinic = await getClinicForUser(auth.user);
    return ok(await createBill(clinic.id, body.data), { status: 201 });
  } catch (e) {
    return handle(e);
  }
}

export async function PATCH(req: Request) {
  const auth = await apiAuth("clinic");
  if (auth.error) return auth.error;
  const body = await parseBody(req, billUpdateSchema);
  if (body.error) return body.error;
  try {
    const clinic = await getClinicForUser(auth.user);
    return ok(await markBillPaid(clinic.id, body.data.id, body.data.paymentMethod));
  } catch (e) {
    return handle(e);
  }
}
