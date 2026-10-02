import type { NextRequest } from "next/server";
import { fail, handle } from "@/lib/server/http";
import { getSlides } from "@/lib/server/repositories/academic";
import { exportMarkdown, getProject } from "@/lib/server/services/academic-service";
import { apiAuth } from "@/lib/server/session";

// Markdown (slides + notes + references) and the structured slide JSON.
// ponytail: PPTX rendering is a separate engine in production (blueprint §10); not built here.
export async function GET(req: NextRequest) {
  const auth = await apiAuth("academic");
  if (auth.error) return auth.error;
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) return fail("projectId is required");
  try {
    if (req.nextUrl.searchParams.get("format") === "json") {
      const project = await getProject(auth.user, projectId);
      return new Response(JSON.stringify({ project, slides: await getSlides(projectId) }, null, 2), {
        headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="${project.id}-slides.json"` },
      });
    }
    const { filename, body } = await exportMarkdown(auth.user, projectId);
    return new Response(body, {
      headers: { "Content-Type": "text/markdown; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}"` },
    });
  } catch (e) {
    return handle(e);
  }
}
