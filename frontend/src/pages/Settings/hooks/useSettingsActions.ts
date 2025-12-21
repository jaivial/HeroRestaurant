import { useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { currentWorkspaceAtom } from '@/atoms/workspaceAtoms';
import { useWSMutation } from '@/hooks/useWSRequest';
import { useToast } from '@/components/ui/Toast';
import type { Workspace } from '@/types';

export function useSettingsActions() {
  const setCurrentWorkspace = useSetAtom(currentWorkspaceAtom);
  const { addToast } = useToast();

  const { mutate: updateWorkspaceOnServer, isLoading: isUpdating } = useWSMutation<any, { restaurant: Workspace }>(
    'restaurant',
    'update'
  );

  const updateWorkspace = useCallback(async (data: Partial<Workspace>) => {
    if (!data.id) return;

    try {
      const response = await updateWorkspaceOnServer({
        restaurantId: data.id,
        ...data,
      });

      if (response?.restaurant) {
        setCurrentWorkspace(response.restaurant);
        addToast({ title: 'Workspace updated successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Failed to update workspace:', error);
      addToast({ title: 'Failed to update workspace', type: 'error' });
    }
  }, [updateWorkspaceOnServer, setCurrentWorkspace, addToast]);

  return {
    updateWorkspace,
    isUpdating,
  };
}
