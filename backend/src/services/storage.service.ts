import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';

export class StorageService {
  private static client = new S3Client({
    region: 'auto',
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });

  /**
   * Uploads a file to R2 bucket.
   * @param fileName The name of the file to save as
   * @param body The file content (Buffer)
   * @param contentType The MIME type of the file
   * @returns The public URL of the uploaded file
   */
  static async uploadFile(fileName: string, body: Buffer, contentType: string): Promise<string> {
    console.log('Uploading to R2:', { fileName, bucket: env.R2_BUCKET_NAME, contentType });
    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: fileName,
      Body: body,
      ContentType: contentType,
    });

    try {
      await this.client.send(command);
      console.log('R2 upload successful');
    } catch (error) {
      console.error('R2 upload failed:', error);
      throw error;
    }

    // Construct public URL
    // Public URL format: R2_PUBLIC_URL/fileName
    return `${env.R2_PUBLIC_URL}/${fileName}`;
  }
}
