import { Elysia, t } from 'elysia';
import { sessionMiddleware } from '../middleware/session.middleware';
import { ImageService } from '../services/image.service';
import { StorageService } from '../services/storage.service';
import { Errors } from '../utils/errors';

import { type SessionContext } from '../middleware/session.middleware';

export const uploadRoutes = new Elysia({ prefix: '/upload' })
  .use(sessionMiddleware)
  .post('/image', async (ctx) => {
    const { body: { image }, userId } = ctx as unknown as SessionContext & { body: { image: File } };

    if (!image) {
      throw Errors.VALIDATION_ERROR({ image: 'Image file is required' });
    }

    try {
      console.log('Processing image upload for user:', userId);
      console.log('Image info:', {
        name: image.name,
        size: image.size,
        type: image.type
      });

      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Transform to WebP and optimize (max 500KB as requested)
      console.log('Transforming to WebP...');
      const processedBuffer = await ImageService.transformToWebP(buffer, 500);
      console.log('Transformation complete. New size:', processedBuffer.length);
      
      // Generate a unique filename
      const fileName = `uploads/${userId}-${Date.now()}.webp`;
      
      // Upload to R2
      const url = await StorageService.uploadFile(fileName, processedBuffer, 'image/webp');
      
      return { url };
    } catch (error: any) {
      console.error('Upload error:', error);
      // If it's already an AppError, rethrow it
      if (error.code && error.statusCode) throw error;
      
      // Otherwise wrap it or throw as is for the global error handler
      throw error;
    }
  }, {
    body: t.Object({
      image: t.File()
    })
  });
