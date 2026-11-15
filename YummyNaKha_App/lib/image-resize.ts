// Shrinks a menu photo in the browser before upload. Phone photos are often
// 4000+ px and several MB; text stays readable at 2400 px (the OCR service
// scales to 2000 px anyway), uploads are faster, and some hosts (Vercel) cap
// a request at 4.5 MB.

const MAX_SIDE = 2400;
/** Photos already this small (and within MAX_SIDE) are sent as they are. */
const KEEP_BELOW_BYTES = 2.5 * 1024 * 1024;

export async function prepareForUpload(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= KEEP_BELOW_BYTES) {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    // Can't decode here (old browser, unusual format): let the server decide.
    return file;
  }
}
