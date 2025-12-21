import { PERMISSIONS } from '@/utils/permissions';
import type { RouteConfig } from '@/types';

export const ROUTE_CONFIG: Record<string, RouteConfig> = {
  '/login': {
    requiresAuth: false,
  },
  '/forgot-password': {
    requiresAuth: false,
  },
  '/w/:workspaceId/dashboard': {
    requiresAuth: true,
    requiredPermissions: [PERMISSIONS.VIEW_DASHBOARD],
    permissionMode: 'all',
  },
  '/w/:workspaceId/menu-creator': {
    requiresAuth: true,
    requiredPermissions: [PERMISSIONS.EDIT_MENU],
    permissionMode: 'all',
  },
  '/w/:workspaceId/shifts': {
    requiresAuth: true,
    requiredPermissions: [PERMISSIONS.VIEW_TIMESHEETS],
    permissionMode: 'all',
  },
  '/w/:workspaceId/members': {
    requiresAuth: true,
    requiredPermissions: [PERMISSIONS.VIEW_MEMBERS],
    permissionMode: 'all',
  },
  '/w/:workspaceId/settings': {
    requiresAuth: true,
    requiredPermissions: [PERMISSIONS.VIEW_SETTINGS],
    permissionMode: 'all',
  },
};
