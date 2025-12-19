import type { Context } from 'hono';

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

export function success<T>(c: Context, data: T, meta?: SuccessResponse<T>['meta']) {
  return c.json({ success: true, data, meta } as SuccessResponse<T>, 200);
}

export function created<T>(c: Context, data: T) {
  return c.json({ success: true, data } as SuccessResponse<T>, 201);
}

export function noContent(c: Context) {
  return c.body(null, 204);
}

export function error(c: Context, code: string, message: string, statusCode: number = 500, details?: Record<string, unknown>) {
  return c.json({
    success: false,
    error: { code, message, details },
  } as ErrorResponse, statusCode);
}

export function notFound(c: Context, message: string = 'Resource not found') {
  return error(c, 'NOT_FOUND', message, 404);
}

export function unauthorized(c: Context, message: string = 'Authentication required') {
  return error(c, 'UNAUTHORIZED', message, 401);
}

export function forbidden(c: Context, message: string = 'Access denied') {
  return error(c, 'FORBIDDEN', message, 403);
}

export function badRequest(c: Context, message: string, details?: Record<string, unknown>) {
  return error(c, 'BAD_REQUEST', message, 400, details);
}

export function paginated<T>(
  c: Context,
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  return c.json({
    success: true,
    data,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  }, 200);
}
