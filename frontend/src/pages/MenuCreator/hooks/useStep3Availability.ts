// src/pages/MenuCreator/hooks/useStep3Availability.ts
import { useCallback } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { currentMenuAtom, restaurantSettingsAtom } from '../../../atoms/menuCreatorAtoms';

export function useStep3Availability() {
  const [menu, setMenu] = useAtom(currentMenuAtom);
  const settings = useAtomValue(restaurantSettingsAtom);

  const toggleDay = useCallback((meal: 'breakfast' | 'lunch' | 'dinner', dayId: string) => {
    setMenu(prev => {
      if (!prev) return prev;
      const availability = prev.availability || { breakfast: [], lunch: [], dinner: [] };
      const currentDays = availability[meal] || [];
      const newDays = currentDays.includes(dayId)
        ? currentDays.filter(d => d !== dayId)
        : [...currentDays, dayId];
      
      return {
        ...prev,
        availability: { ...availability, [meal]: newDays }
      };
    });
  }, [setMenu]);

  const toggleMealCompletely = useCallback((meal: 'breakfast' | 'lunch' | 'dinner', enabled: boolean) => {
    setMenu(prev => {
      if (!prev) return prev;
      const availability = prev.availability || { breakfast: [], lunch: [], dinner: [] };
      
      // Default to all days if openingDays is missing
      const defaultDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      const targetDays = enabled ? (settings?.openingDays || defaultDays) : [];
      
      return {
        ...prev,
        availability: {
          ...availability,
          [meal]: targetDays
        }
      };
    });
  }, [setMenu, settings?.openingDays]);

  return {
    menu,
    settings,
    toggleDay,
    toggleMealCompletely,
  };
}

