import { requireUser } from "@/lib/server/auth/current-user";
import { errors, HttpError, json, route } from "@/lib/server/http";
import { createMenuImage, MAX_IMAGE_BYTES } from "@/lib/server/images/service";

/** POST /api/images — upload one menu photo (multipart/form-data, field `file`). */
export const POST = route(async (request) => {
  const user = await requireUser();

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_IMAGE_BYTES + 64 * 1024) {
    throw new HttpError(413, "PAYLOAD_TOO_LARGE", `Use a photo under ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw errors.badRequest("Upload the photo as multipart/form-data.");
  }

  const image = await createMenuImage(user.id, form.get("file"));
  return json({ image }, { status: 201 });
});
