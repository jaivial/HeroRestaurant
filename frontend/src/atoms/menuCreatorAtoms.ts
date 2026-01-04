// src/atoms/menuCreatorAtoms.ts
import { atom } from 'jotai';
import type { Menu, OnboardingStep, RestaurantSettings } from '../pages/MenuCreator/types';

export const menusAtom = atom<Menu[]>([]);
export const currentMenuAtom = atom<Partial<Menu> | null>(null);
export const onboardingStepAtom = atom<OnboardingStep>(1);
export const isAddingMenuAtom = atom<boolean>(false);
export const editingMenuIdAtom = atom<string | null>(null);
export const restaurantSettingsAtom = atom<RestaurantSettings | null>(null);

export const menuStatsAtom = atom((get) => {
  const menus = get(menusAtom);
  return {
    totalMenus: menus.length,
    activeMenus: menus.filter(m => m.isActive).length,
    fixedPriceCount: menus.filter(m => m.type === 'fixed_price').length,
    openMenuCount: menus.filter(m => m.type === 'open_menu').length,
  };
});
