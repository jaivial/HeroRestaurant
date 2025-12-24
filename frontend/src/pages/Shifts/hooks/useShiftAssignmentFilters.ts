// frontend/src/pages/Shifts/hooks/useShiftAssignmentFilters.ts

import { useState, useEffect, useMemo } from 'react';
import type { MemberShiftSummary } from '../types';

export function useShiftAssignmentFilters(members: MemberShiftSummary[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [punchFilter, setPunchFilter] = useState('all');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedMemberId && members.length > 0) {
      const firstId = members[0].id;
      requestAnimationFrame(() => setSelectedMemberId(firstId));
    }
  }, [members, selectedMemberId]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           m.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || m.role_name === roleFilter;
      const matchesPunch = punchFilter === 'all' || 
                          (punchFilter === 'in' ? !!m.active_punch_in_at : !m.active_punch_in_at);
      
      return matchesSearch && matchesRole && matchesPunch;
    });
  }, [members, searchTerm, roleFilter, punchFilter]);

  const selectedMember = useMemo(() => 
    members.find(m => m.id === selectedMemberId), 
  [members, selectedMemberId]);

  const roles = useMemo(() => {
    const uniqueRoles = Array.from(new Set(members.map(m => m.role_name).filter(Boolean)));
    return [{ label: 'All Roles', value: 'all' }, ...uniqueRoles.map(r => ({ label: r as string, value: r as string }))];
  }, [members]);

  return {
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    punchFilter,
    setPunchFilter,
    selectedMemberId,
    setSelectedMemberId,
    filteredMembers,
    selectedMember,
    roles
  };
}
