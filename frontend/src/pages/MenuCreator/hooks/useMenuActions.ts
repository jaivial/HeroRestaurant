// src/pages/MenuCreator/hooks/useMenuActions.ts
import { useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { useParams } from 'react-router-dom';
import { wsClient } from '../../../websocket';
import { 
  menusAtom, 
  isAddingMenuAtom, 
  onboardingStepAtom, 
  currentMenuAtom 
} from '../../../atoms/menuCreatorAtoms';
import type { MenuActions, Menu } from '../types';

export function useMenuActions(): MenuActions {
  const { workspaceId } = useParams();
  const setMenus = useSetAtom(menusAtom);
  const setIsAdding = useSetAtom(isAddingMenuAtom);
  const setStep = useSetAtom(onboardingStepAtom);
  const setCurrentMenu = useSetAtom(currentMenuAtom);

  const startNewMenu = useCallback(() => {
    setIsAdding(true);
    setStep(1);
    setCurrentMenu({
      id: '', // Will be set by server on creation, but needed for type
      title: '',
      type: 'fixed_price',
      isActive: false,
      drinkIncluded: false,
      coffeeIncluded: false,
      sections: [],
      availability: { breakfast: [], lunch: [], dinner: [] }
    });
  }, [setIsAdding, setStep, setCurrentMenu]);

  const cancelNewMenu = useCallback(() => {
    setIsAdding(false);
    setStep(1);
    setCurrentMenu(null);
  }, [setIsAdding, setStep, setCurrentMenu]);

  const toggleMenuStatus = useCallback(async (menuId: string, isActive: boolean) => {
    try {
      await wsClient.request('menu', 'update', { menuId, isActive });
      setMenus(prev => prev.map(m => m.id === menuId ? { ...m, isActive } : m));
    } catch (error) {
      console.error('Failed to toggle menu status:', error);
    }
  }, [setMenus]);

  const refreshMenus = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const response = await wsClient.request<Menu[]>('menu', 'list', { restaurantId: workspaceId });
      setMenus(response);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    }
  }, [workspaceId, setMenus]);

  return {
    startNewMenu,
    cancelNewMenu,
    toggleMenuStatus,
    refreshMenus,
  };
}

