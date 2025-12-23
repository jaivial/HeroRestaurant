import { useState, useEffect } from 'react';
import type { Member } from '@/atoms/memberAtoms';

export function useMemberEditor(member: Member | null | undefined, isOpen: boolean) {
  const [roleId, setRoleId] = useState('');
  const [status, setStatus] = useState<'active' | 'suspended'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (member && isOpen) {
      // Use microtask to avoid cascading render warning
      queueMicrotask(() => {
        setRoleId(member.roleId || '');
        setStatus(member.status as 'active' | 'suspended');
      });
    }
  }, [member, isOpen]); // Added member to dependencies

  return {
    roleId,
    setRoleId,
    status,
    setStatus,
    isSubmitting,
    setIsSubmitting,
  };
}

