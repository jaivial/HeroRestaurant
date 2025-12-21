# Workspace Members Shift & Time Tracking Implementation Guide

This guide outlines the implementation of a real-time shift tracking system for HeroRestaurant, following the Apple glassmorphism aesthetic and three-layer architecture.

## 1. Database Layer (PostgreSQL/Kysely)

### 1.1 New Tables
We require two new tables to track contractual obligations and actual shift events.

```typescript
// backend/src/types/database.types.ts

export interface MemberContractsTable {
  id: Generated<string>;
  membership_id: string; // FK to memberships.id
  weekly_hours: number;
  effective_from: Date;
  effective_to: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface MemberShiftsTable {
  id: Generated<string>;
  membership_id: string; // FK to memberships.id
  punch_in_at: Date;
  punch_out_at: Date | null;
  total_minutes: number | null; // Calculated on punch_out
  notes: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}
```

## 2. WebSocket Protocol (Communication Layer)

All communication is strictly via WebSockets. Handlers should be added to `backend/src/websocket/handlers/shift.handler.ts`.

### Events
| Event | Direction | Payload |
|-------|-----------|---------|
| `shift:punch` | C -> S | `{ action: 'in' | 'out', restaurantId: string, notes?: string }` |
| `shift:get_personal_stats` | C -> S | `{ restaurantId: string, period: 'daily' | 'weekly' | ... }` |
| `shift:get_team_stats` | C -> S | `{ restaurantId: string, page: number, filters: object }` |
| `shift:update_broadcast` | S -> C | `{ type: 'PUNCH_EVENT', data: { memberId: string, status: 'in' | 'out' } }` |

## 3. Frontend Architecture

### 3.1 Organization (`src/pages/Shifts/`)
Follow the three-layer pattern defined in `frontend-organization.md`.

- `Shifts.tsx`: (Layer 1) Main entry point, handles tab state and role-based access.
- `hooks/useShiftStats.ts`: Calculates the bank of hours comparison.
- `components/`: (Layer 2) `ClockSection`, `PersonalStats`, `TeamStats`.
- `components/TeamStats/ui/MemberDetailView.tsx`: (Layer 3) The detailed view with history and filters.

### 3.2 Reusable SOLID Component: `DataTable`
Location: `src/components/ui/DataTable/DataTable.tsx`

This component follows **SRP** (rendering only), **OCP** (extensible via generics), and **ISP** (minimal props).

```tsx
import React from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';

export interface Column<T> {
  header: string;
  key: keyof T | string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({ data, columns, onRowClick, className = '' }: DataTableProps<T>) {
  const theme = useAtomValue(themeAtom);
  const baseGlass = "backdrop-blur-[20px] saturate-[180%] rounded-[2.2rem] border";
  const themeClasses = theme === 'dark' 
    ? 'bg-black/50 border-white/10 shadow-lg' 
    : 'bg-white/85 border-black/[0.08] shadow-md';

  return (
    <div className={`${baseGlass} ${themeClasses} overflow-hidden ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className={theme === 'dark' ? 'border-white/10' : 'border-black/[0.05]'}>
            {columns.map((col) => (
              <th key={col.header} className="p-4 text-[12px] font-semibold opacity-60 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr 
              key={idx} 
              onClick={() => onRowClick?.(item)}
              className={`
                transition-colors cursor-pointer
                ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'}
                ${idx !== data.length - 1 ? (theme === 'dark' ? 'border-b border-white/5' : 'border-b border-black/5') : ''}
              `}
            >
              {columns.map((col) => (
                <td key={col.header} className="p-4 text-[17px]">
                  {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## 4. Business Logic: Bank of Hours

### Danger Zones (Badge Status)
Calculated as: `(Actual Hours - Contracted Hours)`.

1.  **Zone 1 (Healthy)**: `±2h` -> `systemGreen`
2.  **Zone 2 (Caution)**: `+2h to +10h` -> `systemBlue`
3.  **Zone 3 (Overworked)**: `+10h to +20h` -> `systemOrange`
4.  **Zone 4 (Critical)**: `>+20h` or `<-10h` -> `systemRed`

## 5. Member Detailed Area
When clicking the "view more" icon in the `DataTable`:
- Displays a `GlassCard` with vertical punch history.
- **Filters**: Date Range, Punch Type (In/Out), Manual vs. Auto.
- **Metrics**: Total worked time in selected range, average shift duration.

## 6. Implementation Checklist
- [ ] Backend: Create migrations for `member_contracts` and `member_shifts`.
- [ ] Backend: Implement `ShiftService` for bank calculations.
- [ ] Backend: Implement `shift.handler.ts` (WS).
- [ ] Frontend: Create `shiftAtoms.ts` with WebSocket synchronization.
- [ ] Frontend: Create `DataTable` reusable component.
- [ ] Frontend: Implement `Shifts` page with the 3 requested tabs.
- [ ] Frontend: Connect punch buttons to WS events with optimistic UI.
