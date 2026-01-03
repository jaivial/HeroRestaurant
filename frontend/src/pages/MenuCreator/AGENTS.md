# MENU CREATOR KNOWLEDGE BASE

**⚠️ MANDATORY:** Follow `../../../../docs/general-rules/frontend-organization.md`

---

## OVERVIEW

Multi-step menu creation wizard with drag-and-drop dish ordering.

**Features:**
- 5-step onboarding wizard
- Real-time menu list dashboard
- Drag-and-drop section/dish reordering
- Allergen selection
- Image uploads for dishes

---

## THREE-LAYER STRUCTURE

```
MenuCreator.tsx (Layer 1 - Page)
├── hooks/
│   ├── useMenuData.ts           # Fetch menus via WebSocket
│   ├── useMenuActions.ts        # Mutations (create, update, delete)
│   ├── useMenuOnboarding.ts     # Multi-step form state
│   ├── useStep1BasicInfo.ts     # Step 1 validation
│   ├── useStep2Structure.ts     # Step 2 validation
│   ├── useStep3Availability.ts  # Step 3 validation
│   ├── useStep4Dishes.ts        # Step 4 dish management
│   └── useStep5Desserts.ts      # Step 5 dessert management
└── components/
    ├── MenuDashboard/ (Layer 2 - Functional)
    │   ├── MenuDashboard.tsx
    │   └── ui/ (Layer 3 - UI)
    │       ├── MenuCard.tsx       # Menu item card (memoized)
    │       ├── MenusList.tsx      # Grid of menus
    │       └── StatsSection.tsx   # Menu statistics
    └── MenuOnboarding/ (Layer 2 - Functional)
        ├── MenuOnboarding.tsx
        └── Steps/
            ├── Step1BasicInfo.tsx
            ├── Step2Structure.tsx
            ├── Step3Availability.tsx
            ├── Step4Dishes.tsx
            ├── Step5Desserts.tsx
            └── ui/ (Layer 3 - UI)
                ├── SortableDish.tsx      # Draggable dish (memoized)
                ├── SortableSection.tsx   # Draggable section
                └── AllergenModal.tsx     # Allergen selector
```

---

## ONBOARDING WIZARD

### 5 Steps

| Step | Component | Purpose | Validation Hook |
|------|-----------|---------|-----------------|
| 1 | BasicInfo | Menu name, type, price | `useStep1BasicInfo` |
| 2 | Structure | Sections (starters, mains, etc.) | `useStep2Structure` |
| 3 | Availability | Days and meal times | `useStep3Availability` |
| 4 | Dishes | Main dishes with details | `useStep4Dishes` |
| 5 | Desserts | Desserts and beverages | `useStep5Desserts` |

### State Management
```typescript
// atoms/menuCreatorAtoms.ts
currentMenuAtom         // Partial<Menu> | null
onboardingStepAtom      // 1-5
isAddingMenuAtom        // boolean
```

### Navigation
```typescript
// Hook pattern
const { nextStep, prevStep, canProceed } = useMenuOnboarding();

// nextStep() only if validation passes
if (canProceed) {
  nextStep();
}
```

---

## DRAG-AND-DROP

### Library
**@dnd-kit** for sections and dishes

### Sortable Components

**SortableSection.tsx:**
- Drag handle for reordering
- Section name editing inline
- Add/remove section
- Display order tracked in `displayOrder` field

**SortableDish.tsx:**
- Drag handle within section
- Dish details (title, description, price)
- Image upload button
- Allergen selection
- Display order auto-updated on drop

### Reorder Logic
```typescript
const handleDishReorder = (sectionId: string, oldIndex: number, newIndex: number) => {
  const section = sections.find(s => s.id === sectionId);
  const reordered = arrayMove(section.dishes, oldIndex, newIndex);
  
  // Update display_order for all dishes
  const updatedDishes = reordered.map((dish, idx) => ({
    ...dish,
    displayOrder: idx,
  }));
  
  // Update atom
  updateSection(sectionId, { dishes: updatedDishes });
};
```

---

## ALLERGEN SYSTEM

### Allergen List
```typescript
const ALLERGENS = [
  { id: 'gluten', name: 'Gluten', icon: '🌾' },
  { id: 'dairy', name: 'Dairy', icon: '🥛' },
  { id: 'eggs', name: 'Eggs', icon: '🥚' },
  { id: 'nuts', name: 'Nuts', icon: '🥜' },
  { id: 'shellfish', name: 'Shellfish', icon: '🦐' },
  // ... more
];
```

### Selection
**AllergenModal.tsx:**
- Checkbox grid of allergens
- Controlled by parent (Step4/Step5)
- Updates dish allergen array

```typescript
const toggleAllergen = (allergenId: string) => {
  setDish(prev => ({
    ...prev,
    allergens: prev.allergens.includes(allergenId)
      ? prev.allergens.filter(id => id !== allergenId)
      : [...prev.allergens, allergenId],
  }));
};
```

---

## MENU DASHBOARD

### Stats Display
```typescript
// Derived atom
const menuStatsAtom = atom((get) => {
  const menus = get(menusAtom);
  return {
    totalMenus: menus.length,
    activeMenus: menus.filter(m => m.isActive).length,
    fixedPriceCount: menus.filter(m => m.type === 'fixed').length,
    openMenuCount: menus.filter(m => m.type === 'open').length,
  };
});
```

### Menu Card Actions
- **Toggle Status:** Activate/deactivate menu
- **Edit:** Open onboarding in edit mode
- **Delete:** Soft delete with confirmation

---

## WEBSOCKET INTEGRATION

### Fetch Menus
```typescript
// useMenuData.ts
const fetchMenus = useCallback(async () => {
  const response = await wsClient.send({
    category: 'menu',
    action: 'list',
    payload: { restaurantId },
  });
  setMenus(response.data);
}, [restaurantId]);
```

### Create Menu
```typescript
// useMenuActions.ts
const createMenu = useCallback(async (menuData: Partial<Menu>) => {
  const response = await wsClient.send({
    category: 'menu',
    action: 'create',
    payload: menuData,
  });
  
  // Optimistic update
  setMenus(prev => [...prev, response.data]);
}, []);
```

---

## IMAGE UPLOADS

### Upload Flow
```
1. User clicks "Upload Image" on dish
2. File input opens
3. File selected → upload via REST API
4. Server returns image URL
5. Update dish.imageUrl
```

### REST Upload
```typescript
// services/upload.service.ts
const uploadDishImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await api.post('/upload/dish-image', formData);
  return response.data.url;
};
```

---

## TYPES (types.ts)

### Core Types
```typescript
interface Menu {
  id: string;
  title: string;
  type: 'fixed' | 'open';
  price?: number;
  isActive: boolean;
  drinkIncluded: boolean;
  coffeeIncluded: boolean;
  availability: {
    breakfast: string[]; // day names
    lunch: string[];
    dinner: string[];
  };
  sections: MenuSection[];
}

interface MenuSection {
  id: string;
  name: string;
  displayOrder: number;
  dishes: Dish[];
}

interface Dish {
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
```

---

## CONVENTIONS

- All state in atoms (`menuCreatorAtoms.ts`)
- One hook per step for validation
- UI components memoized (`React.memo()`)
- WebSocket for CRUD, REST for uploads
- Optimistic updates for mutations

---

## ANTI-PATTERNS

- ❌ NEVER skip step validation → Use `canProceed`
- ❌ NEVER mutate menu state → Return new objects
- ❌ NEVER skip drag-and-drop cleanup → Reset on unmount
- ❌ NEVER forget to update display orders → Auto-calculate
- ❌ NEVER skip image optimization → Backend handles

---

## NOTES

- Menu creation is wizard-only (no inline creation)
- Sections are created per menu (not global)
- Dishes belong to sections, not menus directly
- Allergen data stored as array of IDs
- Drag-and-drop persists to backend on drop
