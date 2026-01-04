# PUBLIC MENU PAGE KNOWLEDGE BASE

**⚠️ MANDATORY:** Follow `../../../../docs/general-rules/frontend-organization.md`

---

## OVERVIEW

Public-facing menu display for customers. Accessible via QR codes or direct links. No authentication required.

**Features:**
- Mobile-first responsive design (QR codes scanned on phones)
- Editorial aesthetic with premium restaurant feel
- Allergen information display
- Dish images and descriptions
- Fixed price and open menu support
- Beautiful loading/error/empty states

**Route:** `/menu/:restaurantSlug/:menuId` (public, no auth guards)

---

## THREE-LAYER STRUCTURE

```
PublicMenu.tsx (Layer 1 - Page)
├── hooks/
│   └── usePublicMenu.ts         # Fetch menu data via REST API
└── components/
    ├── MenuContent.tsx (Layer 2)
    ├── MenuSection.tsx (Layer 2)
    └── ui/ (Layer 3 - UI)
        ├── MenuHeader.tsx       # Restaurant logo, menu title, price
        ├── DishCard.tsx         # Dish with image, description, allergens
        ├── AllergenTag.tsx      # Allergen icon + name badge
        ├── MenuLoading.tsx      # Skeleton loading state
        ├── MenuError.tsx        # Error state with retry
        ├── MenuNotFound.tsx     # 404 menu not found
        ├── MenuInactive.tsx     # Menu exists but inactive
        └── EmptySection.tsx     # No dishes in section
```

---

## API INTEGRATION

### REST Endpoint (NOT WebSocket)
```
GET /api/menu/public/:menuId
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: string,
    title: string,
    type: 'fixed_price' | 'open_menu',
    price: number | null,
    isActive: boolean,
    drinkIncluded: boolean,
    coffeeIncluded: boolean,
    sections: MenuSection[],
    restaurant: {
      id: string,
      name: string,
      slug: string,
      logoUrl: string | null
    }
  }
}
```

### Hook: usePublicMenu
```typescript
const {
  menu,           // PublicMenuData | null
  isLoading,      // boolean
  error,          // string | null
  isNotFound,     // boolean (404)
  isInactive,     // boolean (menu exists but inactive)
  retry,          // () => void
} = usePublicMenu(menuId);
```

---

## DESIGN SYSTEM

### Aesthetic: Editorial + Premium Restaurant

**Characteristics:**
- Clean, magazine-like layout
- Generous whitespace
- Subtle hierarchy with typography
- Apple aesthetic (glass effects, rounded corners)
- Mobile-first (single column, easy scrolling)

### Color Palette

**Light Mode:**
- Background: `#F5F5F7` (Apple gray)
- Cards: `bg-white/90`
- Text: `#1D1D1F` (Apple dark)

**Dark Mode:**
- Background: `#000000` (pure black)
- Cards: `bg-black/30`
- Text: `#FFFFFF`

### Typography Scale
- Menu title: `title1` (28px, semibold)
- Section names: `title2` (22px, bold)
- Dish titles: `headline` (17px, semibold)
- Descriptions: `subheadline` (15px, regular)
- Allergens: `12px` (medium)

### Border Radius
- Cards/Sections: `2.2rem`
- Images: `2.2rem` (top) / integrated into card
- Buttons: `1rem`
- Allergen tags: `full` (pill shape)

### Touch Targets
- Minimum: `44x44px` (WCAG AA)
- Allergen tags: `min-h-[28px]` (readable, not interactive)

---

## COMPONENT DETAILS

### MenuHeader
- Restaurant logo (20x20, rounded)
- Restaurant name (uppercase, small, secondary color)
- Menu title (large, bold)
- Fixed price badge (if applicable)
- Drink/Coffee badges

### DishCard
- Conditional image (16:10 aspect ratio, lazy load)
- Dish title + supplement price (if applicable)
- Description (if `showDescription`)
- Allergens (icons + names, if not "none")
- Glass morphism card background

### AllergenTag
- Icon (14px) + Name (12px)
- Rounded pill shape
- Subtle background (white/10 dark, black/5 light)

### Empty States
- **Loading:** Skeleton placeholders matching final layout
- **Not Found:** 404 with search icon
- **Inactive:** Friendly message explaining menu unavailable
- **Empty Section:** Subtle placeholder for sections with no dishes

---

## STATE MANAGEMENT

### No Atoms Required
All state managed in `usePublicMenu` hook (ephemeral, no persistence).

### States Handled
1. **Loading:** Initial fetch, show skeleton
2. **Success:** Display menu content
3. **Not Found (404):** Menu doesn't exist
4. **Inactive:** Menu exists but `isActive: false`
5. **Error:** Network/server error with retry
6. **Empty Section:** Section has no dishes

---

## ALLERGENS SYSTEM

### Allergen List (14 total)
```typescript
const ALLERGENS_MAP = {
  gluten: { name: 'Gluten', icon: '🌾' },
  crustaceans: { name: 'Crustaceans', icon: '🦐' },
  eggs: { name: 'Eggs', icon: '🥚' },
  fish: { name: 'Fish', icon: '🐟' },
  peanuts: { name: 'Peanuts', icon: '🥜' },
  soy: { name: 'Soy', icon: '🫘' },
  milk: { name: 'Milk', icon: '🥛' },
  nuts: { name: 'Nuts', icon: '🌰' },
  celery: { name: 'Celery', icon: '🌿' },
  mustard: { name: 'Mustard', icon: '🍯' },
  sesame: { name: 'Sesame', icon: '🍳' },
  sulphites: { name: 'Sulphites', icon: '🍷' },
  lupin: { name: 'Lupin', icon: '🌸' },
  molluscs: { name: 'Molluscs', icon: '🐚' },
  none: { name: 'No Allergens', icon: '✅' }
};
```

### Display Logic
- If `allergens` includes `'none'`: Don't show allergen tags
- Filter out `'none'` from displayed allergens
- Show icon + name in pill-shaped badge

---

## MOBILE-FIRST DESIGN

### Breakpoints
- Mobile: `< 640px` (default, single column)
- Tablet: `640px - 1024px` (same layout, larger margins)
- Desktop: `> 1024px` (max-width 768px container, centered)

### Layout
```
┌─────────────────────┐
│   Header (Logo)     │
│   Restaurant Name   │
│   Menu Title        │
│   Price Badge       │
│   Included Badges   │
├─────────────────────┤
│   Section 1         │
│   ─────             │
│   ┌───────────┐     │
│   │  Dish 1   │     │
│   └───────────┘     │
│   ┌───────────┐     │
│   │  Dish 2   │     │
│   └───────────┘     │
├─────────────────────┤
│   Section 2         │
│   ...               │
└─────────────────────┘
```

---

## PERFORMANCE

### Optimizations
- All UI components wrapped with `React.memo()`
- Lazy loading images (`loading="lazy"`)
- Single API call on mount
- No WebSocket overhead
- Minimal re-renders (granular state in hook)

### Image Handling
- Aspect ratio: `16:10` (portrait-friendly)
- Object-fit: `cover`
- Lazy load: `loading="lazy"` attribute
- Fallback: No image shown if `showImage: false` or `imageUrl: null`

---

## ACCESSIBILITY

### WCAG AA Compliance
- Minimum contrast: `4.5:1` for text
- Touch targets: `44x44px` minimum
- Semantic HTML: `<header>`, `<main>`, `<section>`, `<footer>`
- Alt text on all images
- Focus states on interactive elements (retry button)

### Screen Reader Support
- Allergen tags have `title` attribute for hover/long-press
- Heading hierarchy: `h1` (menu title) → `h2` (sections)
- Descriptive error messages

---

## CONVENTIONS

### File Naming
- Components: PascalCase (`MenuHeader.tsx`)
- Hooks: camelCase + use prefix (`usePublicMenu.ts`)
- Types: `types.ts`

### Import Order
```typescript
// 1. React
import { memo } from 'react';

// 2. Types
import type { MenuHeaderProps } from '../../types';

// 3. Atoms
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';

// 4. Components
import { Text } from '@/components/ui/Text/Text';
```

---

## ANTI-PATTERNS

- ❌ NEVER use WebSocket client → REST API only
- ❌ NEVER require authentication → Public route
- ❌ NEVER use `dark:` prefix → Use `themeAtom` conditionals
- ❌ NEVER skip loading states → Always show skeleton
- ❌ NEVER skip error handling → Handle all edge cases
- ❌ NEVER use hooks in UI components → Props only

---

## TESTING

### Manual Testing Checklist
1. **Loading State:** Verify skeleton appears on initial load
2. **Success State:** Menu displays correctly with all data
3. **404 State:** Menu not found shows search icon + message
4. **Inactive State:** Inactive menu shows appropriate message
5. **Error State:** Network error shows retry button
6. **Empty Section:** Section with no dishes shows placeholder
7. **Mobile Responsive:** Single column, proper spacing, readable text
8. **Dark Mode:** Theme switches correctly using `themeAtom`
9. **Images:** Lazy load, aspect ratio preserved, fallback works
10. **Allergens:** Icons display, "none" filtered out, readable

### Test URLs
```
/menu/demo-restaurant/menu-123         # Success
/menu/demo-restaurant/nonexistent      # 404 Not Found
/menu/demo-restaurant/inactive-menu    # Inactive Menu
```

---

## NOTES

- No workspace context needed (public route)
- No permission checks (accessible to everyone)
- restaurantSlug in URL for SEO (not used in API call)
- menuId is the primary identifier for fetching
- Theme persists from `themeAtom` (localStorage)
- All UI components are memoized for performance
