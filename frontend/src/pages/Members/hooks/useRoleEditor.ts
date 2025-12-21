import { useState, useEffect, useCallback, useMemo } from 'react';
import { PERMISSIONS, togglePermission, hasPermission } from '@/utils/permissions';
import type { Role } from '@/atoms/memberAtoms';

export function useRoleEditor(role: Role | null | undefined, currentUserPriority: number, isOpen: boolean) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [color, setColor] = useState('#007AFF');
  const [permissions, setPermissions] = useState<bigint>(0n);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const autoDescription = useMemo(() => {
    if (permissions === 0n) return 'No permissions assigned.';
    
    const activePerms: string[] = [];
    
    // Core/Admin
    if (hasPermission(permissions, PERMISSIONS.MEMBER_IS_SYSTEM_ADMIN)) return 'Full system administrative access.';
    
    // Group permissions for cleaner description
    const hasManageMembers = hasPermission(permissions, PERMISSIONS.MANAGE_MEMBERS);
    const hasManageRoles = hasPermission(permissions, PERMISSIONS.MANAGE_ROLES);
    const hasManageMenu = hasPermission(permissions, PERMISSIONS.EDIT_MENU);
    const hasManageOrders = hasPermission(permissions, PERMISSIONS.UPDATE_ORDERS) || hasPermission(permissions, PERMISSIONS.CANCEL_ORDERS);
    const hasManageInventory = hasPermission(permissions, PERMISSIONS.MANAGE_INVENTORY);
    const hasManageBilling = hasPermission(permissions, PERMISSIONS.MANAGE_BILLING);

    if (hasManageMembers && hasManageRoles) activePerms.push('Manage staff and permissions');
    else if (hasManageMembers) activePerms.push('Manage staff members');
    else if (hasManageRoles) activePerms.push('Manage roles');

    if (hasManageMenu) activePerms.push('Edit restaurant menu');
    if (hasManageOrders) activePerms.push('Full order management');
    if (hasManageInventory) activePerms.push('Manage inventory');
    if (hasManageBilling) activePerms.push('Handle billing and payments');
    
    // If we have many specific ones, summarize
    if (activePerms.length === 0) {
      if (hasPermission(permissions, PERMISSIONS.VIEW_DASHBOARD)) activePerms.push('View dashboard');
      if (hasPermission(permissions, PERMISSIONS.CREATE_ORDERS)) activePerms.push('Create orders');
      if (hasPermission(permissions, PERMISSIONS.VIEW_MENU)) activePerms.push('View menu');
    }

    if (activePerms.length === 0) return 'Custom role with specific access.';
    
    return activePerms.join(', ') + '.';
  }, [permissions]);

  useEffect(() => {
    if (role && isOpen) {
      setName(role.name);
      setDescription(role.description || '');
      setDisplayOrder(role.display_order);
      setColor(role.color || '#007AFF');
      setPermissions(BigInt(role.permissions));
    } else if (isOpen) {
      setName('');
      setDescription('');
      setDisplayOrder(Math.max(0, currentUserPriority - 1));
      setColor('#007AFF');
      setPermissions(0n);
    }
  }, [role, currentUserPriority, isOpen]);

  // Update description when permissions change, if we are creating a new role
  // or if the user hasn't manually changed the description (though the prompt says we don't need manual input anymore)
  useEffect(() => {
    setDescription(autoDescription);
  }, [autoDescription]);

  const handleTogglePermission = useCallback((permKey: keyof typeof PERMISSIONS) => {
    const permValue = PERMISSIONS[permKey];
    setPermissions(prev => togglePermission(prev, permValue));
  }, []);

  return {
    name,
    setName,
    description,
    setDescription,
    displayOrder,
    setDisplayOrder,
    color,
    setColor,
    permissions,
    isSubmitting,
    setIsSubmitting,
    handleTogglePermission,
  };
}

