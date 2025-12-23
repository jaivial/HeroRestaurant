// src/pages/MenuCreator/hooks/useStep4Dishes.ts
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useAtom } from 'jotai';
import { currentMenuAtom } from '../../../atoms/menuCreatorAtoms';
import { uploadService } from '../../../services/upload.service';
import type { Dish } from '../types';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export function useStep4Dishes() {
  const [menu, setMenu] = useAtom(currentMenuAtom);
  const [editingDishInfo, setEditingDishInfo] = useState<{ sectionId: string, dishId: string } | null>(null);
  const [showAllergenModal, setShowAllergenModal] = useState(false);
  const [uploadingDishId, setUploadingDishId] = useState<string | null>(null);

  useEffect(() => {
    if (!menu?.sections) return;
    const needsUpdate = menu.sections.some(s => s.dishes.length === 0);
    if (needsUpdate) {
      setMenu(prev => {
        if (!prev?.sections) return prev;
        const newSections = prev.sections.map(s => {
          if (s.dishes.length === 0) {
            return {
              ...s,
              dishes: [{
                id: crypto.randomUUID(),
                sectionId: s.id,
                title: '',
                showImage: false,
                showDescription: true,
                openModal: false,
                hasSupplement: false,
                allergens: [],
                displayOrder: 0
              }]
            };
          }
          return s;
        });
        return { ...prev, sections: newSections };
      });
    }
  }, [menu, setMenu]);

  const updateDish = useCallback((sectionId: string, dishId: string, updates: Partial<Dish>) => {
    setMenu(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections?.map(s => s.id === sectionId ? {
          ...s,
          dishes: s.dishes.map(d => d.id === dishId ? { ...d, ...updates } : d)
        } : s)
      };
    });
  }, [setMenu]);

  const handleImageUpload = useCallback(async (sectionId: string, dishId: string, file: File) => {
    try {
      setUploadingDishId(dishId);
      const { url } = await uploadService.uploadImage(file);
      updateDish(sectionId, dishId, { imageUrl: url, showImage: true });
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setUploadingDishId(null);
    }
  }, [updateDish]);

  const addDish = useCallback((sectionId: string) => {
    setMenu(prev => {
      if (!prev) return prev;
      const section = prev.sections?.find(s => s.id === sectionId);
      const lastDish = section?.dishes[section.dishes.length - 1];
      const newDish: Dish = {
        id: crypto.randomUUID(),
        sectionId,
        title: '',
        showImage: lastDish ? lastDish.showImage : false,
        showDescription: true,
        openModal: false,
        hasSupplement: false,
        allergens: [],
        displayOrder: section?.dishes.length || 0
      };
      return {
        ...prev,
        sections: prev.sections?.map(s => s.id === sectionId ? { ...s, dishes: [...s.dishes, newDish] } : s)
      };
    });
  }, [setMenu]);

  const removeDish = useCallback((sectionId: string, dishId: string) => {
    setMenu(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections?.map(s => s.id === sectionId ? {
          ...s,
          dishes: s.dishes.filter(d => d.id !== dishId)
        } : s)
      };
    });
  }, [setMenu]);

  const moveDish = useCallback((sectionId: string, index: number, direction: 'up' | 'down') => {
    setMenu(prev => {
      if (!prev) return prev;
      const section = prev.sections?.find(s => s.id === sectionId);
      if (!section) return prev;
      const newDishes = [...section.dishes];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newDishes.length) return prev;
      [newDishes[index], newDishes[targetIndex]] = [newDishes[targetIndex], newDishes[index]];
      return {
        ...prev,
        sections: prev.sections?.map(s => s.id === sectionId ? { 
          ...s, 
          dishes: newDishes.map((d, i) => ({ ...d, displayOrder: i })) 
        } : s)
      };
    });
  }, [setMenu]);

  const toggleAllergen = useCallback((allergenId: string) => {
    if (!editingDishInfo) return;
    const { sectionId, dishId } = editingDishInfo;
    setMenu(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections?.map(s => s.id === sectionId ? {
          ...s,
          dishes: s.dishes.map(d => {
            if (d.id !== dishId) return d;
            let newAllergens: string[];
            if (allergenId === 'none') {
              newAllergens = ['none'];
            } else {
              const current = d.allergens.filter(a => a !== 'none');
              newAllergens = current.includes(allergenId) 
                ? current.filter(a => a !== allergenId)
                : [...current, allergenId];
            }
            return { ...d, allergens: newAllergens };
          })
        } : s)
      };
    });
  }, [editingDishInfo, setMenu]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMenu((prev) => {
        if (!prev?.sections) return prev;
        const sectionIndex = prev.sections.findIndex(s => s.dishes.some(d => d.id === active.id));
        if (sectionIndex === -1) return prev;
        const section = prev.sections[sectionIndex];
        const oldIndex = section.dishes.findIndex((d) => d.id === active.id);
        const newIndex = section.dishes.findIndex((d) => d.id === over.id);
        if (newIndex === -1) return prev;
        const newDishes = arrayMove(section.dishes, oldIndex, newIndex).map((d, i) => ({ ...d, displayOrder: i }));
        const newSections = [...prev.sections];
        newSections[sectionIndex] = { ...section, dishes: newDishes };
        return { ...prev, sections: newSections };
      });
    }
  }, [setMenu]);

  const currentEditingDish = useMemo(() => {
    if (!editingDishInfo || !menu) return null;
    return menu.sections
      ?.find(s => s.id === editingDishInfo.sectionId)
      ?.dishes.find(d => d.id === editingDishInfo.dishId) || null;
  }, [editingDishInfo, menu]);

  return {
    menu,
    editingDishInfo,
    showAllergenModal,
    uploadingDishId,
    setEditingDishInfo,
    setShowAllergenModal,
    addDish,
    updateDish,
    removeDish,
    moveDish,
    toggleAllergen,
    handleImageUpload,
    handleDragEnd,
    currentEditingDish,
  };
}

