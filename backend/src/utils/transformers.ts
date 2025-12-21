/**
 * Response Transformers
 *
 * Utility functions to transform database entities to API DTOs.
 * Ensures consistent camelCase naming and proper serialization.
 */

import type { User, Restaurant, Membership, Session } from '../types/database.types';
import type {
  UserMinimalDTO,
  UserBasicDTO,
  UserWithFlagsDTO,
  UserProfileDTO,
  RestaurantDTO,
  RestaurantMinimalDTO,
  RestaurantListItemDTO,
  MemberDTO,
  SessionDTO,
  SessionMeDTO,
  SessionListItemDTO,
} from '../types/api.types';

// ============================================================================
// User Transformers
// ============================================================================

export function toUserMinimal(user: User): UserMinimalDTO {
  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatar_url,
  };
}

export function toUserBasic(user: User): UserBasicDTO {
  return {
    ...toUserMinimal(user),
    email: user.email,
  };
}

export function toUserWithFlags(user: User): UserWithFlagsDTO {
  return {
    ...toUserBasic(user),
    globalFlags: user.global_flags.toString(),
  };
}

export function toUserProfile(user: User): UserProfileDTO {
  return {
    ...toUserWithFlags(user),
    phone: user.phone,
    emailVerifiedAt: user.email_verified_at?.toISOString() ?? null,
    status: user.status,
    createdAt: user.created_at.toISOString(),
  };
}

// ============================================================================
// Restaurant Transformers
// ============================================================================

export function toRestaurantMinimal(restaurant: Restaurant): RestaurantMinimalDTO {
  return {
    id: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    logoUrl: restaurant.logo_url,
  };
}

export function toRestaurantListItem(
  restaurant: Restaurant,
  memberAccessFlags: bigint
): RestaurantListItemDTO {
  return {
    ...toRestaurantMinimal(restaurant),
    status: restaurant.status,
    memberAccessFlags: memberAccessFlags.toString(),
  };
}

export function toRestaurant(restaurant: Restaurant, settings?: any): RestaurantDTO {
  return {
    id: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    description: restaurant.description,
    logoUrl: restaurant.logo_url,
    coverUrl: restaurant.cover_url,
    address: restaurant.address,
    city: restaurant.city,
    state: restaurant.state,
    postalCode: restaurant.postal_code,
    country: restaurant.country,
    timezone: restaurant.timezone,
    currency: restaurant.currency,
    websiteUrl: restaurant.website_url,
    instagramUrl: restaurant.instagram_url,
    facebookUrl: restaurant.facebook_url,
    primaryColor: restaurant.primary_color,
    defaultLanguage: restaurant.default_language,
    defaultTaxRate: Number(restaurant.default_tax_rate),
    contactEmail: restaurant.contact_email,
    contactPhone: restaurant.contact_phone,
    featureFlags: restaurant.feature_flags.toString(),
    subscriptionTier: restaurant.subscription_tier,
    status: restaurant.status,
    trialEndsAt: restaurant.trial_ends_at?.toISOString() ?? null,
    createdAt: restaurant.created_at.toISOString(),
    updatedAt: restaurant.updated_at.toISOString(),
    settings: settings ? {
      openingHours: settings.opening_hours ? (typeof settings.opening_hours === 'string' ? JSON.parse(settings.opening_hours) : settings.opening_hours) : [],
      mealSchedules: settings.meal_schedules ? (typeof settings.meal_schedules === 'string' ? JSON.parse(settings.meal_schedules) : settings.meal_schedules) : {},
    } : undefined,
  };
}

// ============================================================================
// Membership Transformers
// ============================================================================

export function toMember(membership: any, user: User): MemberDTO {
  return {
    id: membership.id,
    userId: membership.user_id,
    user: toUserMinimal(user),
    roleId: membership.role_id,
    accessFlags: membership.access_flags.toString(),
    displayName: membership.display_name,
    status: membership.status,
    joinedAt: membership.joined_at.toISOString ? membership.joined_at.toISOString() : membership.joined_at,
    lastActiveAt: membership.last_active_at?.toISOString ? membership.last_active_at.toISOString() : membership.last_active_at ?? null,
    roleName: membership.role_name,
    rolePriority: Number(membership.role_priority ?? 0),
    roleColor: membership.role_color,
  };
}

// ============================================================================
// Session Transformers
// ============================================================================

export function toSessionDTO(sessionId: string, session: Session): SessionDTO {
  return {
    id: sessionId,
    expiresAt: session.expires_at.toISOString(),
  };
}

export function toSessionMe(session: Session): SessionMeDTO {
  return {
    expiresAt: session.expires_at.toISOString(),
    createdAt: session.created_at.toISOString(),
  };
}

export function toSessionListItem(
  session: Session,
  currentSessionId: string
): SessionListItemDTO {
  return {
    id: session.id,
    userAgent: session.user_agent,
    ipAddress: session.ip_address,
    lastActivity: session.last_activity_at.toISOString(),
    createdAt: session.created_at.toISOString(),
    current: session.id === currentSessionId,
  };
}
