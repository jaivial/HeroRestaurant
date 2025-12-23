// src/pages/MenuCreator/hooks/useMenuOnboarding.ts
import { useCallback, useMemo } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useParams } from 'react-router-dom';
import { wsClient } from '../../../websocket';
import { 
  onboardingStepAtom, 
  currentMenuAtom, 
  isAddingMenuAtom 
} from '../../../atoms/menuCreatorAtoms';
import type { MenuOnboardingData, MenuOnboardingActions, Menu, OnboardingStep } from '../types';

export function useMenuOnboarding(): MenuOnboardingData & MenuOnboardingActions {
  const { workspaceId } = useParams();
  const [step, setStep] = useAtom(onboardingStepAtom);
  const [menu, setMenu] = useAtom(currentMenuAtom);
  const setIsAdding = useSetAtom(isAddingMenuAtom);

  const isValid = useMemo(() => {
    if (!menu) return false;
    switch (step) {
      case 1:
        return !!menu.title;
      case 2:
        return (menu.sections?.length || 0) > 0;
      case 3:
        return true; // Optional availability
      case 4:
        if (!menu.sections || menu.sections.length === 0) return false;
        return menu.sections.every(s => 
          s.dishes.length > 0 && s.dishes.every(d => d.allergens.length > 0)
        );
      case 5:
        return true;
      default:
        return false;
    }
  }, [menu, step]);

  const nextStep = useCallback(() => {
    if (!isValid) return;
    if (step < 5) {
      setStep((step + 1) as OnboardingStep);
    }
  }, [step, setStep, isValid]);

  const prevStep = useCallback(() => {
    if (step > 1) {
      setStep((step - 1) as OnboardingStep);
    }
  }, [step, setStep]);

  const updateMenu = useCallback((updates: Partial<Menu>) => {
    setMenu(prev => prev ? { ...prev, ...updates } : null);
  }, [setMenu]);

  const finishOnboarding = useCallback(async () => {
    if (!menu || !workspaceId) return;
    try {
      const createdMenu = await wsClient.request<Menu>('menu', 'create', {
        title: menu.title,
        type: menu.type,
        price: menu.price || 0,
        drinkIncluded: !!menu.drinkIncluded,
        coffeeIncluded: !!menu.coffeeIncluded,
        availability: menu.availability || { breakfast: [], lunch: [], dinner: [] },
        restaurantId: workspaceId
      });

      if (menu.sections) {
        for (const section of menu.sections) {
          const createdSection = await wsClient.request<{ id: string }>('section', 'create', {
            menuId: createdMenu.id,
            menuType: menu.type === 'fixed_price' ? 'fixed' : 'open',
            name: section.name,
            displayOrder: section.displayOrder || 0
          });

          for (const dish of section.dishes) {
            await wsClient.request('dish', 'create', {
              sectionId: createdSection.id,
              menuId: createdMenu.id,
              menuType: menu.type === 'fixed_price' ? 'fixed' : 'open',
              title: dish.title,
              description: dish.description || '',
              showImage: !!dish.showImage,
              showDescription: !!dish.showDescription,
              openModal: !!dish.openModal,
              hasSupplement: !!dish.hasSupplement,
              supplementPrice: dish.supplementPrice || 0,
              imageUrl: dish.imageUrl || null,
              allergens: dish.allergens || [],
              displayOrder: dish.displayOrder || 0
            });
          }
        }
      }
      
      setIsAdding(false);
      setStep(1);
      setMenu(null);
    } catch (error) {
      console.error('Failed to create menu:', error);
    }
  }, [menu, workspaceId, setIsAdding, setStep, setMenu]);

  return {
    menu,
    step,
    isValid,
    isSubmitting: false, // Could be handled with local state if needed
    nextStep,
    prevStep,
    updateMenu,
    finishOnboarding,
  };
}

