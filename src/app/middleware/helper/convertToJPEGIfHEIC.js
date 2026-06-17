import sharp from "sharp";

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
