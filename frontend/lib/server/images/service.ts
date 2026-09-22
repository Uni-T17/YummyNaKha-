import "server-only";
import { prisma } from "../db";
import { errors, HttpError } from "../http";

// Menu photo intake: validation (declared type, real file signature, size)
// and ownership-scoped access. Another user's image is reported as 404 so IDs
// can't be probed.

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_IMAGES_PER_USER = 50;

type AllowedType = "image/jpeg" | "image/png" | "image/webp";

/** Detects the real image type from magic bytes instead of trusting the upload. */
function sniffType(bytes: Uint8Array): AllowedType | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  if (riff === "RIFF" && webp === "WEBP") return "image/webp";
  return null;
}

export async function validateImageFile(file: unknown) {
  if (!(file instanceof File)) throw errors.badRequest("Attach a menu photo in the `file` field.");
  if (file.size === 0) throw errors.badRequest("The photo is empty.");
  if (file.size > MAX_IMAGE_BYTES) {
    throw new HttpError(413, "PAYLOAD_TOO_LARGE", `Use a photo under ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`);
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = sniffType(bytes);
  if (!mimeType) {
    throw new HttpError(415, "UNSUPPORTED_MEDIA_TYPE", "Use a JPG, PNG or WebP photo.");
  }
  const fileName = (file.name || "menu-photo").replace(/[^\p{L}\p{N}._ -]/gu, "_").slice(0, 120);
  return { bytes, mimeType, fileName };
}

export async function createMenuImage(userId: string, file: unknown) {
  const count = await prisma.menuImage.count({ where: { userId } });
  if (count >= MAX_IMAGES_PER_USER) throw errors.conflict("You have too many saved photos. Remove some and try again.");
  const { bytes, mimeType, fileName } = await validateImageFile(file);
  return prisma.menuImage.create({
    data: { userId, fileName, mimeType, sizeBytes: bytes.byteLength, data: bytes },
    select: publicImageSelect,
  });
}

/** Everything safe to return to the owner (never the raw bytes). */
export const publicImageSelect = {
  id: true,
  fileName: true,
  mimeType: true,
  sizeBytes: true,
  status: true,
  extractedText: true,
  translatedText: true,
  error: true,
  processedAt: true,
  createdAt: true,
} as const;

export async function getOwnedImage(userId: string, id: string) {
  const image = await prisma.menuImage.findFirst({ where: { id, userId }, select: publicImageSelect });
  if (!image) throw errors.notFound("Menu photo not found.");
  return image;
}

export async function deleteOwnedImage(userId: string, id: string) {
  const { count } = await prisma.menuImage.deleteMany({ where: { id, userId } });
  if (count === 0) throw errors.notFound("Menu photo not found.");
}
