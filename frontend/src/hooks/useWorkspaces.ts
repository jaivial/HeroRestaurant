import { useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  currentWorkspaceAtom, 
  workspacesAtom, 
  workspaceIdAtom 
} from '@/atoms/workspaceAtoms';
import { useWSRequest } from './useWSRequest';
import type { Workspace } from '@/types';

/**
 * Hook to manage workspaces (restaurants)
 */
export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useAtom(workspacesAtom);
  const [currentWorkspace, setCurrentWorkspace] = useAtom(currentWorkspaceAtom);
  const setWorkspaceId = useSetAtom(workspaceIdAtom);
  const navigate = useNavigate();
  const { workspaceId: urlWorkspaceId } = useParams();

  const { execute: fetchWorkspaces, isLoading: isFetching } = useWSRequest<any, { restaurants: Workspace[] }>(
    'restaurant',
    'list'
  );

  const { execute: selectWorkspaceOnServer } = useWSRequest<{ restaurantId: string }, { success: boolean }>(
    'restaurant',
    'select'
  );

  const loadWorkspaces = useCallback(async () => {
    const response = await fetchWorkspaces();
    if (response?.restaurants) {
      setWorkspaces(response.restaurants);
      
      // If we have a URL workspace ID, find it in the list
      if (urlWorkspaceId) {
        const found = response.restaurants.find(w => w.id === urlWorkspaceId);
        if (found) {
          setCurrentWorkspace(found);
          setWorkspaceId(found.id);
          // Sync with server
          selectWorkspaceOnServer({ restaurantId: found.id });
        }
      } else if (response.restaurants.length > 0) {
        // Fallback to first workspace if none in URL
        const first = response.restaurants[0];
        setCurrentWorkspace(first);
        setWorkspaceId(first.id);
        navigate(`/w/${first.id}/dashboard`, { replace: true });
        // Sync with server
        selectWorkspaceOnServer({ restaurantId: first.id });
      }
    }
  }, [fetchWorkspaces, setWorkspaces, urlWorkspaceId, setCurrentWorkspace, setWorkspaceId, navigate, selectWorkspaceOnServer]);

  const switchWorkspace = useCallback(async (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    setWorkspaceId(workspace.id);
    // Sync with server
    await selectWorkspaceOnServer({ restaurantId: workspace.id });
    // Navigate to new workspace
    navigate(`/w/${workspace.id}/dashboard`);
  }, [setCurrentWorkspace, setWorkspaceId, selectWorkspaceOnServer, navigate]);

  return {
    workspaces,
    currentWorkspace,
    isFetching,
    loadWorkspaces,
    switchWorkspace,
  };
}
