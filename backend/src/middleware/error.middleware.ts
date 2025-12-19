import { AppError } from '../utils/errors';
import type { ErrorHandler } from 'elysia';

/**
 * Global error handler for Elysia
 */
export const errorHandler: ErrorHandler = ({ error, code, set }) => {
  console.error('Error:', error);

  // Handle Elysia's built-in error codes (code is a string like 'NOT_FOUND', 'VALIDATION', etc.)
  if (code === 'NOT_FOUND') {
    set.status = 404;
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
    };
  }

  if (code === 'VALIDATION') {
    set.status = 400;
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error instanceof Error ? error.message : String(error),
      },
    };
  }

  // Handle custom AppError
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

  // Handle standard Error
  if (error instanceof Error) {
    // Check for validation error by name
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

    // Generic error
    set.status = 500;
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : error.message,
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
};
