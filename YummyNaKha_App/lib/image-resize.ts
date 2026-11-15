// Shrinks a menu photo in the browser before upload. Phone photos are often
// 4000+ px and several MB; menu text stays readable at 2000 px (our own OCR
// service scales to that anyway). The result is kept under 1 MB because the
// OCR.space free tier rejects larger photos, and Vercel caps a request at 4.5 MB.

const MAX_SIDE = 2000;
const MAX_BYTES = 950 * 1024;
const KEEP_TYPES = ["image/jpeg", "image/png"];

function toJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

export async function prepareForUpload(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    let scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= MAX_BYTES && KEEP_TYPES.includes(file.type)) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement("canvas");
    let blob: Blob | null = null;
    // Lower the quality first, then the size, until the photo fits.
    for (let attempt = 0; attempt < 6; attempt++) {
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.85, 0.72, 0.6]) {
        blob = await toJpeg(canvas, quality);
        if (blob && blob.size <= MAX_BYTES) break;
      }
      if (blob && blob.size <= MAX_BYTES) break;
      scale *= 0.8;
    }
    bitmap.close();
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    // Can't decode here (old browser, unusual format): let the server decide.
    return file;
  }
}
