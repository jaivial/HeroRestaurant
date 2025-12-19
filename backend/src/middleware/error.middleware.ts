import { AppError } from '../utils/errors';

/**
 * Global error handler for Elysia
 */
export function errorHandler({ error, set }: { error: Error; set: any }) {
  console.error('Error:', error);

  if (error instanceof AppError) {
    set.status = error.statusCode;
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
      },
    };
  }

  // Handle Elysia validation errors
  if (error.name === 'ValidationError') {
    set.status = 400;
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.message,
      },
    };
  }

  // Default error response
  set.status = 500;
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  };
}
