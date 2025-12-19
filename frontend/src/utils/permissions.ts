export const PERMISSIONS = {
  VIEW_DASHBOARD: 1n << 0n,
  VIEW_ORDERS: 1n << 1n,
  CREATE_ORDERS: 1n << 2n,
  UPDATE_ORDERS: 1n << 3n,
  CANCEL_ORDERS: 1n << 4n,
  VIEW_TABLES: 1n << 5n,
  MANAGE_TABLES: 1n << 6n,
  VIEW_MENU: 1n << 7n,
  EDIT_MENU: 1n << 8n,
  VIEW_INVENTORY: 1n << 9n,
  MANAGE_INVENTORY: 1n << 10n,
  VIEW_REPORTS: 1n << 11n,
  EXPORT_REPORTS: 1n << 12n,
  VIEW_MEMBERS: 1n << 13n,
  INVITE_MEMBERS: 1n << 14n,
  MANAGE_MEMBERS: 1n << 15n,
  REMOVE_MEMBERS: 1n << 16n,
  MANAGE_ROLES: 1n << 17n,
  VIEW_SETTINGS: 1n << 18n,
  EDIT_SETTINGS: 1n << 19n,
  VIEW_BILLING: 1n << 20n,
  MANAGE_BILLING: 1n << 21n,
  DELETE_RESTAURANT: 1n << 22n,
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
