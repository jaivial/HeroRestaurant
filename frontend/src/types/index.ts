/**
 * Frontend Type Definitions
 *
 * These types match the backend API DTOs for type-safe frontend development.
 * All types use camelCase to match API responses.
 */

// ============================================================================
// Shared Enums (matching backend database.types.ts)
// ============================================================================

export type UserStatus = 'active' | 'suspended' | 'pending';
export type RestaurantStatus = 'active' | 'trial' | 'suspended' | 'cancelled';
export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'enterprise';
export type MembershipStatus = 'pending' | 'active' | 'suspended' | 'left';
export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

// ============================================================================
// User Types
// ============================================================================

/** Minimal user info (for lists, references) */
export interface UserMinimal {
  id: string;
  name: string;
  avatarUrl: string | null;
}

/** Basic user info (registration, login) */
export interface UserBasic extends UserMinimal {
  email: string;
}

/** User with global flags (login response) */
export interface UserWithFlags extends UserBasic {
  globalFlags: string; // BigInt serialized as string
}

/** Full user profile */
export interface UserProfile extends UserWithFlags {
  phone: string | null;
  emailVerifiedAt: string | null;
  status: UserStatus;
  createdAt: string;
}

// Legacy alias for backward compatibility
export type User = UserBasic;

// ============================================================================
// Restaurant/Workspace Types
// ============================================================================

/** Minimal restaurant info (for lists, sidebar) */
export interface RestaurantMinimal {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

/** Restaurant list item (includes user's access) */
export interface RestaurantListItem extends RestaurantMinimal {
  status: RestaurantStatus;
  memberAccessFlags: string;
}

/** Full restaurant details */
export interface Restaurant {
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
  featureFlags: string;
  subscriptionTier: SubscriptionTier;
  status: RestaurantStatus;
  trialEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
  settings?: RestaurantSettings;
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

export interface RestaurantSettings {
  openingHours: OpeningHour[];
  mealSchedules: MealSchedules;
}

// Legacy alias
export type Workspace = RestaurantMinimal & Partial<Restaurant> & {
  permissions: bigint;
};

// ============================================================================
// Membership Types
// ============================================================================

/** Member info for list view */
export interface Member {
  id: string;
  userId: string;
  user: UserMinimal;
  roleId: string | null;
  accessFlags: string;
  displayName: string | null;
  status: MembershipStatus;
  joinedAt: string;
  lastActiveAt: string | null;
}

// ============================================================================
// Session Types
// ============================================================================

/** Session info on login/register */
export interface Session {
  id: string;
  expiresAt: string;
}

/** Session info for /me endpoint */
export interface SessionMe {
  expiresAt: string;
  createdAt: string;
}

/** Session list item */
export interface SessionListItem {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  lastActivity: string;
  createdAt: string;
  current: boolean;
}

// ============================================================================
// API Response Types
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
// Auth Response Types
// ============================================================================

export interface LoginResponse {
  user: UserWithFlags;
  session: Session;
}

export interface RegisterResponse {
  user: UserBasic;
  session: Session;
}

export interface MeResponse {
  user: UserWithFlags;
  session: SessionMe;
  restaurants: RestaurantListItem[];
}

export interface SessionsResponse {
  sessions: SessionListItem[];
}

// ============================================================================
// Form Types
// ============================================================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
}

// ============================================================================
// Route Config Types
// ============================================================================

export interface RouteConfig {
  requiresAuth: boolean;
  requiredPermissions?: bigint[];
  permissionMode?: 'all' | 'any';
}
