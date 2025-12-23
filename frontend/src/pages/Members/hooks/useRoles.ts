import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { rolesAtom, rolesLoadingAtom, type Role } from '@/atoms/memberAtoms';
import { useWSRequest, useWSMutation } from '@/hooks/useWSRequest';
import { useParams } from 'react-router-dom';

export function useRoles() {
  const { workspaceId } = useParams();
  const [roles, setRoles] = useAtom(rolesAtom);
  const [isLoading, setIsLoading] = useAtom(rolesLoadingAtom);
  
  const { execute: fetchRolesRequest } = useWSRequest<{ restaurantId: string }, { roles: Role[] }>('role', 'list');
  const { mutate: createRoleMutation } = useWSMutation('role', 'create');
  const { mutate: updateRoleMutation } = useWSMutation('role', 'update');
  const { mutate: deleteRoleMutation } = useWSMutation('role', 'delete');

  const fetchRoles = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    try {
      const data = await fetchRolesRequest({ restaurantId: workspaceId });
      if (data) {
        setRoles(data.roles);
      }
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, fetchRolesRequest, setIsLoading, setRoles]);

  const createRole = useCallback(async (data: { name: string; description?: string; permissions: string; displayOrder: number; color?: string }) => {
    if (!workspaceId) return;
    const result = await createRoleMutation({ restaurantId: workspaceId, ...data });
    if (result) {
      await fetchRoles();
    }
    return result;
  }, [workspaceId, createRoleMutation, fetchRoles]);

  const updateRole = useCallback(async (roleId: string, data: { name?: string; description?: string; permissions?: string; displayOrder?: number; color?: string }) => {
    if (!workspaceId) return;
    const result = await updateRoleMutation({ restaurantId: workspaceId, roleId, ...data });
    if (result) {
      await fetchRoles();
    }
    return result;
  }, [workspaceId, updateRoleMutation, fetchRoles]);

  const deleteRole = useCallback(async (roleId: string) => {
    if (!workspaceId) return;
    const result = await deleteRoleMutation({ restaurantId: workspaceId, roleId });
    if (result) {
      await fetchRoles();
    }
    return result;
  }, [workspaceId, deleteRoleMutation, fetchRoles]);

  return {
    roles,
    isLoading,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  };
}

