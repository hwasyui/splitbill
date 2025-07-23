// lib/convertToJPEGIfHEIC.js
import sharp from "sharp";

/**
 * Convert HEIC/HEIF image to JPEG.
 * If not HEIC, return original buffer and type.
 */
export async function convertToJPEGIfHEIC(buffer, mimeType) {
  if (mimeType === "image/heic" || mimeType === "image/heif") {
    const jpegBuffer = await sharp(buffer).jpeg().toBuffer();
    return {
      buffer: jpegBuffer,
      mimeType: "image/jpeg"
    };
  }

  return {
    buffer,
    mimeType
  };
}
