import { z } from 'zod';

// ============================================================================
// Protocol Constants
// ============================================================================

export const WS_PROTOCOL_VERSION = '1.0.0';
export const WS_HEARTBEAT_INTERVAL_MS = 30000;
export const WS_HEARTBEAT_TIMEOUT_MS = 10000;
export const WS_MAX_PAYLOAD_SIZE = 10 * 1024 * 1024; // 10MB

// ============================================================================
// Message Categories & Actions
// ============================================================================

export const WS_MESSAGE_CATEGORIES = [
  'auth',
  'user',
  'restaurant',
  'member',
  'role',
  'session',
  'menu',
  'dish',
  'section',
  'settings',
  'shift',
  'preference',
  'system',
] as const;

export type WSMessageCategory = (typeof WS_MESSAGE_CATEGORIES)[number];

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
  | 'delete'
  | 'select';

export type MemberAction =
  | 'list'
  | 'invite'
  | 'update'
  | 'remove';

export type RoleAction =
  | 'list'
  | 'create'
  | 'update'
  | 'delete';

export type SystemAction = 'ping' | 'pong';

export type ShiftAction = 
  | 'punch'
  | 'get_status'
  | 'get_personal_stats'
  | 'get_team_stats'
  | 'get_scheduled_shifts'
  | 'assign'
  | 'remove_scheduled'
  | 'update_scheduled';

export type PreferenceAction = 'get' | 'set';

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
  websiteUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  primaryColor?: string;
  defaultLanguage?: string;
  defaultTaxRate?: number;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  settings?: {
    openingHours?: OpeningHour[];
    mealSchedules?: MealSchedules;
  };
}

export interface OpeningHour {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface MealSchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface MealSchedules {
  breakfast: MealSchedule;
  brunch: MealSchedule;
  lunch: MealSchedule;
  merienda: MealSchedule;
  dinner: MealSchedule;
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
// Role Request Payloads
// ============================================================================

export interface RoleListPayload {
  restaurantId: string;
}

export interface RoleCreatePayload {
  restaurantId: string;
  name: string;
  description?: string;
  permissions: string; // bigint as string
  displayOrder: number;
  color?: string;
}

export interface RoleUpdatePayload {
  restaurantId: string;
  roleId: string;
  name?: string;
  description?: string;
  permissions?: string; // bigint as string
  displayOrder?: number;
  color?: string;
}

export interface RoleDeletePayload {
  restaurantId: string;
  roleId: string;
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
  id: z.string(),
  type: z.literal('request'),
  category: z.enum(WS_MESSAGE_CATEGORIES),
  action: z.string(),
  payload: z.any(),
  timestamp: z.string().optional(),
});

// ============================================================================
// Menu Creator Payloads
// ============================================================================

export const menuCreatePayloadSchema = z.object({
  restaurantId: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(['fixed_price', 'open_menu']),
  price: z.number().nullable().optional(),
  drinkIncluded: z.boolean().optional(),
  coffeeIncluded: z.boolean().optional(),
  availability: z.record(z.array(z.string())).optional(),
});

export const menuUpdatePayloadSchema = z.object({
  menuId: z.string().min(1),
  title: z.string().min(1).optional(),
  price: z.number().nullable().optional(),
  isActive: z.boolean().optional(),
  drinkIncluded: z.boolean().optional(),
  coffeeIncluded: z.boolean().optional(),
  availability: z.record(z.array(z.string())).optional(),
});

export const sectionCreatePayloadSchema = z.object({
  menuId: z.string().min(1),
  menuType: z.enum(['fixed', 'open']),
  name: z.string().min(1),
  displayOrder: z.number().optional(),
});

export const dishCreatePayloadSchema = z.object({
  sectionId: z.string().min(1),
  menuId: z.string().min(1),
  menuType: z.enum(['fixed', 'open']),
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url().nullable().optional(),
  showImage: z.boolean().optional(),
  showDescription: z.boolean().optional(),
  openModal: z.boolean().optional(),
  hasSupplement: z.boolean().optional(),
  supplementPrice: z.number().nullable().optional(),
  allergens: z.array(z.string()),
  displayOrder: z.number().optional(),
});

export const settingsUpdatePayloadSchema = z.object({
  restaurantId: z.string().min(1),
  openingDays: z.array(z.string()).optional(),
  mealSchedules: z.record(z.boolean()).optional(),
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
  websiteUrl: z.string().url().nullable().optional(),
  instagramUrl: z.string().url().nullable().optional(),
  facebookUrl: z.string().url().nullable().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  defaultLanguage: z.string().min(2).optional(),
  defaultTaxRate: z.number().min(0).optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  contactEmail: z.string().email().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  settings: z.object({
    openingHours: z.array(z.object({
      day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
      isOpen: z.boolean(),
      openTime: z.string(),
      closeTime: z.string(),
    })).optional(),
    mealSchedules: z.object({
      breakfast: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }),
      brunch: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }),
      lunch: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }),
      merienda: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }),
      dinner: z.object({ enabled: z.boolean(), startTime: z.string(), endTime: z.string() }),
    }).optional(),
  }).optional(),
});

export const restaurantDeletePayloadSchema = z.object({
  restaurantId: z.string().min(1),
});

export const restaurantSelectPayloadSchema = z.object({
  restaurantId: z.string().min(1).nullable(),
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

export const roleListPayloadSchema = z.object({
  restaurantId: z.string().min(1),
});

export const roleCreatePayloadSchema = z.object({
  restaurantId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  permissions: z.string(),
  displayOrder: z.number().int().min(0),
  color: z.string().optional(),
});

export const roleUpdatePayloadSchema = z.object({
  restaurantId: z.string().min(1),
  roleId: z.string().min(1),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  permissions: z.string().optional(),
  displayOrder: z.number().int().min(0).optional(),
  color: z.string().optional(),
});

export const roleDeletePayloadSchema = z.object({
  restaurantId: z.string().min(1),
  roleId: z.string().min(1),
});

export const pingPayloadSchema = z.object({
  clientTime: z.string(),
});

export const shiftPunchPayloadSchema = z.object({
  restaurantId: z.string().min(1),
  action: z.enum(['in', 'out']),
  notes: z.string().optional(),
});

export const shiftGetStatusPayloadSchema = z.object({
  restaurantId: z.string().min(1),
});

export const shiftGetPersonalStatsPayloadSchema = z.object({
  restaurantId: z.string().min(1),
  period: z.enum(['daily', 'weekly', 'monthly', 'trimestral', 'semmestral', 'anual']),
  offset: z.number().optional(),
});

export const shiftGetTeamStatsPayloadSchema = z.object({
  restaurantId: z.string().min(1),
});

export const shiftGetScheduledShiftsPayloadSchema = z.object({
  restaurantId: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
});

export const shiftAssignPayloadSchema = z.object({
  restaurantId: z.string().min(1),
  shiftData: z.object({
    membership_id: z.string().min(1),
    start_at: z.string(),
    end_at: z.string(),
    notes: z.string().optional(),
    color: z.string().optional(),
    label: z.string().optional(),
  }),
});

export const shiftRemoveScheduledPayloadSchema = z.object({
  restaurantId: z.string().min(1),
  shiftId: z.string().min(1),
});

export const shiftUpdateScheduledPayloadSchema = z.object({
  restaurantId: z.string().min(1),
  shiftId: z.string().min(1),
  shiftData: z.object({
    membership_id: z.string().optional(),
    start_at: z.string().optional(),
    end_at: z.string().optional(),
    notes: z.string().optional(),
    color: z.string().optional(),
    label: z.string().optional(),
  }),
});

export const preferenceGetPayloadSchema = z.object({
  restaurantId: z.string().min(1),
});

export const preferenceSetPayloadSchema = z.object({
  restaurantId: z.string().min(1),
  key: z.string().min(1),
  value: z.any(),
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
  'restaurant.select': restaurantSelectPayloadSchema,
  'member.list': memberListPayloadSchema,
  'member.invite': memberInvitePayloadSchema,
  'member.update': memberUpdatePayloadSchema,
  'member.remove': memberRemovePayloadSchema,
  'role.list': roleListPayloadSchema,
  'role.create': roleCreatePayloadSchema,
  'role.update': roleUpdatePayloadSchema,
  'role.delete': roleDeletePayloadSchema,
  // Menu Creator actions
  'menu.create': menuCreatePayloadSchema,
  'menu.list': z.object({ restaurantId: z.string().min(1) }),
  'menu.get': z.object({ menuId: z.string().min(1) }),
  'menu.update': menuUpdatePayloadSchema,
  'menu.delete': z.object({ menuId: z.string().min(1) }),
  'section.create': sectionCreatePayloadSchema,
  'section.update': z.object({ sectionId: z.string().min(1), name: z.string().optional(), displayOrder: z.number().optional() }),
  'section.delete': z.object({ sectionId: z.string().min(1) }),
  'dish.create': dishCreatePayloadSchema,
  'dish.update': z.object({ dishId: z.string().min(1) }).passthrough(),
  'dish.delete': z.object({ dishId: z.string().min(1) }),
  'dish.reorder': z.object({ dishes: z.array(z.object({ id: z.string(), displayOrder: z.number() })) }),
  'dish.uploadImage': z.object({
    image: z.string(), // Base64 string
    fileName: z.string().optional().nullable(),
    contentType: z.string().optional().nullable(),
  }),
  'settings.get': z.object({ restaurantId: z.string().min(1) }),
  'settings.update': settingsUpdatePayloadSchema,
  'system.ping': pingPayloadSchema,
  'shift.punch': shiftPunchPayloadSchema,
  'shift.get_status': shiftGetStatusPayloadSchema,
  'shift.get_personal_stats': shiftGetPersonalStatsPayloadSchema,
  'shift.get_team_stats': shiftGetTeamStatsPayloadSchema,
  'shift.get_scheduled_shifts': shiftGetScheduledShiftsPayloadSchema,
  'shift.assign': shiftAssignPayloadSchema,
  'shift.remove_scheduled': shiftRemoveScheduledPayloadSchema,
  'shift.update_scheduled': shiftUpdateScheduledPayloadSchema,
  'preference.get': preferenceGetPayloadSchema,
  'preference.set': preferenceSetPayloadSchema,
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
