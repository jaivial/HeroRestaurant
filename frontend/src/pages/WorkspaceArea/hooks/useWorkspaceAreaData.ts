import { useState, useCallback, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { currentWorkspaceAtom } from '@/atoms/workspaceAtoms';
import { useWSRequest } from '@/hooks/useWSRequest';
import type { WorkspaceStats } from '../types';
import type { Menu } from '@/pages/MenuCreator/types';

export function useWorkspaceAreaData() {
  const workspace = useAtomValue(currentWorkspaceAtom);
  const [stats, setStats] = useState<WorkspaceStats>({
    activeMenus: 0,
    totalMenus: 0,
    totalMembers: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const { execute: fetchMenus } = useWSRequest<any, Menu[]>('menu', 'list');
  const { execute: fetchMembers } = useWSRequest<any, { members: any[] }>('member', 'list');

  const loadData = useCallback(async () => {
    if (!workspace?.id) return;
    setIsLoading(true);
    try {
      const [menus, membersData] = await Promise.all([
        fetchMenus({ restaurantId: workspace.id }),
        fetchMembers({ restaurantId: workspace.id }),
      ]);

      setStats({
        activeMenus: menus?.filter(m => m.isActive).length ?? 0,
        totalMenus: menus?.length ?? 0,
        totalMembers: membersData?.members?.length ?? 0,
      });
    } catch (error) {
      console.error('Failed to load workspace stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [workspace?.id, fetchMenus, fetchMembers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    workspace,
    stats,
    isLoading,
    refetch: loadData,
  };
}
