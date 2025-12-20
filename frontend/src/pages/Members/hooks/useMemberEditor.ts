import { useState, useEffect } from 'react';
import type { Member } from '@/atoms/memberAtoms';

export function useMemberEditor(member: Member | null | undefined, isOpen: boolean) {
  const [roleId, setRoleId] = useState('');
  const [status, setStatus] = useState<'active' | 'suspended'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (member && isOpen) {
      setRoleId(member.role_id || '');
      setStatus(member.status as 'active' | 'suspended');
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

