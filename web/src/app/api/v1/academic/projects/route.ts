import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok, parseBody } from "@/lib/server/http";
import { getSlides } from "@/lib/server/repositories/academic";
import { createProject, deleteProject, getProject, getQc, listProjects, updateProject } from "@/lib/server/services/academic-service";
import { apiAuth } from "@/lib/server/session";
import { projectSchema, projectUpdateSchema } from "@/lib/validations/academic";

export async function GET(req: NextRequest) {
  const auth = await apiAuth("academic");
  if (auth.error) return auth.error;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return ok(await listProjects(auth.user.id));
  try {
    const project = await getProject(auth.user, id);
    return ok({ project, slides: await getSlides(id), qc: await getQc(auth.user, id) });
  } catch (e) {
    return handle(e);
  }
}

export async function POST(req: Request) {
  const auth = await apiAuth("academic");
  if (auth.error) return auth.error;
  const body = await parseBody(req, projectSchema);
  if (body.error) return body.error;
  return ok(await createProject(auth.user, body.data), { status: 201 });
}

export async function PATCH(req: Request) {
  const auth = await apiAuth("academic");
  if (auth.error) return auth.error;
  const body = await parseBody(req, projectUpdateSchema);
  if (body.error) return body.error;
  try {
    const { id, ...patch } = body.data;
    return ok(await updateProject(auth.user, id, patch));
  } catch (e) {
    return handle(e);
  }
}

export async function DELETE(req: Request) {
  const auth = await apiAuth("academic");
  if (auth.error) return auth.error;
  const body = await parseBody(req, z.object({ id: z.string().min(1) }));
  if (body.error) return body.error;
  try {
    await deleteProject(auth.user, body.data.id);
    return ok(true);
  } catch (e) {
    return handle(e);
  }
}
