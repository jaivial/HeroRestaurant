import { useAtomValue } from 'jotai';
import { rawPermissionsAtom } from '@/atoms/permissionAtoms';
import { hasPermission, hasAllPermissions, hasAnyPermission } from '@/utils/permissions';

export function usePermissions() {
  const permissions = useAtomValue(rawPermissionsAtom);

  return {
    permissions,
    hasPermission: (permission: bigint) => hasPermission(permissions, permission),
    hasAllPermissions: (requiredPermissions: bigint[]) =>
      hasAllPermissions(permissions, requiredPermissions),
    hasAnyPermission: (requiredPermissions: bigint[]) =>
      hasAnyPermission(permissions, requiredPermissions),
  };
}
