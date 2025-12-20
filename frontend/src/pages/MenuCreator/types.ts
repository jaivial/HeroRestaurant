// src/pages/MenuCreator/types.ts

// ─── Base Types ───────────────────────────────────────────────

export const ALLERGENS: Allergen[] = [
  { id: 'gluten', name: 'Gluten', icon: '🌾' },
  { id: 'crustaceans', name: 'Crustaceans', icon: '🦐' },
  { id: 'eggs', name: 'Eggs', icon: '🥚' },
  { id: 'fish', name: 'Fish', icon: '🐟' },
  { id: 'peanuts', name: 'Peanuts', icon: '🥜' },
  { id: 'soy', name: 'Soy', icon: '🫘' },
  { id: 'milk', name: 'Milk', icon: '🥛' },
  { id: 'nuts', name: 'Nuts', icon: '🌰' },
  { id: 'celery', name: 'Celery', icon: '🌿' },
  { id: 'mustard', name: 'Mustard', icon: '🍯' },
  { id: 'sesame', name: 'Sesame', icon: '🍳' },
  { id: 'sulphites', name: 'Sulphites', icon: '🍷' },
  { id: 'lupin', name: 'Lupin', icon: '🌸' },
  { id: 'molluscs', name: 'Molluscs', icon: '🐚' },
  { id: 'none', name: 'No Allergens', icon: '✅' },
];

export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export type MenuType = 'fixed_price' | 'open_menu';

export interface Allergen {
  id: string;
  name: string;
  icon: string;
}

export interface Dish {
  id: string;
  sectionId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  showImage: boolean;
  showDescription: boolean;
  openModal: boolean;
  hasSupplement: boolean;
  supplementPrice?: number;
  allergens: string[];
  displayOrder: number;
}

export interface MenuSection {
  id: string;
  name: string;
  displayOrder: number;
  dishes: Dish[];
}

export interface Menu {
  id: string;
  title: string;
  type: MenuType;
  price?: number;
  isActive: boolean;
  drinkIncluded: boolean;
  coffeeIncluded: boolean;
  availability: {
    breakfast: string[]; // days
    lunch: string[];
    dinner: string[];
  };
  sections: MenuSection[];
}

export interface RestaurantSettings {
  openingDays: string[];
  mealSchedules: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
}

export interface MenuCreatorStats {
  totalMenus: number;
  activeMenus: number;
  fixedPriceCount: number;
  openMenuCount: number;
}

// ─── Component Props ──────────────────────────────────────────

export interface MenuCreatorProps {}

export interface MenuDashboardProps {
  menus: Menu[];
  stats: MenuCreatorStats;
  onAddMenu: () => void;
  onToggleStatus: (id: string, active: boolean) => void;
}

export interface MenuOnboardingProps {
  step: OnboardingStep;
  onCancel: () => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
}

export interface StepProps {
  // Common step props if needed
}

export interface StatsSectionProps {
  stats: MenuCreatorStats;
}

export interface MenusListProps {
  menus: Menu[];
  onAddMenu: () => void;
  onToggleStatus: (id: string, active: boolean) => void;
}

export interface MenuCardProps {
  menu: Menu;
  onToggleStatus: (id: string, active: boolean) => void;
}

export interface SortableSectionProps {
  section: MenuSection;
  index: number;
  total: number;
  onRemove: (id: string) => void;
  onUpdateName: (id: string, name: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
}

export interface SortableDishProps {
  dish: Dish;
  index: number;
  sectionId: string;
  total: number;
  onUpdate: (sectionId: string, dishId: string, updates: Partial<Dish>) => void;
  onRemove: (sectionId: string, dishId: string) => void;
  onMove: (sectionId: string, index: number, direction: 'up' | 'down') => void;
  onEditAllergens: (sectionId: string, dish: Dish) => void;
  onImageUpload: (sectionId: string, dishId: string, file: File) => void;
  uploadingDishId: string | null;
}

export interface AllergenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleAllergen: (allergenId: string) => void;
  selectedAllergens: string[];
}

// ─── Hook Return Types ────────────────────────────────────────

export interface MenuData {
  menus: Menu[];
  stats: MenuCreatorStats;
  isAdding: boolean;
  onboardingStep: OnboardingStep;
  isLoading: boolean;
}

export interface MenuActions {
  startNewMenu: () => void;
  cancelNewMenu: () => void;
  toggleMenuStatus: (menuId: string, isActive: boolean) => Promise<void>;
  refreshMenus: () => Promise<void>;
}

export interface MenuOnboardingData {
  menu: Partial<Menu> | null;
  step: OnboardingStep;
  isValid: boolean;
  isSubmitting: boolean;
}

export interface MenuOnboardingActions {
  nextStep: () => void;
  prevStep: () => void;
  updateMenu: (updates: Partial<Menu>) => void;
  finishOnboarding: () => Promise<void>;
}
