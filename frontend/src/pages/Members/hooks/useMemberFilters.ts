import { useState, useMemo } from 'react';
import type { Member } from '@/atoms/memberAtoms';

export interface MemberFilters {
  search: string;
  roleId: string;
  status: string;
}

export function useMemberFilters(members: Member[]) {
  const [filters, setFilters] = useState<MemberFilters>({
    search: '',
    roleId: '',
    status: '',
  });

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch = 
        filters.search === '' || 
        member.user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        member.user.email?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesRole = 
        filters.roleId === '' || 
        member.roleId === filters.roleId;
      
      const matchesStatus = 
        filters.status === '' || 
        member.status === filters.status;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, filters]);

  const updateFilter = (key: keyof MemberFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      roleId: '',
      status: '',
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    filteredMembers,
  };
}
