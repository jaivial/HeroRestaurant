export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Predefined errors
export const Errors = {
  // Authentication errors
  AUTH_MISSING_CREDENTIALS: new AppError('AUTH_MISSING_CREDENTIALS', 'Email or password not provided', 400),
  AUTH_INVALID_CREDENTIALS: new AppError('AUTH_INVALID_CREDENTIALS', 'Invalid email or password', 401),
  AUTH_ACCOUNT_LOCKED: new AppError('AUTH_ACCOUNT_LOCKED', 'Account temporarily locked due to failed attempts', 403),
  AUTH_ACCOUNT_DISABLED: new AppError('AUTH_ACCOUNT_DISABLED', 'Account has been disabled', 403),
  AUTH_EMAIL_NOT_VERIFIED: new AppError('AUTH_EMAIL_NOT_VERIFIED', 'Email verification required', 403),

  // Session errors
  SESSION_REQUIRED: new AppError('SESSION_REQUIRED', 'No session ID provided', 401),
  SESSION_INVALID: new AppError('SESSION_INVALID', 'Session ID not found or malformed', 401),
  SESSION_EXPIRED: new AppError('SESSION_EXPIRED', 'Session has expired', 401),
  SESSION_REVOKED: new AppError('SESSION_REVOKED', 'Session was revoked', 401),

  // Permission errors
  PERMISSION_DENIED: new AppError('PERMISSION_DENIED', 'You do not have permission to perform this action', 403),
  RESTAURANT_ACCESS_DENIED: new AppError('RESTAURANT_ACCESS_DENIED', 'You are not a member of this restaurant', 403),

  // Rate limiting
  RATE_LIMITED: new AppError('RATE_LIMITED', 'Too many requests, please try again later', 429),

  // Generic errors
  UNAUTHORIZED: new AppError('UNAUTHORIZED', 'Authentication required', 401),
  FORBIDDEN: new AppError('FORBIDDEN', 'Access denied', 403),
  FORBIDDEN_CUSTOM: (message: string) => new AppError('FORBIDDEN', message, 403),
  NOT_FOUND: (resource: string) => new AppError('NOT_FOUND', `${resource} not found`, 404),
  VALIDATION_ERROR: (details: Record<string, unknown>) =>
    new AppError('VALIDATION_ERROR', 'Validation failed', 400, details),
  CONFLICT: (message: string) => new AppError('CONFLICT', message, 409),
  INTERNAL_ERROR: new AppError('INTERNAL_ERROR', 'An unexpected error occurred', 500),
};
