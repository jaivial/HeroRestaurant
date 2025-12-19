/**
 * Database Type Definitions (Kysely)
 *
 * Re-exports database types from database.types.ts for Kysely usage.
 * This ensures a single source of truth for all database types.
 */

export type {
  // Enums
  UserStatus,
  RestaurantStatus,
  SubscriptionTier,
  MembershipStatus,
  RevocationReason,
  // Database schema
  DB,
  // Users
  UsersTable,
  User,
  NewUser,
  UserUpdate,
  // Restaurants
  RestaurantsTable,
  Restaurant,
  NewRestaurant,
  RestaurantUpdate,
  // Roles
  RolesTable,
  Role,
  NewRole,
  RoleUpdate,
  // Memberships
  MembershipsTable,
  Membership,
  NewMembership,
  MembershipUpdate,
  // Sessions
  SessionsTable,
  Session,
  NewSession,
  SessionUpdate,
  // Login Attempts
  LoginAttemptsTable,
  LoginAttempt,
  NewLoginAttempt,
} from './database.types';
