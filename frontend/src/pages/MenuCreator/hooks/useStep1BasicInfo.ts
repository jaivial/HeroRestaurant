// src/pages/MenuCreator/hooks/useStep1BasicInfo.ts
import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { currentMenuAtom } from '../../../atoms/menuCreatorAtoms';
import type { MenuType } from '../types';

export function useStep1BasicInfo() {
  const [menu, setMenu] = useAtom(currentMenuAtom);

  const updateTitle = useCallback((title: string) => {
    setMenu(prev => prev ? { ...prev, title } : null);
  }, [setMenu]);

  const updateType = useCallback((type: MenuType) => {
    setMenu(prev => prev ? { ...prev, type } : null);
  }, [setMenu]);

  const updatePrice = useCallback((price: number) => {
    setMenu(prev => prev ? { ...prev, price } : null);
  }, [setMenu]);

  return {
    menu,
    updateTitle,
    updateType,
    updatePrice,
  };
}

