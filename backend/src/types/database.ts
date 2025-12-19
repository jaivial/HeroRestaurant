/**
 * Database Type Definitions
 *
 * TypeScript types for all database tables and operations.
 * Uses Kysely's type helpers for type-safe queries.
 */

import type { Generated, Insertable, Selectable, Updateable, ColumnType } from 'kysely';

// ============================================================================
// Database Schema Interface
// ============================================================================

export interface DB {
  users: UsersTable;
  restaurants: RestaurantsTable;
  roles: RolesTable;
  memberships: MembershipsTable;
  sessions: SessionsTable;
  login_attempts: LoginAttemptsTable;
}

// ============================================================================
// Users Table
// ============================================================================

export interface UsersTable {
  id: Generated<string>; // UUID primary key
  email: string; // Unique email address
  password_hash: string; // Argon2 hashed password
  name: string; // Full name
  avatar_url: string | null; // Profile image URL
  phone: string | null; // Phone number (optional)
  email_verified_at: Date | null; // Email verification timestamp
  status: 'active' | 'suspended' | 'pending'; // Account status
  global_flags: ColumnType<bigint, bigint | string | number, bigint | string | number>; // BIGINT for system-wide permissions
  last_login_at: Date | null; // Last login timestamp
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null; // Soft delete timestamp
}

export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;

// ============================================================================
// Restaurants Table (Tenants/Workspaces)
// ============================================================================

export interface RestaurantsTable {
  id: Generated<string>; // UUID primary key
  name: string; // Restaurant name
  slug: string; // Unique URL slug
  logo_url: string | null; // Logo image URL
  cover_url: string | null; // Cover image URL
  address: string | null; // Physical address
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  timezone: string; // IANA timezone (e.g., 'America/New_York')
  currency: string; // ISO currency code (e.g., 'USD')
  contact_email: string | null;
  contact_phone: string | null;
  feature_flags: ColumnType<bigint, bigint | string | number, bigint | string | number>; // Enabled features for this tenant
  subscription_tier: string; // 'free', 'starter', 'professional', 'enterprise'
  owner_user_id: string; // Foreign key to users table
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  trial_ends_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export type Restaurant = Selectable<RestaurantsTable>;
export type NewRestaurant = Insertable<RestaurantsTable>;
export type RestaurantUpdate = Updateable<RestaurantsTable>;

// ============================================================================
// Roles Table
// ============================================================================

export interface RolesTable {
  id: Generated<string>; // UUID primary key
  restaurant_id: string | null; // NULL for system roles, set for custom roles
  name: string; // Role name
  description: string | null;
  permissions: ColumnType<bigint, bigint | string | number, bigint | string | number>; // Base permission flags
  is_system_role: Generated<boolean>; // Cannot be deleted or modified
  display_order: number; // For UI sorting
  color: string | null; // Hex color for badges
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export type Role = Selectable<RolesTable>;
export type NewRole = Insertable<RolesTable>;
export type RoleUpdate = Updateable<RolesTable>;

// ============================================================================
// Memberships Table (User-Restaurant Junction)
// ============================================================================

export interface MembershipsTable {
  id: Generated<string>; // UUID primary key
  user_id: string; // Foreign key to users
  restaurant_id: string; // Foreign key to restaurants
  role_id: string | null; // Foreign key to roles (optional)
  access_flags: ColumnType<bigint, bigint | string | number, bigint | string | number>; // Member-specific permissions
  display_name: string | null; // Override name in this workspace
  joined_at: Generated<Date>;
  invited_by_user_id: string | null; // Who sent the invitation
  invitation_accepted_at: Date | null;
  status: 'pending' | 'active' | 'suspended' | 'left';
  last_active_at: Date | null; // Workspace-specific activity
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export type Membership = Selectable<MembershipsTable>;
export type NewMembership = Insertable<MembershipsTable>;
export type MembershipUpdate = Updateable<MembershipsTable>;

// ============================================================================
// Sessions Table
// ============================================================================

export interface SessionsTable {
  id: Generated<string>; // UUID primary key
  hashed_session_id: string; // SHA-256 hash of actual session ID
  user_id: string; // Foreign key to users
  current_restaurant_id: string | null; // Current workspace context
  device_fingerprint: string | null;
  user_agent: string | null;
  ip_address: string | null;
  expires_at: Date; // 21-hour sliding expiry
  last_activity_at: Generated<Date>;
  created_at: Generated<Date>;
  revoked_at: Date | null;
  revocation_reason: 'logout' | 'password_change' | 'security' | 'admin_action' | null;
}

export type Session = Selectable<SessionsTable>;
export type NewSession = Insertable<SessionsTable>;
export type SessionUpdate = Updateable<SessionsTable>;

// ============================================================================
// Login Attempts Table (Rate Limiting)
// ============================================================================

export interface LoginAttemptsTable {
  id: Generated<string>; // UUID primary key
  email: string; // Email attempted (may not exist)
  ip_address: string;
  user_agent: string | null;
  success: boolean;
  attempted_at: Generated<Date>;
}

export type LoginAttempt = Selectable<LoginAttemptsTable>;
export type NewLoginAttempt = Insertable<LoginAttemptsTable>;
