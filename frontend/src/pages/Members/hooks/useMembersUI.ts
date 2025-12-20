import { useState, useCallback } from 'react';
import type { MembersTab } from '../types';
import type { Member, Role } from '@/atoms/memberAtoms';

export function useMembersUI() {
  const [activeTab, setActiveTab] = useState<MembersTab>('members');
  
  const [isRoleEditorOpen, setIsRoleEditorOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  const [isMemberEditorOpen, setIsMemberEditorOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const handleEditRole = useCallback((role: Role) => {
    setSelectedRole(role);
    setIsRoleEditorOpen(true);
  }, []);

  const handleCreateRole = useCallback(() => {
    setSelectedRole(null);
    setIsRoleEditorOpen(true);
  }, []);

  const handleEditMember = useCallback((member: Member) => {
    setSelectedMember(member);
    setIsMemberEditorOpen(true);
  }, []);

  const closeRoleEditor = useCallback(() => {
    setIsRoleEditorOpen(false);
  }, []);

  const closeMemberEditor = useCallback(() => {
    setIsMemberEditorOpen(false);
  }, []);

  return {
    activeTab,
    setActiveTab,
    isRoleEditorOpen,
    selectedRole,
    isMemberEditorOpen,
    selectedMember,
    handleEditRole,
    handleCreateRole,
    handleEditMember,
    closeRoleEditor,
    closeMemberEditor,
  };
}

