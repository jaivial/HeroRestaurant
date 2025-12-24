// src/pages/MenuCreator/hooks/useMenuData.ts
import { useCallback, useEffect, useState } from 'react';
import { useAtomValue, useAtom } from 'jotai';
import { useParams } from 'react-router-dom';
import { wsClient } from '../../../websocket';
import { 
  menusAtom, 
  isAddingMenuAtom, 
  onboardingStepAtom, 
  menuStatsAtom,
  restaurantSettingsAtom
} from '../../../atoms/menuCreatorAtoms';
import { isAuthenticatedWSAtom } from '@/atoms/websocketAtoms';
import type { Menu, MenuData } from '../types';

export function useMenuData(): MenuData {
  const { workspaceId } = useParams();
  const [menus, setMenus] = useAtom(menusAtom);
  const [, setSettings] = useAtom(restaurantSettingsAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedWSAtom);
  const isAdding = useAtomValue(isAddingMenuAtom);
  const onboardingStep = useAtomValue(onboardingStepAtom);
  const stats = useAtomValue(menuStatsAtom);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMenus = useCallback(async () => {
    if (!workspaceId || !isAuthenticated) return;
    setIsLoading(true);
    try {
      const response = await wsClient.request<Menu[]>('menu', 'list', { restaurantId: workspaceId });
      setMenus(response);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, isAuthenticated, setMenus]);

  const fetchSettings = useCallback(async () => {
    if (!workspaceId || !isAuthenticated) return;
    try {
      const response = await wsClient.request<{
        opening_days: string[];
        meal_schedules: {
          breakfast: boolean;
          lunch: boolean;
          dinner: boolean;
        };
      }>('settings', 'get', { restaurantId: workspaceId });
      
      if (response) {
        setSettings({
          openingDays: response.opening_days,
          mealSchedules: response.meal_schedules
        });
      } else {
        // Default settings if none found
        setSettings({
          openingDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
          mealSchedules: { breakfast: true, lunch: true, dinner: true }
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  }, [workspaceId, isAuthenticated, setSettings]);

  useEffect(() => {
    fetchMenus();
    fetchSettings();
  }, [fetchMenus, fetchSettings]);

  return {
    menus,
    stats,
    isAdding,
    onboardingStep,
    isLoading,
  };
}

