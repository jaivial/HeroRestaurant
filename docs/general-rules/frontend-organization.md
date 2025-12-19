# Frontend Organization & Coding Patterns

## Overview

This document defines the **three-layer component architecture** and coding patterns for the frontend. All components follow the styling rules in [`styling.md`](./styling.md) and use components from [`reusable-components.md`](./reusable-components.md).

---

## Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: PAGE COMPONENT                                    │
│  ─────────────────────────                                  │
│  • Custom hooks calls                                       │
│  • useEffect declarations                                   │
│  • Type imports                                             │
│  • Returns: Functional Components + minimal HTML            │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: FUNCTIONAL COMPONENT                              │
│  ─────────────────────────────                              │
│  • Custom hooks calls                                       │
│  • useEffect declarations                                   │
│  • Returns: UI Components + minimal HTML                    │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3: UI COMPONENT                                      │
│  ─────────────────────────                                  │
│  • Props only (data ready to display)                       │
│  • Returns: Pure JSX/HTML                                   │
│  • No logic, no hooks, no state                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
src/
├── pages/
│   └── [PageName]/
│       ├── PageName.tsx           # Page component (Layer 1)
│       ├── types.ts               # All types for this page
│       ├── hooks/
│       │   ├── usePageData.ts     # One hook per file
│       │   ├── usePageActions.ts
│       │   └── usePageForm.ts
│       └── components/
│           └── [FunctionalName]/
│               ├── FunctionalName.tsx    # Functional component (Layer 2)
│               └── ui/
│                   ├── ItemCard.tsx      # UI component (Layer 3)
│                   └── ItemList.tsx
│
├── components/
│   └── ui/                        # Global reusable UI components
│       ├── Button/
│       ├── Card/
│       └── ...
│
├── atoms/
│   ├── authAtoms.ts               # One file per atom set
│   ├── uiAtoms.ts
│   ├── cartAtoms.ts
│   └── ...
│
├── hooks/                         # Global shared hooks
│   ├── useAuth.ts
│   └── useTheme.ts
│
└── types/                         # Global shared types
    └── index.ts
```

---

## Layer 1: Page Component

The page component is the **entry point** for a route. It orchestrates data and delegates rendering to functional components.

### Rules

| Rule | Description |
|------|-------------|
| Hooks only | All logic lives in custom hooks |
| No inline state | No `useState` directly — use hooks |
| No inline functions | No handlers defined here — use hooks |
| Minimal JSX | Only functional components + layout wrappers |
| Types imported | All types from `./types.ts` |

### Template

```tsx
// pages/Dashboard/Dashboard.tsx

import type { DashboardProps } from './types';
import { useDashboardData } from './hooks/useDashboardData';
import { useDashboardActions } from './hooks/useDashboardActions';
import { StatsSection } from './components/StatsSection/StatsSection';
import { RecentOrders } from './components/RecentOrders/RecentOrders';
import { QuickActions } from './components/QuickActions/QuickActions';
import { Container } from '@/components/ui';

export function Dashboard({ userId }: DashboardProps) {
  // ✅ Custom hooks only
  const { stats, orders, isLoading } = useDashboardData(userId);
  const { refreshData, exportReport } = useDashboardActions();

  // ✅ useEffect allowed (but prefer hooks)
  useEffect(() => {
    refreshData();
  }, []);

  // ✅ Minimal JSX — functional components only
  return (
    <Container>
      <StatsSection stats={stats} isLoading={isLoading} />
      <RecentOrders orders={orders} />
      <QuickActions onExport={exportReport} />
    </Container>
  );
}
```

### ❌ Anti-patterns

```tsx
// ❌ WRONG: State defined in page
const [data, setData] = useState([]);

// ❌ WRONG: Handler defined in page
const handleClick = () => { ... };

// ❌ WRONG: Fetch logic in page
useEffect(() => {
  fetch('/api/data').then(res => setData(res));
}, []);

// ❌ WRONG: Too much HTML in return
return (
  <div className="...">
    <h1>Title</h1>
    <div className="grid">
      {items.map(item => (
        <div key={item.id}>...</div>  // Should be a component
      ))}
    </div>
  </div>
);
```

---

## Layer 2: Functional Component

Functional components are **feature sections** within a page. They handle component-level logic and compose UI components.

### Rules

| Rule | Description |
|------|-------------|
| Hooks allowed | Custom hooks and useEffect |
| No business logic | Logic stays in hooks |
| UI components only | Return only UI components |
| Props typed | All props defined in page's `types.ts` |

### Template

```tsx
// pages/Dashboard/components/RecentOrders/RecentOrders.tsx

import type { RecentOrdersProps } from '../../types';
import { useOrderFilters } from '../../hooks/useOrderFilters';
import { OrderCard } from './ui/OrderCard';
import { OrderFilters } from './ui/OrderFilters';
import { Card } from '@/components/ui';

export function RecentOrders({ orders }: RecentOrdersProps) {
  // ✅ Hooks allowed
  const { filters, setFilter, filteredOrders } = useOrderFilters(orders);

  // ✅ useEffect allowed
  useEffect(() => {
    // Component-level side effects
  }, [filters]);

  // ✅ Returns UI components only
  return (
    <Card>
      <OrderFilters filters={filters} onChange={setFilter} />
      {filteredOrders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </Card>
  );
}
```

---

## Layer 3: UI Component

UI components are **pure presentational** components. They receive data via props and render it — nothing else.

### Rules

| Rule | Description |
|------|-------------|
| Props only | All data via props |
| No hooks | No useState, useEffect, custom hooks |
| No logic | No conditions beyond simple ternaries |
| Pure render | Same props = same output |
| Reusable first | Prefer global UI components |

### Template

```tsx
// pages/Dashboard/components/RecentOrders/ui/OrderCard.tsx

import type { OrderCardProps } from '../../../types';
import { Card, Badge, Text } from '@/components/ui';

export function OrderCard({ order }: OrderCardProps) {
  // ✅ Only return statement
  return (
    <Card variant="interactive">
      <Text weight="bold">{order.customerName}</Text>
      <Text muted>{order.items.length} items</Text>
      <Badge color={order.status === 'completed' ? 'green' : 'yellow'}>
        {order.status}
      </Badge>
      <Text>${order.total.toFixed(2)}</Text>
    </Card>
  );
}
```

### When to Create Page-Specific UI

Use page-specific UI components (`[page]/components/[functional]/ui/`) only when:
- The component is **not reusable** elsewhere
- It's a **unique layout** for that page
- It **combines multiple** global UI components in a specific way

Otherwise, use or create a **global reusable component** in `src/components/ui/`.

---

## Custom Hooks Pattern

All logic, state, and actions are encapsulated in custom hooks.

### Hook Organization

```
pages/Dashboard/hooks/
├── useDashboardData.ts      # Data fetching, queries
├── useDashboardActions.ts   # Mutations, handlers
├── useDashboardForm.ts      # Form state, validation
└── useDashboardFilters.ts   # Filter/search state
```

### Hook Template

```tsx
// pages/Dashboard/hooks/useDashboardData.ts

import { useAtom } from 'jotai';
import { dashboardStatsAtom, dashboardOrdersAtom } from '@/atoms/dashboardAtoms';
import type { DashboardData } from '../types';

export function useDashboardData(userId: string): DashboardData {
  const [stats] = useAtom(dashboardStatsAtom);
  const [orders] = useAtom(dashboardOrdersAtom);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    // fetch logic...
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    orders,
    isLoading,
    refetch: fetchData,
  };
}
```

---

## Types Organization

All types for a page live in a single `types.ts` file.

### Template

```tsx
// pages/Dashboard/types.ts

// ─── Page Props ─────────────────────────────────────────────
export interface DashboardProps {
  userId: string;
}

// ─── Data Types ─────────────────────────────────────────────
export interface DashboardStats {
  totalOrders: number;
  revenue: number;
  avgOrderValue: number;
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: Date;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

// ─── Component Props ────────────────────────────────────────
export interface StatsSectionProps {
  stats: DashboardStats;
  isLoading: boolean;
}

export interface RecentOrdersProps {
  orders: Order[];
}

export interface OrderCardProps {
  order: Order;
}

// ─── Hook Return Types ──────────────────────────────────────
export interface DashboardData {
  stats: DashboardStats;
  orders: Order[];
  isLoading: boolean;
  refetch: () => void;
}
```

---

## State Management: Jotai Atoms

We use **Jotai atoms exclusively** for global state. No Redux, no Zustand, no Context for state.

### Atoms Organization

```
src/atoms/
├── authAtoms.ts          # User, session, tokens
├── uiAtoms.ts            # Theme, modals, toasts
├── cartAtoms.ts          # Cart items, totals
├── ordersAtoms.ts        # Orders state
└── filtersAtoms.ts       # Global filters
```

### Rules

| Rule | Description |
|------|-------------|
| One file per domain | Group related atoms |
| Max ~100 lines | Split if file grows too large |
| Derived atoms | Use `atom((get) => ...)` for computed |
| Async atoms | Use `atomWithQuery` pattern for fetching |

### Template

```tsx
// atoms/cartAtoms.ts

import { atom } from 'jotai';
import type { CartItem } from '@/types';

// ─── Base Atoms ─────────────────────────────────────────────
export const cartItemsAtom = atom<CartItem[]>([]);
export const cartOpenAtom = atom<boolean>(false);

// ─── Derived Atoms ──────────────────────────────────────────
export const cartTotalAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

export const cartCountAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((sum, item) => sum + item.quantity, 0);
});

// ─── Action Atoms ───────────────────────────────────────────
export const addToCartAtom = atom(
  null,
  (get, set, item: CartItem) => {
    const items = get(cartItemsAtom);
    set(cartItemsAtom, [...items, item]);
  }
);

export const removeFromCartAtom = atom(
  null,
  (get, set, itemId: string) => {
    const items = get(cartItemsAtom);
    set(cartItemsAtom, items.filter(i => i.id !== itemId));
  }
);
```

---

## Performance Optimization

### Atom Granularization

Split atoms into the **smallest possible units** to prevent unnecessary re-renders. Components only re-render when the specific atom they subscribe to changes.

#### ❌ Wrong: Monolithic Atom

```tsx
// ❌ BAD: One big atom causes all subscribers to re-render
const userAtom = atom({
  id: '',
  name: '',
  email: '',
  avatar: '',
  preferences: { theme: 'light', language: 'en' },
  notifications: [],
});

// Any change to notifications re-renders components that only need `name`
```

#### ✅ Correct: Granular Atoms

```tsx
// ✅ GOOD: Separate atoms for independent data
const userIdAtom = atom<string>('');
const userNameAtom = atom<string>('');
const userEmailAtom = atom<string>('');
const userAvatarAtom = atom<string>('');
const userThemeAtom = atom<'light' | 'dark'>('light');
const userLanguageAtom = atom<string>('en');
const userNotificationsAtom = atom<Notification[]>([]);

// Components subscribe only to what they need
function UserAvatar() {
  const [avatar] = useAtom(userAvatarAtom); // Only re-renders on avatar change
  return <img src={avatar} />;
}
```

#### Granularization Rules

| Rule | Description |
|------|-------------|
| One value = one atom | Primitives should be separate atoms |
| Independent data = separate atoms | If data changes independently, split it |
| Related arrays | Keep arrays together, split by entity type |
| Derived data | Use derived atoms, not combined base atoms |

### useMemo & useCallback

Use memoization to prevent expensive recalculations and unnecessary child re-renders.

#### useMemo Rules

```tsx
// ✅ Use useMemo for:
// 1. Expensive computations
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => a.price - b.price);
}, [items]);

// 2. Filtered/transformed data
const activeUsers = useMemo(() => {
  return users.filter(u => u.isActive);
}, [users]);

// 3. Object/array props passed to memoized children
const chartData = useMemo(() => ({
  labels: data.map(d => d.label),
  values: data.map(d => d.value),
}), [data]);
```

#### useCallback Rules

```tsx
// ✅ Use useCallback for:
// 1. Event handlers passed to child components
const handleClick = useCallback((id: string) => {
  updateItem(id);
}, [updateItem]);

// 2. Functions in dependency arrays
const fetchData = useCallback(async () => {
  const result = await api.getData();
  setData(result);
}, []);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

#### Memoization Anti-patterns

```tsx
// ❌ WRONG: Memoizing primitives (no benefit)
const count = useMemo(() => items.length, [items]);

// ❌ WRONG: New object in render (breaks memoization)
<ChildComponent style={{ color: 'red' }} />

// ✅ CORRECT: Stable object reference
const style = useMemo(() => ({ color: 'red' }), []);
<ChildComponent style={style} />

// ❌ WRONG: Inline function (new reference every render)
<Button onClick={() => handleClick(id)} />

// ✅ CORRECT: Stable callback
const onClick = useCallback(() => handleClick(id), [id, handleClick]);
<Button onClick={onClick} />
```

#### Component Memoization

```tsx
// Wrap UI components with React.memo to prevent re-renders from parent
export const OrderCard = memo(function OrderCard({ order }: OrderCardProps) {
  return (
    <Card>
      <Text>{order.customerName}</Text>
      <Text>${order.total}</Text>
    </Card>
  );
});

// For components with complex props, provide custom comparison
export const DataGrid = memo(
  function DataGrid({ data, columns }: DataGridProps) {
    return /* ... */;
  },
  (prevProps, nextProps) => {
    return prevProps.data.length === nextProps.data.length &&
           prevProps.data.every((item, i) => item.id === nextProps.data[i].id);
  }
);
```

---

## Optimistic Updates

For state-changing API calls, **update the UI immediately** before the server responds. This makes the app feel instant.

### Pattern

```
User Action → Update UI (optimistic) → API Call → Success: Keep UI
                                                → Error: Rollback UI + Show Error
```

### Implementation Template

```tsx
// atoms/cartAtoms.ts

export const addToCartOptimisticAtom = atom(
  null,
  async (get, set, item: CartItem) => {
    const previousItems = get(cartItemsAtom);

    // 1️⃣ Optimistic update — UI updates immediately
    set(cartItemsAtom, [...previousItems, { ...item, pending: true }]);

    try {
      // 2️⃣ API call
      const savedItem = await api.cart.addItem(item);

      // 3️⃣ Success — replace pending item with server response
      set(cartItemsAtom, (items) =>
        items.map(i => i.id === item.id ? savedItem : i)
      );
    } catch (error) {
      // 4️⃣ Error — rollback to previous state
      set(cartItemsAtom, previousItems);

      // 5️⃣ Show error toast
      set(toastAtom, {
        type: 'error',
        message: 'Failed to add item to cart',
      });
    }
  }
);
```

### Hook Pattern for Optimistic Updates

```tsx
// hooks/useOptimisticMutation.ts

export function useOptimisticMutation<T, R>({
  atom: targetAtom,
  mutationFn,
  optimisticUpdate,
  onError,
}: OptimisticMutationOptions<T, R>) {
  const [, setData] = useAtom(targetAtom);
  const [, setToast] = useAtom(toastAtom);

  return useCallback(async (input: T) => {
    const previous = /* get current state */;

    // Optimistic update
    setData(optimisticUpdate(previous, input));

    try {
      const result = await mutationFn(input);
      return result;
    } catch (error) {
      // Rollback
      setData(previous);
      setToast({ type: 'error', message: onError?.(error) ?? 'Operation failed' });
      throw error;
    }
  }, [mutationFn, optimisticUpdate, onError]);
}
```

### Usage in Components

```tsx
// pages/Cart/hooks/useCartActions.ts

export function useCartActions() {
  const [, addToCart] = useAtom(addToCartOptimisticAtom);
  const [, removeFromCart] = useAtom(removeFromCartOptimisticAtom);
  const [, updateQuantity] = useAtom(updateQuantityOptimisticAtom);

  return {
    addToCart,      // All these are optimistic
    removeFromCart, // UI updates instantly
    updateQuantity, // Rollback on error
  };
}
```

### Optimistic Update Rules

| Rule | Description |
|------|-------------|
| Always optimistic | All mutations that change visible UI state |
| Store previous state | Save before updating for rollback |
| Mark as pending | Add `pending` flag for UI feedback (optional) |
| Handle errors gracefully | Rollback + user-friendly error message |
| Sync with server response | Replace optimistic data with server data on success |

### When NOT to Use Optimistic Updates

- **Critical operations** (payments, account deletion) — wait for confirmation
- **Complex server validations** — when client can't predict outcome
- **Sequential operations** — when order matters

---

## Quick Reference

### Layer Responsibilities

| Layer | Location | Contains | Returns |
|-------|----------|----------|---------|
| Page | `pages/[Page]/[Page].tsx` | Hooks, useEffect | Functional Components |
| Functional | `pages/[Page]/components/[Name]/` | Hooks, useEffect | UI Components |
| UI | `components/ui/` or `[Page]/.../ui/` | Props only | Pure JSX |

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Page | PascalCase | `Dashboard.tsx` |
| Component | PascalCase | `OrderCard.tsx` |
| Hook | camelCase + use | `useDashboardData.ts` |
| Types | types.ts | `types.ts` |
| Atoms | camelCase + Atoms | `cartAtoms.ts` |

### Import Order

```tsx
// 1. React
import { useEffect } from 'react';

// 2. Types
import type { PageProps } from './types';

// 3. Atoms
import { useAtom } from 'jotai';
import { dataAtom } from '@/atoms/dataAtoms';

// 4. Hooks
import { usePageData } from './hooks/usePageData';

// 5. Components (functional first, then UI)
import { FeatureSection } from './components/FeatureSection/FeatureSection';
import { Card, Button } from '@/components/ui';
```

---

## Checklist

Before committing, verify:

- [ ] Page component has no inline state or handlers
- [ ] All logic is in custom hooks (one per file)
- [ ] All types are in `types.ts`
- [ ] Functional components only return UI components
- [ ] UI components have no hooks or logic
- [ ] Atoms are organized by domain
- [ ] Atoms are granular (one value = one atom)
- [ ] useMemo used for expensive computations and object/array props
- [ ] useCallback used for handlers passed to children
- [ ] React.memo wraps UI components
- [ ] Mutations use optimistic updates
- [ ] No file exceeds ~200 lines
