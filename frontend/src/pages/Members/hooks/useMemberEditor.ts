import { useState, useEffect } from 'react';
import type { Member } from '@/atoms/memberAtoms';

export function useMemberEditor(member: Member | null | undefined, isOpen: boolean) {
  const [roleId, setRoleId] = useState('');
  const [status, setStatus] = useState<'active' | 'suspended'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (member && isOpen) {
      const timeout = setTimeout(() => {
        setRoleId(prev => prev !== (member.roleId || '') ? (member.roleId || '') : prev);
        setStatus(prev => prev !== (member.status as 'active' | 'suspended') ? (member.status as 'active' | 'suspended') : prev);
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [member, isOpen]);

  return {
    roleId,
    setRoleId,
    status,
    setStatus,
    isSubmitting,
    setIsSubmitting,
  };
}

