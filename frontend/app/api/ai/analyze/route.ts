import { analyzeMenu } from "@/lib/server/ai/analyze-menu";
import { requireUser } from "@/lib/server/auth/current-user";
import { json, parseJson, route } from "@/lib/server/http";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { analyzeSchema } from "@/lib/server/validation/ai";

export const maxDuration = 300;

/**
 * POST /api/ai/analyze — "Find My Food".
 * Body: { imageIds: string[] }. The user and their preferences come from the session, never the body.
 */
export const POST = route(async (request) => {
  const user = await requireUser();
  const { imageIds } = await parseJson(request, analyzeSchema);
  rateLimit(`ai:${user.id}:${clientIp(request)}`, 30, 60 * 60 * 1000);
  return json(await analyzeMenu(user.id, imageIds));
});
