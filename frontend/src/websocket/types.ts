// ============================================================================
// WebSocket Message Types (Client-side)
// ============================================================================

export type WSMessageCategory =
  | 'auth'
  | 'user'
  | 'restaurant'
  | 'member'
  | 'role'
  | 'session'
  | 'menu'
  | 'dish'
  | 'section'
  | 'settings'
  | 'shift'
  | 'system';

// ============================================================================
// Request/Response Types
// ============================================================================

export interface WSRequest<T = unknown> {
  id: string;
  type: 'request';
  category: WSMessageCategory;
  action: string;
  payload: T;
  timestamp: string;
}

export interface WSSuccessResponse<T = unknown> {
  id: string;
  type: 'response';
  requestId: string;
  success: true;
  data: T;
  timestamp: string;
}

export interface WSErrorResponse {
  id: string;
  type: 'error';
  requestId: string;
  success: false;
  error: WSError;
  timestamp: string;
}

export type WSResponse<T = unknown> = WSSuccessResponse<T> | WSErrorResponse;

export interface WSError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Server Push Event Types
// ============================================================================

export interface WSEvent<T = unknown> {
  id: string;
  type: 'event';
  category: WSMessageCategory;
  event: string;
  payload: T;
  timestamp: string;
}

// ============================================================================
// Auth Response Types
// ============================================================================

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  globalFlags: string;
}

export interface SessionDTO {
  id: string;
  expiresAt: string;
}

export interface RestaurantMinimalDTO {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  accessFlags: string;
}

export interface LoginResponseData {
  user: UserDTO;
  session: SessionDTO;
  restaurants: RestaurantMinimalDTO[];
}

export interface AuthenticateResponseData {
  user: UserDTO;
  session: {
    expiresAt: string;
    createdAt: string;
  };
  restaurants: RestaurantMinimalDTO[];
}

export interface MeResponseData {
  user: UserDTO;
  session: {
    expiresAt: string;
    createdAt: string;
  };
}

// ============================================================================
// Session Event Types
// ============================================================================

export interface SessionExpiredPayload {
  reason: 'expired' | 'revoked' | 'password_changed' | 'security';
  message: string;
}
