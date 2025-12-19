import type { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface DB {
  users: UsersTable;
  restaurants: RestaurantsTable;
  memberships: MembershipsTable;
  sessions: SessionsTable;
  roles: RolesTable;
  login_attempts: LoginAttemptsTable;
}

// ============= Users Table =============
export interface UsersTable {
  id: Generated<string>;
  email: string;
  password_hash: string;
  name: string;
  avatar_url: string | null;
  phone: string | null;
  email_verified_at: Date | null;
  status: 'active' | 'suspended' | 'pending';
  global_flags: bigint;
  last_login_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;

// ============= Restaurants Table =============
export interface RestaurantsTable {
  id: Generated<string>;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_image_url: string | null;
  address: string | null;
  timezone: string;
  currency: string;
  contact_email: string | null;
  contact_phone: string | null;
  feature_flags: bigint;
  owner_user_id: string;
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  trial_expires_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export type Restaurant = Selectable<RestaurantsTable>;
export type NewRestaurant = Insertable<RestaurantsTable>;
export type RestaurantUpdate = Updateable<RestaurantsTable>;

// ============= Memberships Table =============
export interface MembershipsTable {
  id: Generated<string>;
  user_id: string;
  restaurant_id: string;
  role_id: string | null;
  access_flags: bigint;
  display_name: string | null;
  joined_at: Generated<Date>;
  invited_by_user_id: string | null;
  invitation_accepted_at: Date | null;
  status: 'pending' | 'active' | 'suspended' | 'left';
  last_active_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export type Membership = Selectable<MembershipsTable>;
export type NewMembership = Insertable<MembershipsTable>;
export type MembershipUpdate = Updateable<MembershipsTable>;

// ============= Sessions Table =============
export interface SessionsTable {
  id: Generated<string>;
  hashed_session_id: string;
  user_id: string;
  current_restaurant_id: string | null;
  device_info: string | null;
  ip_address: string | null;
  expires_at: Date;
  last_activity_at: Generated<Date>;
  created_at: Generated<Date>;
  revoked_at: Date | null;
  revocation_reason: 'logout' | 'password_change' | 'security' | 'admin_action' | null;
}

export type Session = Selectable<SessionsTable>;
export type NewSession = Insertable<SessionsTable>;
export type SessionUpdate = Updateable<SessionsTable>;

// ============= Roles Table =============
export interface RolesTable {
  id: Generated<string>;
  restaurant_id: string | null;
  name: string;
  description: string | null;
  permission_flags: bigint;
  is_system_role: Generated<number>;
  display_order: number;
  color_code: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export type Role = Selectable<RolesTable>;
export type NewRole = Insertable<RolesTable>;
export type RoleUpdate = Updateable<RolesTable>;

// ============= Login Attempts Table =============
export interface LoginAttemptsTable {
  id: Generated<string>;
  email: string;
  ip_address: string;
  attempted_at: Generated<Date>;
  success: number;
  user_agent: string | null;
}

export type LoginAttempt = Selectable<LoginAttemptsTable>;
export type NewLoginAttempt = Insertable<LoginAttemptsTable>;
