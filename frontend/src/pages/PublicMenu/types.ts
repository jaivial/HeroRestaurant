// src/pages/PublicMenu/types.ts

// ─── Public Menu Types ───────────────────────────────────────────

export interface PublicMenuDish {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  showImage: boolean;
  showDescription: boolean;
  hasSupplement: boolean;
  supplementPrice: number | null;
  allergens: string[];
  displayOrder: number;
}

export interface PublicMenuSection {
  id: string;
  name: string;
  displayOrder: number;
  dishes: PublicMenuDish[];
}

export interface PublicMenuData {
  id: string;
  title: string;
  type: 'fixed_price' | 'open_menu';
  price: number | null;
  isActive: boolean;
  drinkIncluded: boolean;
  coffeeIncluded: boolean;
  sections: PublicMenuSection[];
  restaurant: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
}

export interface PublicMenuResponse {
  success: boolean;
  data?: PublicMenuData;
  error?: {
    code: string;
    message: string;
  };
}

// ─── Component Props ──────────────────────────────────────────────

export interface PublicMenuProps {}

export interface MenuHeaderProps {
  restaurantName: string;
  logoUrl: string | null;
  menuTitle: string;
  type: 'fixed_price' | 'open_menu';
  price: number | null;
  drinkIncluded: boolean;
  coffeeIncluded: boolean;
}

export interface MenuSectionProps {
  section: PublicMenuSection;
  index: number;
  total: number;
}

export interface DishCardProps {
  dish: PublicMenuDish;
}

export interface AllergenTagProps {
  allergenId: string;
  name: string;
  icon: string;
}

export interface MenuLoadingProps {}

export interface MenuErrorProps {
  error: string;
  onRetry?: () => void;
}

export interface MenuInactiveProps {
  restaurantName: string;
}

export interface MenuNotFoundProps {}
