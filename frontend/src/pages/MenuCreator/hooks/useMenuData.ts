// src/pages/MenuCreator/hooks/useMenuData.ts
import { useCallback, useEffect, useState } from 'react';
import { useAtomValue, useAtom } from 'jotai';
import { useParams } from 'react-router-dom';
import { wsClient } from '../../../websocket';
import { 
  menusAtom, 
  isAddingMenuAtom, 
  onboardingStepAtom, 
  menuStatsAtom 
} from '../../../atoms/menuCreatorAtoms';
import type { Menu, MenuData } from '../types';

export function useMenuData(): MenuData {
  const { workspaceId } = useParams();
  const [menus, setMenus] = useAtom(menusAtom);
  const isAdding = useAtomValue(isAddingMenuAtom);
  const onboardingStep = useAtomValue(onboardingStepAtom);
  const stats = useAtomValue(menuStatsAtom);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMenus = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    try {
      const response = await wsClient.request<Menu[]>('menu', 'list', { restaurantId: workspaceId });
      setMenus(response);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, setMenus]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  return {
    menus,
    stats,
    isAdding,
    onboardingStep,
    isLoading,
  };
}

