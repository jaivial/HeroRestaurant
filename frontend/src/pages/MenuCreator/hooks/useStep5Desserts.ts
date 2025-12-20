// src/pages/MenuCreator/hooks/useStep5Desserts.ts
import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { currentMenuAtom } from '../../../atoms/menuCreatorAtoms';

export function useStep5Desserts() {
  const menu = useAtomValue(currentMenuAtom);
  const [dessertSource, setDessertSource] = useState<'internal' | 'external'>('internal');

  return {
    menu,
    dessertSource,
    setDessertSource,
  };
}

