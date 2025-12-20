import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { membersAtom, membersLoadingAtom } from '@/atoms/memberAtoms';
import { useWSRequest, useWSMutation } from '@/hooks/useWSRequest';
import { useParams } from 'react-router-dom';

export function useMembers() {
  const { workspaceId } = useParams();
  const [members, setMembers] = useAtom(membersAtom);
  const [isLoading, setIsLoading] = useAtom(membersLoadingAtom);
  
  const { execute: fetchMembersRequest } = useWSRequest<any, { members: any[] }>('member', 'list');
  const { mutate: inviteMemberMutation } = useWSMutation('member', 'invite');
  const { mutate: updateMemberMutation } = useWSMutation('member', 'update');
  const { mutate: removeMemberMutation } = useWSMutation('member', 'remove');

  const fetchMembers = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    try {
      const data = await fetchMembersRequest({ restaurantId: workspaceId });
      if (data) {
        setMembers(data.members);
      }
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, fetchMembersRequest, setIsLoading, setMembers]);

  const inviteMember = useCallback(async (email: string, roleId?: string) => {
    if (!workspaceId) return;
    const data = await inviteMemberMutation({ restaurantId: workspaceId, email, roleId });
    if (data) {
      await fetchMembers();
    }
    return data;
  }, [workspaceId, inviteMemberMutation, fetchMembers]);

  const updateMember = useCallback(async (memberId: string, data: { roleId?: string; accessFlags?: string; status?: string }) => {
    if (!workspaceId) return;
    const result = await updateMemberMutation({ restaurantId: workspaceId, memberId, ...data });
    if (result) {
      await fetchMembers();
    }
    return result;
  }, [workspaceId, updateMemberMutation, fetchMembers]);

  const removeMember = useCallback(async (memberId: string) => {
    if (!workspaceId) return;
    const result = await removeMemberMutation({ restaurantId: workspaceId, memberId });
    if (result) {
      await fetchMembers();
    }
    return result;
  }, [workspaceId, removeMemberMutation, fetchMembers]);

  return {
    members,
    isLoading,
    fetchMembers,
    inviteMember,
    updateMember,
    removeMember,
  };
}

