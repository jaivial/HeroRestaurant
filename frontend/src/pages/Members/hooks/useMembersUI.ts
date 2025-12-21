import { useState, useCallback } from 'react';
import type { MembersTab } from '../types';
import type { Member, Role } from '@/atoms/memberAtoms';

export function useMembersUI() {
  const [activeTab, setActiveTab] = useState<MembersTab>('members');
  
  const [isRoleEditorOpen, setIsRoleEditorOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  const [isMemberEditorOpen, setIsMemberEditorOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [isMemberDetailOpen, setIsMemberDetailOpen] = useState(false);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<Member | null>(null);

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

  const handleViewMember = useCallback((member: Member) => {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/827a7c12-9c88-49e1-8128-1dae51d828e7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useMembersUI.ts:33',message:'handleViewMember called',data:{memberId:member?.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    setSelectedMemberDetail(member);
    setIsMemberDetailOpen(true);
  }, []);

  const closeRoleEditor = useCallback(() => {
    setIsRoleEditorOpen(false);
  }, []);

  const closeMemberEditor = useCallback(() => {
    setIsMemberEditorOpen(false);
  }, []);

  const closeMemberDetail = useCallback(() => {
    setIsMemberDetailOpen(false);
  }, []);

  return {
    activeTab,
    setActiveTab,
    isRoleEditorOpen,
    selectedRole,
    isMemberEditorOpen,
    selectedMember,
    isMemberDetailOpen,
    selectedMemberDetail,
    handleEditRole,
    handleCreateRole,
    handleEditMember,
    handleViewMember,
    closeRoleEditor,
    closeMemberEditor,
    closeMemberDetail,
  };
}

