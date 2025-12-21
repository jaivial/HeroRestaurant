/**
 * API Response Types
 *
 * DTOs for all API responses, ensuring consistent camelCase naming
 * and proper serialization of bigint, Date, and other special types.
 */

import type {
  UserStatus,
  RestaurantStatus,
  SubscriptionTier,
  MembershipStatus,
} from './database.types';

// ============================================================================
// Base API Response Wrapper
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// ============================================================================
// User DTOs
// ============================================================================

/** Minimal user info (for lists, references) */
export interface UserMinimalDTO {
  id: string;
  name: string;
  avatarUrl: string | null;
}

/** Basic user info (registration, login) */
export interface UserBasicDTO extends UserMinimalDTO {
  email: string;
}

/** User with global flags (login response) */
export interface UserWithFlagsDTO extends UserBasicDTO {
  globalFlags: string; // BigInt serialized as string
}

/** Full user profile */
export interface UserProfileDTO extends UserWithFlagsDTO {
  phone: string | null;
  emailVerifiedAt: string | null;
  status: UserStatus;
  createdAt: string;
}

// ============================================================================
// Restaurant DTOs
// ============================================================================

/** Minimal restaurant info (for lists, sidebar) */
export interface RestaurantMinimalDTO {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

/** Restaurant list item (includes user's access) */
export interface RestaurantListItemDTO extends RestaurantMinimalDTO {
  status: RestaurantStatus;
  memberAccessFlags: string; // User's permissions in this restaurant
}

/** Full restaurant details */
export interface RestaurantDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  timezone: string;
  currency: string;
  websiteUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  primaryColor: string;
  defaultLanguage: string;
  defaultTaxRate: number;
  contactEmail: string | null;
  contactPhone: string | null;
  featureFlags: string; // BigInt serialized as string
  subscriptionTier: SubscriptionTier;
  status: RestaurantStatus;
  trialEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
  settings?: {
    openingHours: any[];
    mealSchedules: any;
  };
}

// ============================================================================
// Membership DTOs
// ============================================================================

/** Member info for list view */
export interface MemberDTO {
  id: string;
  userId: string;
  user: UserMinimalDTO;
  roleId: string | null;
  accessFlags: string; // BigInt serialized as string
  displayName: string | null;
  status: MembershipStatus;
  joinedAt: string;
  lastActiveAt: string | null;
  // Role details (optional, included in workspace member lists)
  roleName?: string | null;
  rolePriority?: number;
  roleColor?: string | null;
}

/** Current user's membership in a restaurant */
export interface CurrentMembershipDTO {
  restaurantId: string;
  roleId: string | null;
  accessFlags: string;
  displayName: string | null;
  status: MembershipStatus;
}

// ============================================================================
// Session DTOs
// ============================================================================

/** Session info on login/register */
export interface SessionDTO {
  id: string;
  expiresAt: string;
}

/** Session info for /me endpoint */
export interface SessionMeDTO {
  expiresAt: string;
  createdAt: string;
}

/** Session list item */
export interface SessionListItemDTO {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  lastActivity: string;
  createdAt: string;
  current: boolean;
}

// ============================================================================
// Request DTOs
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
  deviceInfo?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface CreateRestaurantRequest {
  name: string;
  slug?: string;
  description?: string;
  timezone?: string;
  currency?: string;
}

export interface UpdateRestaurantRequest {
  name?: string;
  description?: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  timezone?: string;
  currency?: string;
}

export interface UpdateUserRequest {
  name?: string;
  avatarUrl?: string | null;
  phone?: string | null;
}

export interface InviteMemberRequest {
  email: string;
  roleId?: string;
}

export interface UpdateMemberRequest {
  roleId?: string;
  accessFlags?: string;
  status?: 'active' | 'suspended';
}
