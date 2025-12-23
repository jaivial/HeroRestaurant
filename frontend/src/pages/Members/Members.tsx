import { useEffect, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { currentUserPriorityAtom, canManageMembersAtom, canManageRolesAtom } from '@/atoms/permissionAtoms';
import { useMembers } from './hooks/useMembers';
import { useRoles } from './hooks/useRoles';
import { useMembersUI } from './hooks/useMembersUI';
import { MembersList } from './components/MembersList/MembersList';
import { RolesList } from './components/RolesList/RolesList';
import { RoleEditor } from './components/RoleEditor/RoleEditor';
import { MemberEditor } from './components/MemberEditor/MemberEditor';
import { MemberDetailModal } from './components/MemberDetail/MemberDetailModal';
import { Container, Heading, Text, Button, Tabs, TabsList, TabsTrigger } from '@/components/ui';

export function Members() {
  const { members, isLoading: membersLoading, fetchMembers, updateMember } = useMembers();
  const { roles, isLoading: rolesLoading, fetchRoles, createRole, updateRole } = useRoles();
  const currentUserPriority = useAtomValue(currentUserPriorityAtom);
  const canManageMembers = useAtomValue(canManageMembersAtom);
  const canManageRoles = useAtomValue(canManageRolesAtom);

  const {
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
    <Container className="py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Heading level={1} className="text-apple-blue mb-1">Workspace Members</Heading>
          <Text color="tertiary">Manage people and their roles in this workspace.</Text>
        </div>
        
        {activeTab === 'members' && canManageMembers && (
          <Button 
            onClick={() => {/* Open invite modal */}}
            className="rounded-[1rem] shadow-apple-md"
          >
            Invite Member
          </Button>
        )}

        {activeTab === 'roles' && canManageRoles && (
          <Button 
            onClick={handleCreateRole}
            className="rounded-[1rem] shadow-apple-md"
          >
            Create Role
          </Button>
        )}
      </div>

      <div className="mb-8 flex justify-center">
        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onChange={(id) => setActiveTab(id as 'members' | 'roles')}
        >
          <TabsList variant="glass" className="min-w-[240px]">
            {tabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex-1 px-8 py-2.5 text-base">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {activeTab === 'members' ? (
        <MembersList 
          members={members} 
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
          await updateMember(memberId, {
            roleId: data.roleId || undefined,
            status: data.status
          });
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
    </Container>
  );
}
