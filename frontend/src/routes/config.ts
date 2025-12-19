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
  '/w/:workspaceId/orders': {
    requiresAuth: true,
    requiredPermissions: [PERMISSIONS.VIEW_ORDERS],
    permissionMode: 'all',
  },
  '/w/:workspaceId/orders/new': {
    requiresAuth: true,
    requiredPermissions: [PERMISSIONS.CREATE_ORDERS],
    permissionMode: 'all',
  },
  '/w/:workspaceId/tables': {
    requiresAuth: true,
    requiredPermissions: [PERMISSIONS.VIEW_TABLES],
    permissionMode: 'all',
  },
  '/w/:workspaceId/menu': {
    requiresAuth: true,
    requiredPermissions: [PERMISSIONS.VIEW_MENU],
    permissionMode: 'all',
  },
  '/w/:workspaceId/inventory': {
    requiresAuth: true,
    requiredPermissions: [PERMISSIONS.VIEW_INVENTORY],
    permissionMode: 'all',
  },
  '/w/:workspaceId/reports': {
    requiresAuth: true,
    requiredPermissions: [PERMISSIONS.VIEW_REPORTS],
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
  '/w/:workspaceId/billing': {
    requiresAuth: true,
    requiredPermissions: [PERMISSIONS.VIEW_BILLING],
    permissionMode: 'all',
  },
};
