// src/pages/MenuCreator/hooks/useMenuActions.ts
import { useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { useParams } from 'react-router-dom';
import { wsClient } from '../../../websocket';
import { toast } from '../../../components/ui';
import { 
  menusAtom, 
  isAddingMenuAtom, 
  onboardingStepAtom, 
  currentMenuAtom,
  editingMenuIdAtom
} from '../../../atoms/menuCreatorAtoms';
import type { MenuActions, Menu } from '../types';

export function useMenuActions(): MenuActions {
  const { workspaceId } = useParams();
  const setMenus = useSetAtom(menusAtom);
  const setIsAdding = useSetAtom(isAddingMenuAtom);
  const setStep = useSetAtom(onboardingStepAtom);
  const setCurrentMenu = useSetAtom(currentMenuAtom);
  const setEditingMenuId = useSetAtom(editingMenuIdAtom);

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

  const startEditMenu = useCallback(async (menuId: string) => {
    try {
      const fullMenu = await wsClient.request<Menu>('menu', 'get', { menuId });
      setCurrentMenu(fullMenu);
      setEditingMenuId(menuId);
      setIsAdding(true);
      setStep(1);
    } catch (error) {
      console.error('Failed to load menu for editing:', error);
    }
  }, [setCurrentMenu, setEditingMenuId, setIsAdding, setStep]);

  const cancelNewMenu = useCallback(() => {
    setIsAdding(false);
    setStep(1);
    setCurrentMenu(null);
    setEditingMenuId(null);
  }, [setIsAdding, setStep, setCurrentMenu, setEditingMenuId]);

  const toggleMenuStatus = useCallback(async (menuId: string, isActive: boolean) => {
    try {
      await wsClient.request('menu', 'update', { menuId, isActive });
      setMenus(prev => prev.map(m => m.id === menuId ? { ...m, isActive } : m));
    } catch (error) {
      console.error('Failed to toggle menu status:', error);
    }
  }, [setMenus]);

  const deleteMenu = useCallback(async (menuId: string) => {
    try {
      await wsClient.request('menu', 'delete', { menuId });
      setMenus(prev => prev.filter(m => m.id !== menuId));
    } catch (error) {
      console.error('Failed to delete menu:', error);
      throw error;
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

  const copyMenuLink = useCallback(async (menuId: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/menu/${menuId}/short-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to generate short URL');

      const result = await response.json();
      
      if (result.success) {
        await navigator.clipboard.writeText(result.data.shortUrl);
        toast.success('Link copied to clipboard!');
      } else {
        throw new Error(result.error?.message || 'Failed to generate link');
      }
    } catch (error) {
      console.error('Failed to copy menu link:', error);
      toast.error('Failed to copy link. Please try again.');
      throw error;
    }
  }, []);

  return {
    startNewMenu,
    startEditMenu,
    cancelNewMenu,
    toggleMenuStatus,
    deleteMenu,
    refreshMenus,
    copyMenuLink,
  };
}

