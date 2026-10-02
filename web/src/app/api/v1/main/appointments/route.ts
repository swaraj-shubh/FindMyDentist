import { handle, ok, parseBody } from "@/lib/server/http";
import { cancelUserAppointment, createBooking, getUserAppointments } from "@/lib/server/services/booking-service";
import { apiAuth } from "@/lib/server/session";
import { bookingSchema, cancelSchema } from "@/lib/validations/booking";

export async function GET() {
  const auth = await apiAuth();
  if (auth.error) return auth.error;
  return ok(await getUserAppointments(auth.user.id));
}

export async function POST(req: Request) {
  const auth = await apiAuth();
  if (auth.error) return auth.error;
  const body = await parseBody(req, bookingSchema);
  if (body.error) return body.error;
  try {
    return ok(await createBooking(auth.user, body.data), { status: 201 });
  } catch (e) {
    return handle(e);
  }
}

export async function PATCH(req: Request) {
  const auth = await apiAuth();
  if (auth.error) return auth.error;
  const body = await parseBody(req, cancelSchema);
  if (body.error) return body.error;
  try {
    await cancelUserAppointment(auth.user, body.data.id);
    return ok(true);
  } catch (e) {
    return handle(e);
  }
}
