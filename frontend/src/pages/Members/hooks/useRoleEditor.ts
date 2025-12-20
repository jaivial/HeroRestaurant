import { useState, useEffect, useCallback } from 'react';
import { PERMISSIONS, togglePermission } from '@/utils/permissions';
import type { Role } from '@/atoms/memberAtoms';

export function useRoleEditor(role: Role | null | undefined, currentUserPriority: number, isOpen: boolean) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [color, setColor] = useState('#007AFF');
  const [permissions, setPermissions] = useState<bigint>(0n);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

