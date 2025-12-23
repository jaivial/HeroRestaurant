// src/pages/MenuCreator/hooks/useStep2Structure.ts
import { useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import { currentMenuAtom } from '../../../atoms/menuCreatorAtoms';
import type { MenuSection } from '../types';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export function useStep2Structure() {
  const [menu, setMenu] = useAtom(currentMenuAtom);

  useEffect(() => {
    if (menu && (!menu.sections || menu.sections.length === 0)) {
      setMenu(prev => {
        if (!prev || (prev.sections && prev.sections.length > 0)) return prev;
        return {
          ...prev,
          sections: [
            { id: crypto.randomUUID(), name: 'Appetizers', displayOrder: 0, dishes: [] },
            { id: crypto.randomUUID(), name: 'Main Course', displayOrder: 1, dishes: [] },
            { id: crypto.randomUUID(), name: 'Desserts', displayOrder: 2, dishes: [] },
          ]
        };
      });
    }
  }, [menu, setMenu]);

  const addSection = useCallback((name: string) => {
    if (!name.trim()) return;
    const newSection: MenuSection = {
      id: crypto.randomUUID(),
      name,
      displayOrder: (menu?.sections?.length || 0),
      dishes: []
    };
    setMenu(prev => ({
      ...prev!,
      sections: [...(prev?.sections || []), newSection]
    }));
  }, [menu?.sections?.length, setMenu]);

  const removeSection = useCallback((id: string) => {
    setMenu(prev => ({
      ...prev!,
      sections: (prev?.sections || []).filter(s => s.id !== id)
    }));
  }, [setMenu]);

  const moveSection = useCallback((index: number, direction: 'up' | 'down') => {
    setMenu(prev => {
      if (!prev?.sections) return prev;
      const newSections = [...prev.sections];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newSections.length) return prev;
      [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
      return { ...prev, sections: newSections.map((s, i) => ({ ...s, displayOrder: i })) };
    });
  }, [setMenu]);

  const updateSectionName = useCallback((id: string, name: string) => {
    setMenu(prev => ({
      ...prev!,
      sections: (prev?.sections || []).map(s => s.id === id ? { ...s, name } : s)
    }));
  }, [setMenu]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMenu((prev) => {
        if (!prev?.sections) return prev;
        const oldIndex = prev.sections.findIndex((s) => s.id === active.id);
        const newIndex = prev.sections.findIndex((s) => s.id === over.id);
        return { 
          ...prev, 
          sections: arrayMove(prev.sections, oldIndex, newIndex).map((s, i) => ({ ...s, displayOrder: i })) 
        };
      });
    }
  }, [setMenu]);

  const updateInclusions = useCallback((updates: { drinkIncluded?: boolean, coffeeIncluded?: boolean }) => {
    setMenu(prev => ({ ...prev!, ...updates }));
  }, [setMenu]);

  return {
    menu,
    addSection,
    removeSection,
    moveSection,
    updateSectionName,
    handleDragEnd,
    updateInclusions,
  };
}

