import { requireUser } from "@/lib/server/auth/current-user";
import { json, parseValue, route } from "@/lib/server/http";
import { deleteOwnedImage, getOwnedImage } from "@/lib/server/images/service";
import { idSchema } from "@/lib/server/validation/ai";

type Context = { params: Promise<{ id: string }> };

/** GET /api/images/:id — a photo's processing status and text (owner only). */
export const GET = route<Context>(async (_request, { params }) => {
  const user = await requireUser();
  const id = parseValue((await params).id, idSchema);
  return json({ image: await getOwnedImage(user.id, id) });
});

/** DELETE /api/images/:id — remove a photo and its extracted text. */
export const DELETE = route<Context>(async (_request, { params }) => {
  const user = await requireUser();
  const id = parseValue((await params).id, idSchema);
  await deleteOwnedImage(user.id, id);
  return new Response(null, { status: 204 });
});
