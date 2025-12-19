import { atom } from 'jotai';
import { hasPermission, PERMISSIONS } from '@/utils/permissions';

export const rawPermissionsAtom = atom<bigint>(0n);

// Derived permission atoms for common checks
export const canViewDashboardAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.VIEW_DASHBOARD)
);

export const canViewOrdersAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.VIEW_ORDERS)
);

export const canCreateOrdersAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.CREATE_ORDERS)
);

export const canUpdateOrdersAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.UPDATE_ORDERS)
);

export const canCancelOrdersAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.CANCEL_ORDERS)
);

export const canViewTablesAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.VIEW_TABLES)
);

export const canManageTablesAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.MANAGE_TABLES)
);

export const canViewMenuAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.VIEW_MENU)
);

export const canEditMenuAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.EDIT_MENU)
);

export const canViewInventoryAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.VIEW_INVENTORY)
);

export const canManageInventoryAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.MANAGE_INVENTORY)
);

export const canViewReportsAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.VIEW_REPORTS)
);

export const canExportReportsAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.EXPORT_REPORTS)
);

export const canViewMembersAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.VIEW_MEMBERS)
);

export const canInviteMembersAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.INVITE_MEMBERS)
);

export const canManageMembersAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.MANAGE_MEMBERS)
);

export const canRemoveMembersAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.REMOVE_MEMBERS)
);

export const canManageRolesAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.MANAGE_ROLES)
);

export const canViewSettingsAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.VIEW_SETTINGS)
);

export const canEditSettingsAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.EDIT_SETTINGS)
);

export const canViewBillingAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.VIEW_BILLING)
);

export const canManageBillingAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.MANAGE_BILLING)
);

export const canDeleteRestaurantAtom = atom((get) =>
  hasPermission(get(rawPermissionsAtom), PERMISSIONS.DELETE_RESTAURANT)
);
