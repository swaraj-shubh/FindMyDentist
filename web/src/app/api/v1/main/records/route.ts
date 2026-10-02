import { ok } from "@/lib/server/http";
import { getUserRecords, getUserTreatments } from "@/lib/server/services/records-service";
import { apiAuth } from "@/lib/server/session";

export async function GET() {
  const auth = await apiAuth();
  if (auth.error) return auth.error;
  const [records, treatments] = await Promise.all([getUserRecords(auth.user.id), getUserTreatments(auth.user.id)]);
  return ok({ records, treatments });
}
