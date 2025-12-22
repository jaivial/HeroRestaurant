import { useEffect, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { currentUserPriorityAtom, canManageMembersAtom, canManageRolesAtom } from '@/atoms/permissionAtoms';
import { useMembers } from './hooks/useMembers';
import { useRoles } from './hooks/useRoles';
import { useMembersUI } from './hooks/useMembersUI';
import { useMemberFilters } from './hooks/useMemberFilters';
import { MembersList } from './components/MembersList/MembersList';
import { MemberFilters } from './components/MembersList/ui/MemberFilters';
import { RolesList } from './components/RolesList/RolesList';
import { RoleEditor } from './components/RoleEditor/RoleEditor';
import { MemberEditor } from './components/MemberEditor/MemberEditor';
import { MemberDetailModal } from './components/MemberDetail/MemberDetailModal';
import { InviteMemberModal } from './components/InviteMemberModal/InviteMemberModal';
import { Container, Heading, Text, Button, Tabs, TabsList, TabsTrigger } from '@/components/ui';
import { cn } from '@/utils/cn';

export function Members() {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';
  const { members, isLoading: membersLoading, fetchMembers, updateMember } = useMembers();
  const { roles, isLoading: rolesLoading, fetchRoles, createRole, updateRole } = useRoles();
  const currentUserPriority = useAtomValue(currentUserPriorityAtom);
  const canManageMembers = useAtomValue(canManageMembersAtom);
  const canManageRoles = useAtomValue(canManageRolesAtom);

  const {
    filters,
    updateFilter,
    resetFilters,
    filteredMembers
  } = useMemberFilters(members);

  const {
    activeTab,
    setActiveTab,
    isRoleEditorOpen,
    selectedRole,
    isMemberEditorOpen,
    selectedMember,
    isMemberDetailOpen,
    selectedMemberDetail,
    isInviteModalOpen,
    handleEditRole,
    handleCreateRole,
    handleEditMember,
    handleViewMember,
    handleOpenInviteModal,
    closeRoleEditor,
    closeMemberEditor,
    closeMemberDetail,
    closeInviteModal,
  } = useMembersUI();

  useEffect(() => {
    fetchMembers();
    fetchRoles();
  }, [fetchMembers, fetchRoles]);

  const tabs = useMemo(() => [
    { id: 'members', label: 'Members' },
    { id: 'roles', label: 'Roles', hidden: !canManageRoles && roles.length === 0 },
  ].filter(t => !t.hidden), [canManageRoles, roles.length]);

  return (
    <Container className="py-12 animate-fade-in max-w-[1400px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-1">
          <Heading level={1} className="text-[34px] font-bold tracking-tight text-apple-blue leading-tight">Workspace Members</Heading>
          <Text variant="body" color="tertiary" className="text-[17px] opacity-80">Manage people and their roles in this workspace.</Text>
        </div>
        
        <div className="flex items-center gap-3">
          {activeTab === 'members' && canManageMembers && (
            <Button 
              onClick={handleOpenInviteModal}
              className="rounded-[1rem] h-11 shadow-apple-md font-bold px-8 transition-all active:scale-95"
            >
              Invite Member
            </Button>
          )}

          {activeTab === 'roles' && canManageRoles && (
            <Button 
              onClick={handleCreateRole}
              className="rounded-[1rem] h-11 shadow-apple-md font-bold px-8 transition-all active:scale-95"
            >
              Create Role
            </Button>
          )}
        </div>
      </div>

      <div className="mb-10 flex justify-start">
        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onChange={(id) => setActiveTab(id as any)}
        >
          <TabsList variant="glass" className={cn(
            "p-1.5 rounded-2xl border backdrop-blur-xl saturate-[180%]",
            isDark ? "bg-white/5 border-white/10" : "bg-black/[0.03] border-black/[0.05]"
          )}>
            {tabs.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className={cn(
                  "px-8 py-2.5 text-[15px] font-bold transition-all duration-300 rounded-xl",
                  "data-[state=active]:shadow-apple-sm data-[state=active]:scale-[1.02]",
                  isDark 
                    ? "data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50" 
                    : "data-[state=active]:bg-white data-[state=active]:text-black text-black/40"
                )}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {activeTab === 'members' && (
        <MemberFilters
          search={filters.search}
          onSearchChange={(val) => updateFilter('search', val)}
          roleId={filters.roleId}
          onRoleChange={(val) => updateFilter('roleId', val)}
          status={filters.status}
          onStatusChange={(val) => updateFilter('status', val)}
          roles={roles}
          onReset={resetFilters}
        />
      )}

      {activeTab === 'members' ? (
        <MembersList 
          members={filteredMembers} 
          isLoading={membersLoading} 
          currentUserPriority={currentUserPriority}
          onEdit={handleEditMember}
          onView={handleViewMember}
          onRemove={(member) => {
             // We need to pass this too!
             console.log('Remove member', member);
          }}
        />
      ) : (
        <RolesList 
          roles={roles} 
          isLoading={rolesLoading} 
          currentUserPriority={currentUserPriority}
          onEdit={handleEditRole}
        />
      )}

      <RoleEditor
        isOpen={isRoleEditorOpen}
        onClose={closeRoleEditor}
        onSave={async (data) => {
          if (selectedRole) {
            await updateRole(selectedRole.id, data);
          } else {
            await createRole(data);
          }
        }}
        role={selectedRole}
        currentUserPriority={currentUserPriority}
      />

      <MemberEditor
        isOpen={isMemberEditorOpen}
        onClose={closeMemberEditor}
        onSave={async (memberId, data) => {
          await updateMember(memberId, data);
        }}
        member={selectedMember}
        roles={roles}
        currentUserPriority={currentUserPriority}
      />

      <MemberDetailModal
        isOpen={isMemberDetailOpen}
        onClose={closeMemberDetail}
        member={selectedMemberDetail}
      />

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={closeInviteModal}
      />
    </Container>
  );
}
