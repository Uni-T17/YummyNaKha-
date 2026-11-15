import "server-only";

// Reads a photo's pixel size from its file header (JPEG, PNG, WebP), without
// decoding it. Used to place OCR boxes on the photo the diner sees.

export interface ImageSize {
  width: number;
  height: number;
}

function jpegSize(b: Uint8Array): ImageSize | null {
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) return null;
    const marker = b[i + 1];
    const length = (b[i + 2] << 8) | b[i + 3];
    // Start-of-frame markers (not DHT 0xC4, JPG 0xC8 or DAC 0xCC) hold the size.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: (b[i + 5] << 8) | b[i + 6], width: (b[i + 7] << 8) | b[i + 8] };
    }
    i += 2 + length;
  }
  return null;
}

function pngSize(b: Uint8Array): ImageSize | null {
  if (b.length < 24) return null;
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

function webpSize(b: Uint8Array): ImageSize | null {
  if (b.length < 30) return null;
  const chunk = String.fromCharCode(...b.slice(12, 16));
  if (chunk === "VP8X") return { width: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), height: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)) };
  if (chunk === "VP8 ") return { width: (b[26] | (b[27] << 8)) & 0x3fff, height: (b[28] | (b[29] << 8)) & 0x3fff };
  if (chunk === "VP8L") {
    const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}

export function imageSize(data: Uint8Array, mimeType: string): ImageSize | null {
  try {
    const size = mimeType === "image/jpeg" ? jpegSize(data) : mimeType === "image/png" ? pngSize(data) : mimeType === "image/webp" ? webpSize(data) : null;
    return size && size.width > 0 && size.height > 0 ? size : null;
  } catch {
    return null;
  }
}
