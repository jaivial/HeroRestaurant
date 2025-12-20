/**
 * Permission Flags System
 *
 * Uses 64-bit BIGINT bitwise flags for efficient permission storage and checking.
 * Two types of flags:
 * 1. Member Access Flags - What a member can DO in a workspace
 * 2. Restaurant Feature Flags - What features are ENABLED for a tenant
 */

// ============================================================================
// Global User Access Flags (stored in users.global_flags)
// ============================================================================

export const USER_ACCESS_FLAGS = {
  NONE: 0n,
  ROOT: 1n << 0n,
  REGULAR: 1n << 1n,
} as const;

// ============================================================================
// Member Access Flags (memberships.access_flags)
// ============================================================================

/**
 * Core System Permissions (Bits 0-15)
 */
export const MEMBER_FLAGS = {
  // Dashboard & Core
  CAN_VIEW_DASHBOARD: 1n << 0n,
  CAN_VIEW_ANALYTICS: 1n << 1n,

  // Orders (Bits 2-7)
  CAN_VIEW_ORDERS: 1n << 2n,
  CAN_CREATE_ORDERS: 1n << 3n,
  CAN_UPDATE_ORDERS: 1n << 4n,
  CAN_CANCEL_ORDERS: 1n << 5n,
  CAN_REFUND_ORDERS: 1n << 6n,
  CAN_DELETE_ORDERS: 1n << 7n,

  // Tables (Bits 8-9)
  CAN_VIEW_TABLES: 1n << 8n,
  CAN_MANAGE_TABLES: 1n << 9n,

  // Menu (Bits 10-11)
  CAN_VIEW_MENU: 1n << 10n,
  CAN_EDIT_MENU: 1n << 11n,

  // Inventory (Bits 12-13)
  CAN_VIEW_INVENTORY: 1n << 12n,
  CAN_MANAGE_INVENTORY: 1n << 13n,

  // Reports (Bits 14-15)
  CAN_VIEW_REPORTS: 1n << 14n,
  CAN_EXPORT_REPORTS: 1n << 15n,

  // Members & Roles (Bits 16-19)
  CAN_VIEW_MEMBERS: 1n << 16n,
  CAN_INVITE_MEMBERS: 1n << 17n,
  CAN_MANAGE_MEMBERS: 1n << 18n,
  CAN_REMOVE_MEMBERS: 1n << 19n,
  CAN_MANAGE_ROLES: 1n << 20n,

  // Settings (Bits 21-23)
  CAN_VIEW_SETTINGS: 1n << 21n,
  CAN_EDIT_SETTINGS: 1n << 22n,
  CAN_VIEW_BILLING: 1n << 23n,
  CAN_MANAGE_BILLING: 1n << 24n,

  // Administrative (Bits 25-27)
  CAN_VIEW_AUDIT_LOG: 1n << 25n,
  CAN_MANAGE_INTEGRATIONS: 1n << 26n,
  CAN_DELETE_RESTAURANT: 1n << 27n,

  // Kitchen (Bits 28-30)
  CAN_VIEW_KITCHEN_DISPLAY: 1n << 28n,
  CAN_UPDATE_ORDER_STATUS: 1n << 29n,
  CAN_MANAGE_KITCHEN_STATIONS: 1n << 30n,

  // Payments (Bits 31-32)
  CAN_PROCESS_PAYMENTS: 1n << 31n,
  CAN_VIEW_PAYMENT_DETAILS: 1n << 32n,

  // Staff Management (Bits 33-35)
  CAN_VIEW_SCHEDULES: 1n << 33n,
  CAN_MANAGE_SCHEDULES: 1n << 34n,
  CAN_VIEW_TIMESHEETS: 1n << 35n,

  // Customer Management (Bits 36-38)
  CAN_VIEW_CUSTOMERS: 1n << 36n,
  CAN_MANAGE_CUSTOMERS: 1n << 37n,
  CAN_VIEW_LOYALTY_PROGRAM: 1n << 38n,

  // Reservations (Bits 39-40)
  CAN_VIEW_RESERVATIONS: 1n << 39n,
  CAN_MANAGE_RESERVATIONS: 1n << 40n,

  // Multi-Location (Bits 41-42)
  CAN_VIEW_ALL_LOCATIONS: 1n << 41n,
  CAN_MANAGE_LOCATIONS: 1n << 42n,

  // Global User Permissions (Bits 50-52)
  MEMBER_CREATE_RESTAURANT: 1n << 50n,
  MEMBER_IS_SYSTEM_ADMIN: 1n << 51n,
  MEMBER_CAN_IMPERSONATE: 1n << 52n,
} as const;

// ============================================================================
// Restaurant Feature Flags (restaurants.feature_flags)
// ============================================================================

export const RESTAURANT_FEATURES = {
  // Core Features (Bits 0-7)
  FEATURE_BASIC_ORDERS: 1n << 0n,
  FEATURE_TABLE_MANAGEMENT: 1n << 1n,
  FEATURE_INVENTORY: 1n << 2n,
  FEATURE_MENU_MANAGEMENT: 1n << 3n,
  FEATURE_REPORTS_BASIC: 1n << 4n,
  FEATURE_REPORTS_ADVANCED: 1n << 5n,
  FEATURE_CUSTOMER_MANAGEMENT: 1n << 6n,
  FEATURE_RESERVATIONS: 1n << 7n,

  // Advanced Features (Bits 8-15)
  FEATURE_KITCHEN_DISPLAY: 1n << 8n,
  FEATURE_STAFF_SCHEDULING: 1n << 9n,
  FEATURE_LOYALTY_PROGRAM: 1n << 10n,
  FEATURE_ONLINE_ORDERING: 1n << 11n,
  FEATURE_DELIVERY_TRACKING: 1n << 12n,
  FEATURE_MULTI_LOCATION: 1n << 13n,
  FEATURE_MOBILE_APP: 1n << 14n,
  FEATURE_CUSTOM_BRANDING: 1n << 15n,

  // Integration Features (Bits 16-23)
  FEATURE_API_ACCESS: 1n << 16n,
  FEATURE_WEBHOOKS: 1n << 17n,
  FEATURE_THIRD_PARTY_INTEGRATIONS: 1n << 18n,
  FEATURE_POS_INTEGRATION: 1n << 19n,
  FEATURE_ACCOUNTING_INTEGRATION: 1n << 20n,
  FEATURE_DELIVERY_PLATFORM_SYNC: 1n << 21n,
  FEATURE_PAYMENT_GATEWAY_ADVANCED: 1n << 22n,

  // Premium Features (Bits 24-31)
  FEATURE_WHITE_LABEL: 1n << 24n,
  FEATURE_CUSTOM_DOMAIN: 1n << 25n,
  FEATURE_ADVANCED_ANALYTICS: 1n << 26n,
  FEATURE_AI_RECOMMENDATIONS: 1n << 27n,
  FEATURE_PRIORITY_SUPPORT: 1n << 28n,
  FEATURE_DATA_EXPORT: 1n << 29n,
  FEATURE_AUDIT_LOGS: 1n << 30n,
  FEATURE_SSO: 1n << 31n,
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a single flag is set
 */
export function hasFlag(flags: bigint, flag: bigint): boolean {
  return (flags & flag) !== 0n;
}

/**
 * Check if ALL required flags are set
 */
export function hasAllFlags(flags: bigint, requiredFlags: bigint): boolean {
  return (flags & requiredFlags) === requiredFlags;
}

/**
 * Check if ANY of the required flags are set
 */
export function hasAnyFlag(flags: bigint, requiredFlags: bigint): boolean {
  return (flags & requiredFlags) !== 0n;
}

/**
 * Add a flag to existing flags
 */
export function addFlag(flags: bigint, flag: bigint): bigint {
  return flags | flag;
}

/**
 * Remove a flag from existing flags
 */
export function removeFlag(flags: bigint, flag: bigint): bigint {
  return flags & ~flag;
}

/**
 * Toggle a flag
 */
export function toggleFlag(flags: bigint, flag: bigint): bigint {
  return flags ^ flag;
}

/**
 * Combine multiple flags into one
 */
export function combineFlags(...flags: bigint[]): bigint {
  return flags.reduce((acc, flag) => acc | flag, 0n);
}

/**
 * Check if member can perform action (checks both feature and permission)
 */
export function canPerformAction(
  restaurantFeatures: bigint,
  memberPermissions: bigint,
  requiredFeature: bigint,
  requiredPermission: bigint
): boolean {
  return hasFlag(restaurantFeatures, requiredFeature) && hasFlag(memberPermissions, requiredPermission);
}

// ============================================================================
// Role Presets
// ============================================================================

/**
 * Owner - Full control over restaurant
 */
export const ROLE_OWNER = combineFlags(
  MEMBER_FLAGS.CAN_VIEW_DASHBOARD,
  MEMBER_FLAGS.CAN_VIEW_ANALYTICS,
  MEMBER_FLAGS.CAN_VIEW_ORDERS,
  MEMBER_FLAGS.CAN_CREATE_ORDERS,
  MEMBER_FLAGS.CAN_UPDATE_ORDERS,
  MEMBER_FLAGS.CAN_CANCEL_ORDERS,
  MEMBER_FLAGS.CAN_REFUND_ORDERS,
  MEMBER_FLAGS.CAN_DELETE_ORDERS,
  MEMBER_FLAGS.CAN_VIEW_TABLES,
  MEMBER_FLAGS.CAN_MANAGE_TABLES,
  MEMBER_FLAGS.CAN_VIEW_MENU,
  MEMBER_FLAGS.CAN_EDIT_MENU,
  MEMBER_FLAGS.CAN_VIEW_INVENTORY,
  MEMBER_FLAGS.CAN_MANAGE_INVENTORY,
  MEMBER_FLAGS.CAN_VIEW_REPORTS,
  MEMBER_FLAGS.CAN_EXPORT_REPORTS,
  MEMBER_FLAGS.CAN_VIEW_MEMBERS,
  MEMBER_FLAGS.CAN_INVITE_MEMBERS,
  MEMBER_FLAGS.CAN_MANAGE_MEMBERS,
  MEMBER_FLAGS.CAN_REMOVE_MEMBERS,
  MEMBER_FLAGS.CAN_MANAGE_ROLES,
  MEMBER_FLAGS.CAN_VIEW_SETTINGS,
  MEMBER_FLAGS.CAN_EDIT_SETTINGS,
  MEMBER_FLAGS.CAN_VIEW_BILLING,
  MEMBER_FLAGS.CAN_MANAGE_BILLING,
  MEMBER_FLAGS.CAN_VIEW_AUDIT_LOG,
  MEMBER_FLAGS.CAN_MANAGE_INTEGRATIONS,
  MEMBER_FLAGS.CAN_DELETE_RESTAURANT,
  MEMBER_FLAGS.CAN_VIEW_KITCHEN_DISPLAY,
  MEMBER_FLAGS.CAN_UPDATE_ORDER_STATUS,
  MEMBER_FLAGS.CAN_MANAGE_KITCHEN_STATIONS,
  MEMBER_FLAGS.CAN_PROCESS_PAYMENTS,
  MEMBER_FLAGS.CAN_VIEW_PAYMENT_DETAILS,
  MEMBER_FLAGS.CAN_VIEW_SCHEDULES,
  MEMBER_FLAGS.CAN_MANAGE_SCHEDULES,
  MEMBER_FLAGS.CAN_VIEW_TIMESHEETS,
  MEMBER_FLAGS.CAN_VIEW_CUSTOMERS,
  MEMBER_FLAGS.CAN_MANAGE_CUSTOMERS,
  MEMBER_FLAGS.CAN_VIEW_LOYALTY_PROGRAM,
  MEMBER_FLAGS.CAN_VIEW_RESERVATIONS,
  MEMBER_FLAGS.CAN_MANAGE_RESERVATIONS,
  MEMBER_FLAGS.CAN_VIEW_ALL_LOCATIONS,
  MEMBER_FLAGS.CAN_MANAGE_LOCATIONS
);

/**
 * Admin - Nearly full control, cannot delete restaurant
 */
export const ROLE_ADMIN = ROLE_OWNER & ~MEMBER_FLAGS.CAN_DELETE_RESTAURANT;

/**
 * Manager - Can manage operations, orders, staff, inventory
 */
export const ROLE_MANAGER = combineFlags(
  MEMBER_FLAGS.CAN_VIEW_DASHBOARD,
  MEMBER_FLAGS.CAN_VIEW_ANALYTICS,
  MEMBER_FLAGS.CAN_VIEW_ORDERS,
  MEMBER_FLAGS.CAN_CREATE_ORDERS,
  MEMBER_FLAGS.CAN_UPDATE_ORDERS,
  MEMBER_FLAGS.CAN_CANCEL_ORDERS,
  MEMBER_FLAGS.CAN_VIEW_TABLES,
  MEMBER_FLAGS.CAN_MANAGE_TABLES,
  MEMBER_FLAGS.CAN_VIEW_MENU,
  MEMBER_FLAGS.CAN_VIEW_INVENTORY,
  MEMBER_FLAGS.CAN_MANAGE_INVENTORY,
  MEMBER_FLAGS.CAN_VIEW_REPORTS,
  MEMBER_FLAGS.CAN_EXPORT_REPORTS,
  MEMBER_FLAGS.CAN_VIEW_MEMBERS,
  MEMBER_FLAGS.CAN_VIEW_KITCHEN_DISPLAY,
  MEMBER_FLAGS.CAN_UPDATE_ORDER_STATUS,
  MEMBER_FLAGS.CAN_VIEW_SCHEDULES,
  MEMBER_FLAGS.CAN_MANAGE_SCHEDULES,
  MEMBER_FLAGS.CAN_VIEW_CUSTOMERS,
  MEMBER_FLAGS.CAN_VIEW_RESERVATIONS,
  MEMBER_FLAGS.CAN_MANAGE_RESERVATIONS
);

/**
 * Chef - Kitchen-focused permissions
 */
export const ROLE_CHEF = combineFlags(
  MEMBER_FLAGS.CAN_VIEW_DASHBOARD,
  MEMBER_FLAGS.CAN_VIEW_ORDERS,
  MEMBER_FLAGS.CAN_VIEW_MENU,
  MEMBER_FLAGS.CAN_VIEW_INVENTORY,
  MEMBER_FLAGS.CAN_VIEW_KITCHEN_DISPLAY,
  MEMBER_FLAGS.CAN_UPDATE_ORDER_STATUS,
  MEMBER_FLAGS.CAN_MANAGE_KITCHEN_STATIONS
);

/**
 * Server/Waiter - Can create orders and manage tables
 */
export const ROLE_SERVER = combineFlags(
  MEMBER_FLAGS.CAN_VIEW_DASHBOARD,
  MEMBER_FLAGS.CAN_VIEW_ORDERS,
  MEMBER_FLAGS.CAN_CREATE_ORDERS,
  MEMBER_FLAGS.CAN_UPDATE_ORDERS,
  MEMBER_FLAGS.CAN_VIEW_TABLES,
  MEMBER_FLAGS.CAN_VIEW_MENU,
  MEMBER_FLAGS.CAN_VIEW_CUSTOMERS,
  MEMBER_FLAGS.CAN_VIEW_RESERVATIONS
);

/**
 * Cashier - Can process payments and view orders
 */
export const ROLE_CASHIER = combineFlags(
  MEMBER_FLAGS.CAN_VIEW_DASHBOARD,
  MEMBER_FLAGS.CAN_VIEW_ORDERS,
  MEMBER_FLAGS.CAN_PROCESS_PAYMENTS,
  MEMBER_FLAGS.CAN_VIEW_PAYMENT_DETAILS
);

/**
 * Viewer - Read-only access
 */
export const ROLE_VIEWER = combineFlags(
  MEMBER_FLAGS.CAN_VIEW_DASHBOARD,
  MEMBER_FLAGS.CAN_VIEW_ORDERS,
  MEMBER_FLAGS.CAN_VIEW_TABLES,
  MEMBER_FLAGS.CAN_VIEW_MENU,
  MEMBER_FLAGS.CAN_VIEW_REPORTS
);

// ============================================================================
// Subscription Tier Feature Presets
// ============================================================================

/**
 * Free Tier - Basic features
 */
export const TIER_FREE = combineFlags(
  RESTAURANT_FEATURES.FEATURE_BASIC_ORDERS,
  RESTAURANT_FEATURES.FEATURE_TABLE_MANAGEMENT,
  RESTAURANT_FEATURES.FEATURE_MENU_MANAGEMENT,
  RESTAURANT_FEATURES.FEATURE_REPORTS_BASIC
);

/**
 * Starter Tier - Core features
 */
export const TIER_STARTER = combineFlags(
  TIER_FREE,
  RESTAURANT_FEATURES.FEATURE_INVENTORY,
  RESTAURANT_FEATURES.FEATURE_CUSTOMER_MANAGEMENT,
  RESTAURANT_FEATURES.FEATURE_RESERVATIONS,
  RESTAURANT_FEATURES.FEATURE_KITCHEN_DISPLAY
);

/**
 * Professional Tier - Advanced features
 */
export const TIER_PROFESSIONAL = combineFlags(
  TIER_STARTER,
  RESTAURANT_FEATURES.FEATURE_REPORTS_ADVANCED,
  RESTAURANT_FEATURES.FEATURE_STAFF_SCHEDULING,
  RESTAURANT_FEATURES.FEATURE_LOYALTY_PROGRAM,
  RESTAURANT_FEATURES.FEATURE_ONLINE_ORDERING,
  RESTAURANT_FEATURES.FEATURE_DELIVERY_TRACKING,
  RESTAURANT_FEATURES.FEATURE_API_ACCESS,
  RESTAURANT_FEATURES.FEATURE_WEBHOOKS,
  RESTAURANT_FEATURES.FEATURE_ADVANCED_ANALYTICS
);

/**
 * Enterprise Tier - All features
 */
export const TIER_ENTERPRISE = combineFlags(
  TIER_PROFESSIONAL,
  RESTAURANT_FEATURES.FEATURE_MULTI_LOCATION,
  RESTAURANT_FEATURES.FEATURE_MOBILE_APP,
  RESTAURANT_FEATURES.FEATURE_CUSTOM_BRANDING,
  RESTAURANT_FEATURES.FEATURE_THIRD_PARTY_INTEGRATIONS,
  RESTAURANT_FEATURES.FEATURE_POS_INTEGRATION,
  RESTAURANT_FEATURES.FEATURE_ACCOUNTING_INTEGRATION,
  RESTAURANT_FEATURES.FEATURE_DELIVERY_PLATFORM_SYNC,
  RESTAURANT_FEATURES.FEATURE_PAYMENT_GATEWAY_ADVANCED,
  RESTAURANT_FEATURES.FEATURE_WHITE_LABEL,
  RESTAURANT_FEATURES.FEATURE_CUSTOM_DOMAIN,
  RESTAURANT_FEATURES.FEATURE_AI_RECOMMENDATIONS,
  RESTAURANT_FEATURES.FEATURE_PRIORITY_SUPPORT,
  RESTAURANT_FEATURES.FEATURE_DATA_EXPORT,
  RESTAURANT_FEATURES.FEATURE_AUDIT_LOGS,
  RESTAURANT_FEATURES.FEATURE_SSO
);

// ============================================================================
// Type Exports
// ============================================================================

export type MemberFlag = typeof MEMBER_FLAGS[keyof typeof MEMBER_FLAGS];
export type RestaurantFeature = typeof RESTAURANT_FEATURES[keyof typeof RESTAURANT_FEATURES];

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default global flags for new users (no special privileges)
 */
export const DEFAULT_GLOBAL_FLAGS = 0n;

/**
 * Default member flags for newly invited members (basic view access)
 */
export const DEFAULT_MEMBER_FLAGS = combineFlags(
  MEMBER_FLAGS.CAN_VIEW_DASHBOARD
);

/**
 * Default feature flags for new restaurants (free tier)
 */
export const DEFAULT_RESTAURANT_FEATURES = TIER_FREE;

/**
 * Alias for DEFAULT_RESTAURANT_FEATURES (backward compatibility)
 */
export const DEFAULT_RESTAURANT_FLAGS = TIER_FREE;

// ============================================================================
// Role Templates (for seeding and role assignment)
// ============================================================================

export const ROLE_TEMPLATES = {
  OWNER: ROLE_OWNER,
  ADMIN: ROLE_ADMIN,
  MANAGER: ROLE_MANAGER,
  CHEF: ROLE_CHEF,
  SERVER: ROLE_SERVER,
  CASHIER: ROLE_CASHIER,
  VIEWER: ROLE_VIEWER,
} as const;

// ============================================================================
// Aliases (backward compatibility)
// ============================================================================

/**
 * Alias for hasAllFlags - Check if all required permissions are present
 */
export const hasPermission = hasAllFlags;

/**
 * Alias for hasAnyFlag - Check if any of the required permissions are present
 */
export const hasAnyPermission = hasAnyFlag;

/**
 * Global user flags (stored in users.member_flags for system-wide permissions)
 */
export const GLOBAL_FLAGS = {
  CREATE_RESTAURANT: MEMBER_FLAGS.MEMBER_CREATE_RESTAURANT,
  IS_SYSTEM_ADMIN: MEMBER_FLAGS.MEMBER_IS_SYSTEM_ADMIN,
  CAN_IMPERSONATE: MEMBER_FLAGS.MEMBER_CAN_IMPERSONATE,
} as const;
