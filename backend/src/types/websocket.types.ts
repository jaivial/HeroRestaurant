import { z } from 'zod';

// ============================================================================
// Protocol Constants
// ============================================================================

export const WS_PROTOCOL_VERSION = '1.0.0';
export const WS_HEARTBEAT_INTERVAL_MS = 30000;
export const WS_HEARTBEAT_TIMEOUT_MS = 10000;
export const WS_MAX_PAYLOAD_SIZE = 65536;

// ============================================================================
// Message Categories & Actions
// ============================================================================

export type WSMessageCategory =
  | 'auth'
  | 'user'
  | 'restaurant'
  | 'member'
  | 'session'
  | 'system';

export type AuthAction =
  | 'register'
  | 'login'
  | 'logout'
  | 'logout-all'
  | 'me'
  | 'authenticate';

export type SessionAction = 'list' | 'revoke';

export type UserAction = 'get' | 'update';

export type RestaurantAction =
  | 'create'
  | 'list'
  | 'get'
  | 'update'
  | 'delete';

export type MemberAction =
  | 'list'
  | 'invite'
  | 'update'
  | 'remove';

export type SystemAction = 'ping' | 'pong';

// ============================================================================
// Base Message Types
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

export interface WSEvent<T = unknown> {
  id: string;
  type: 'event';
  category: WSMessageCategory;
  event: string;
  payload: T;
  timestamp: string;
  resourceId?: string;
  restaurantId?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export interface WSError {
  code: WSErrorCode;
  message: string;
  details?: Record<string, unknown>;
  validationErrors?: Record<string, string[]>;
}

export type WSErrorCode =
  // Authentication errors
  | 'AUTH_MISSING_CREDENTIALS'
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_ACCOUNT_LOCKED'
  | 'AUTH_ACCOUNT_DISABLED'
  | 'AUTH_EMAIL_NOT_VERIFIED'
  // Session errors
  | 'SESSION_REQUIRED'
  | 'SESSION_INVALID'
  | 'SESSION_EXPIRED'
  | 'SESSION_REVOKED'
  | 'WS_NOT_AUTHENTICATED'
  // Permission errors
  | 'PERMISSION_DENIED'
  | 'RESTAURANT_ACCESS_DENIED'
  | 'FORBIDDEN'
  // Validation errors
  | 'VALIDATION_ERROR'
  | 'INVALID_MESSAGE_FORMAT'
  | 'UNKNOWN_ACTION'
  // Resource errors
  | 'NOT_FOUND'
  | 'CONFLICT'
  // Rate limiting
  | 'RATE_LIMITED'
  // System errors
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';

// ============================================================================
// System Messages
// ============================================================================

export interface WSPing {
  id: string;
  type: 'request';
  category: 'system';
  action: 'ping';
  payload: { clientTime: string };
  timestamp: string;
}

export interface WSPong {
  id: string;
  type: 'response';
  requestId: string;
  success: true;
  data: {
    pingId: string;
    serverTime: string;
    clientTime: string;
  };
  timestamp: string;
}

// ============================================================================
// Auth Request Payloads
// ============================================================================

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  deviceInfo?: string;
}

export interface AuthenticatePayload {
  sessionToken: string;
  deviceInfo?: string;
}

// ============================================================================
// Session Request Payloads
// ============================================================================

export interface SessionRevokePayload {
  sessionId: string;
}

// ============================================================================
// User Request Payloads
// ============================================================================

export interface UserUpdatePayload {
  name?: string;
  avatarUrl?: string | null;
  phone?: string | null;
}

// ============================================================================
// Restaurant Request Payloads
// ============================================================================

export interface RestaurantCreatePayload {
  name: string;
  slug?: string;
  description?: string;
  timezone?: string;
  currency?: string;
}

export interface RestaurantGetPayload {
  restaurantId: string;
}

export interface RestaurantUpdatePayload {
  restaurantId: string;
  name?: string;
  description?: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  timezone?: string;
  currency?: string;
}

export interface RestaurantDeletePayload {
  restaurantId: string;
}

// ============================================================================
// Member Request Payloads
// ============================================================================

export interface MemberListPayload {
  restaurantId: string;
}

export interface MemberInvitePayload {
  restaurantId: string;
  email: string;
  roleId?: string;
}

export interface MemberUpdatePayload {
  restaurantId: string;
  memberId: string;
  roleId?: string;
  accessFlags?: string;
  status?: 'active' | 'suspended';
}

export interface MemberRemovePayload {
  restaurantId: string;
  memberId: string;
}

// ============================================================================
// Server Push Event Types
// ============================================================================

export type AuthEvent = 'session-expired' | 'force-logout';

export interface SessionExpiredEventPayload {
  reason: 'expired' | 'revoked' | 'password_changed' | 'security';
  message: string;
}

export interface ForceLogoutEventPayload {
  reason: 'admin_action' | 'security' | 'account_disabled';
  message: string;
}

// ============================================================================
// Connection State Types
// ============================================================================

export type WSConnectionState =
  | 'connected'
  | 'authenticated';

export interface ConnectionData {
  connectionId: string;
  connectedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  sessionId: string | null;
  userId: string | null;
  globalFlags: bigint;
  currentRestaurantId: string | null;
  subscriptions: Set<string>;
  messageCount: number;
  windowStart: number;
  lastPingAt: number | null;
}

// ============================================================================
// Zod Validation Schemas
// ============================================================================

export const wsRequestSchema = z.object({
  id: z.string().min(1),
  type: z.literal('request'),
  category: z.enum(['auth', 'user', 'restaurant', 'member', 'session', 'system']),
  action: z.string().min(1),
  payload: z.unknown(),
  timestamp: z.string(),
});

export const registerPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export const loginPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  deviceInfo: z.string().optional(),
});

export const authenticatePayloadSchema = z.object({
  sessionToken: z.string().min(1),
  deviceInfo: z.string().optional(),
});

export const sessionRevokePayloadSchema = z.object({
  sessionId: z.string().min(1),
});

export const userUpdatePayloadSchema = z.object({
  name: z.string().min(1).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  phone: z.string().nullable().optional(),
});

export const restaurantCreatePayloadSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
});

export const restaurantGetPayloadSchema = z.object({
  restaurantId: z.string().min(1),
});

export const restaurantUpdatePayloadSchema = z.object({
  restaurantId: z.string().min(1),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  logoUrl: z.string().url().nullable().optional(),
  coverUrl: z.string().url().nullable().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
});

export const restaurantDeletePayloadSchema = z.object({
  restaurantId: z.string().min(1),
});

export const memberListPayloadSchema = z.object({
  restaurantId: z.string().min(1),
});

export const memberInvitePayloadSchema = z.object({
  restaurantId: z.string().min(1),
  email: z.string().email(),
  roleId: z.string().optional(),
});

export const memberUpdatePayloadSchema = z.object({
  restaurantId: z.string().min(1),
  memberId: z.string().min(1),
  roleId: z.string().optional(),
  accessFlags: z.string().optional(),
  status: z.enum(['active', 'suspended']).optional(),
});

export const memberRemovePayloadSchema = z.object({
  restaurantId: z.string().min(1),
  memberId: z.string().min(1),
});

export const pingPayloadSchema = z.object({
  clientTime: z.string(),
});

// ============================================================================
// Public Actions (no auth required)
// ============================================================================

export const PUBLIC_ACTIONS = new Set([
  'auth.register',
  'auth.login',
  'auth.authenticate',
  'system.ping',
]);

// ============================================================================
// Action to Schema Map
// ============================================================================

export const actionSchemaMap: Record<string, z.ZodSchema> = {
  'auth.register': registerPayloadSchema,
  'auth.login': loginPayloadSchema,
  'auth.authenticate': authenticatePayloadSchema,
  'auth.logout': z.object({}),
  'auth.logout-all': z.object({}),
  'auth.me': z.object({}),
  'session.list': z.object({}),
  'session.revoke': sessionRevokePayloadSchema,
  'user.get': z.object({}),
  'user.update': userUpdatePayloadSchema,
  'restaurant.create': restaurantCreatePayloadSchema,
  'restaurant.list': z.object({}),
  'restaurant.get': restaurantGetPayloadSchema,
  'restaurant.update': restaurantUpdatePayloadSchema,
  'restaurant.delete': restaurantDeletePayloadSchema,
  'member.list': memberListPayloadSchema,
  'member.invite': memberInvitePayloadSchema,
  'member.update': memberUpdatePayloadSchema,
  'member.remove': memberRemovePayloadSchema,
  'system.ping': pingPayloadSchema,
};

// ============================================================================
// Helper Functions
// ============================================================================

export function createSuccessResponse<T>(
  requestId: string,
  data: T
): WSSuccessResponse<T> {
  return {
    id: crypto.randomUUID(),
    type: 'response',
    requestId,
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(
  requestId: string,
  code: WSErrorCode,
  message: string,
  details?: Record<string, unknown>
): WSErrorResponse {
  return {
    id: crypto.randomUUID(),
    type: 'error',
    requestId,
    success: false,
    error: { code, message, details },
    timestamp: new Date().toISOString(),
  };
}

export function createEvent<T>(
  category: WSMessageCategory,
  event: string,
  payload: T,
  options?: { resourceId?: string; restaurantId?: string }
): WSEvent<T> {
  return {
    id: crypto.randomUUID(),
    type: 'event',
    category,
    event,
    payload,
    timestamp: new Date().toISOString(),
    ...options,
  };
}

export function createPongResponse(
  requestId: string,
  pingId: string,
  clientTime: string
): WSPong {
  return {
    id: crypto.randomUUID(),
    type: 'response',
    requestId,
    success: true,
    data: {
      pingId,
      serverTime: new Date().toISOString(),
      clientTime,
    },
    timestamp: new Date().toISOString(),
  };
}
