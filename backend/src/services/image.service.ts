import sharp from 'sharp';

export class ImageService {
  /**
   * Transforms an image to WebP format and ensures it's under the specified size limit.
   * @param buffer The image buffer to process
   * @param maxSizeKB The maximum size in KB (default 500)
   * @returns The processed image buffer and its mime type
   */
  static async transformToWebP(buffer: Buffer, maxSizeKB: number = 500): Promise<Buffer> {
    let quality = 80;
    let outputBuffer = await sharp(buffer)
      .webp({ quality })
      .toBuffer();

    // If still too large, reduce quality iteratively
    while (outputBuffer.length > maxSizeKB * 1024 && quality > 10) {
      quality -= 10;
      outputBuffer = await sharp(buffer)
        .webp({ quality })
        .toBuffer();
    }

    return outputBuffer;
  }
}
