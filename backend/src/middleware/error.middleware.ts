import type { Context } from 'hono';
import { AppError } from '../utils/errors';
import { error } from '../utils/response';

/**
 * Global error handler middleware
 */
export async function errorHandler(err: Error, c: Context) {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return error(c, err.code, err.message, err.statusCode, err.details);
  }

  // Unexpected errors
  return error(c, 'INTERNAL_ERROR', 'An unexpected error occurred', 500);
}
