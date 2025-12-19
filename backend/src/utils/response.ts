/**
 * Response helpers for Elysia routes
 * These return plain objects - Elysia handles JSON serialization automatically
 */

interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    pages?: number;
  };
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export function success<T>(data: T, meta?: SuccessResponse<T>['meta']): SuccessResponse<T> {
  return { success: true, data, meta };
}

export function successWithMeta<T>(
  data: T,
  page: number,
  limit: number,
  total: number
): SuccessResponse<T> {
  return {
    success: true,
    data,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export function error(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ErrorResponse {
  return {
    success: false,
    error: { code, message, details },
  };
}

export function notFound(message: string = 'Resource not found'): ErrorResponse {
  return error('NOT_FOUND', message);
}

export function unauthorized(message: string = 'Authentication required'): ErrorResponse {
  return error('UNAUTHORIZED', message);
}

export function forbidden(message: string = 'Access denied'): ErrorResponse {
  return error('FORBIDDEN', message);
}

export function badRequest(message: string, details?: Record<string, unknown>): ErrorResponse {
  return error('BAD_REQUEST', message, details);
}

export function validationError(details: Record<string, string[]>): ErrorResponse {
  return error('VALIDATION_ERROR', 'Invalid request body', details);
}
