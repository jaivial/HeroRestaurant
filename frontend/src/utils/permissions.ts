export const USER_ACCESS_FLAGS = {
  NONE: 0n,
  ROOT: 1n << 0n,
  REGULAR: 1n << 1n,
} as const;

export const PERMISSIONS = {
  // Dashboard & Core
  VIEW_DASHBOARD: 1n << 0n,
  VIEW_ANALYTICS: 1n << 1n,

  // Orders
  VIEW_ORDERS: 1n << 2n,
  CREATE_ORDERS: 1n << 3n,
  UPDATE_ORDERS: 1n << 4n,
  CANCEL_ORDERS: 1n << 5n,
  REFUND_ORDERS: 1n << 6n,
  DELETE_ORDERS: 1n << 7n,

  // Tables
  VIEW_TABLES: 1n << 8n,
  MANAGE_TABLES: 1n << 9n,

  // Menu
  VIEW_MENU: 1n << 10n,
  EDIT_MENU: 1n << 11n,

  // Inventory
  VIEW_INVENTORY: 1n << 12n,
  MANAGE_INVENTORY: 1n << 13n,

  // Reports
  VIEW_REPORTS: 1n << 14n,
  EXPORT_REPORTS: 1n << 15n,

  // Members & Roles
  VIEW_MEMBERS: 1n << 16n,
  INVITE_MEMBERS: 1n << 17n,
  MANAGE_MEMBERS: 1n << 18n,
  REMOVE_MEMBERS: 1n << 19n,
  MANAGE_ROLES: 1n << 20n,

  // Settings
  VIEW_SETTINGS: 1n << 21n,
  EDIT_SETTINGS: 1n << 22n,
  VIEW_BILLING: 1n << 23n,
  MANAGE_BILLING: 1n << 24n,

  // Administrative
  VIEW_AUDIT_LOG: 1n << 25n,
  MANAGE_INTEGRATIONS: 1n << 26n,
  DELETE_RESTAURANT: 1n << 27n,

  // Kitchen
  VIEW_KITCHEN_DISPLAY: 1n << 28n,
  UPDATE_ORDER_STATUS: 1n << 29n,
  MANAGE_KITCHEN_STATIONS: 1n << 30n,

  // Payments
  PROCESS_PAYMENTS: 1n << 31n,
  VIEW_PAYMENT_DETAILS: 1n << 32n,

  // Staff Management
  VIEW_SCHEDULES: 1n << 33n,
  MANAGE_SCHEDULES: 1n << 34n,
  VIEW_TIMESHEETS: 1n << 35n,

  // Customer Management
  VIEW_CUSTOMERS: 1n << 36n,
  MANAGE_CUSTOMERS: 1n << 37n,
  VIEW_LOYALTY_PROGRAM: 1n << 38n,

  // Reservations
  VIEW_RESERVATIONS: 1n << 39n,
  MANAGE_RESERVATIONS: 1n << 40n,

  // Multi-Location
  VIEW_ALL_LOCATIONS: 1n << 41n,
  MANAGE_LOCATIONS: 1n << 42n,

  // Global User Permissions
  MEMBER_CREATE_RESTAURANT: 1n << 50n,
  MEMBER_IS_SYSTEM_ADMIN: 1n << 51n,
  MEMBER_CAN_IMPERSONATE: 1n << 52n,
} as const;

export function hasPermission(userFlags: bigint, permission: bigint): boolean {
  return (userFlags & permission) === permission;
}

export function hasAllPermissions(userFlags: bigint, permissions: bigint[]): boolean {
  return permissions.every(perm => hasPermission(userFlags, perm));
}

export function hasAnyPermission(userFlags: bigint, permissions: bigint[]): boolean {
  return permissions.some(perm => hasPermission(userFlags, perm));
}

export function grantPermission(userFlags: bigint, permission: bigint): bigint {
  return userFlags | permission;
}

export function revokePermission(userFlags: bigint, permission: bigint): bigint {
  return userFlags & ~permission;
}

export function togglePermission(userFlags: bigint, permission: bigint): bigint {
  return userFlags ^ permission;
}
