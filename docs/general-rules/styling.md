# Styling Guidelines

## Overview

This document defines the styling rules for the HeroRestaurant SaaS application. We follow Apple's iOS aesthetic with liquid glass (glassmorphism) effects and comprehensive responsive breakpoints.

---

## Design Principles

### Apple Aesthetic Core Values

1. **Clarity** - Clean, minimal interfaces with purposeful whitespace
2. **Deference** - Content takes priority over chrome
3. **Depth** - Layered interfaces with subtle glass effects
4. **Consistency** - Unified design language across all viewports

### Primary Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Border Radius (Primary) | `2.2rem` | Cards, modals, containers |
| Border Radius (Secondary) | `1rem` | Buttons, inputs, small elements |
| Glass Blur | `20px` | All glass effect elements |
| Glass Saturation | `180%` | Enhanced color vibrancy |

---

## Liquid Glass Effect

Instead of global CSS classes, use inline Tailwind with arbitrary values and conditional logic based on the current theme.

### Implementation Pattern

```tsx
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';

export function GlassComponent() {
  const theme = useAtomValue(themeAtom);
  
  const glassClasses = theme === 'dark'
    ? 'backdrop-blur-[20px] saturate-[180%] bg-black/50 border border-white/10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3),0_2px_4px_-2px_rgba(0,0,0,0.2)]'
    : 'backdrop-blur-[20px] saturate-[180%] bg-white/72 border border-white/[0.18] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]';

  return (
    <div className={`${glassClasses} rounded-[2.2rem]`}>
      {/* Content */}
    </div>
  );
}
```

### Glass Intensity Variants

Since we don't use global config, we apply opacity values directly:

| Variant | Light Mode Class | Dark Mode Class | Use Case |
|---------|------------------|-----------------|----------|
| `subtle` | `bg-white/50` | `bg-black/30` | Overlays, tooltips |
| `default` | `bg-white/72` | `bg-black/50` | Cards, panels |
| `solid` | `bg-white/90` | `bg-black/75` | Modals, dialogs |

---

## Responsive Breakpoints

We use Tailwind's arbitrary value support for our custom 10-level breakpoint system to avoid global configuration.

### Width Breakpoints

Use the `min-[width]:` prefix:

| Token | Arbitrary Value | Target Devices |
|-------|-----------------|----------------|
| `xxs` | `min-[200px]:` | Smartwatches / ultra-narrow |
| `xs` | `min-[280px]:` | Very small mobile |
| `sm` | `min-[360px]:` | Small mobile |
| `md` | `min-[480px]:` | Large mobile |
| `lg` | `min-[640px]:` | Small tablet |
| `xl` | `min-[768px]:` | Tablet |
| `2xl` | `min-[1024px]:` | Large tablet |
| `3xl` | `min-[1280px]:` | Desktop |
| `4xl` | `min-[1536px]:` | Large desktop |
| `5xl` | `min-[2048px]:` | 2K displays |
| `6xl` | `min-[3000px]:` | 4K displays |

### Height Breakpoints

Use the `[@media(min-height:value)]:` syntax:

| Token | Arbitrary Value | Target Viewports |
|-------|-----------------|------------------|
| `h-xs` | `[@media(min-height:490px)]:` | Landscape mobile |
| `h-sm` | `[@media(min-height:600px)]:` | Short viewport |
| `h-md` | `[@media(min-height:700px)]:` | Medium-short |
| `h-lg` | `[@media(min-height:800px)]:` | Medium |
| `h-xl` | `[@media(min-height:900px)]:` | Medium-tall |
| `h-2xl` | `[@media(min-height:1024px)]:` | Tall (standard) |
| `h-3xl` | `[@media(min-height:1200px)]:` | Very tall |
| `h-4xl` | `[@media(min-height:1440px)]:` | Extra tall |
| `h-5xl` | `[@media(min-height:1800px)]:` | Ultra tall |
| `h-6xl` | `[@media(min-height:2000px)]:` | Maximum |

---

## Accessibility & Readability (WCAG)

We adhere to WCAG 2.1 Level AA standards to ensure the application is usable by everyone.

### Color Contrast

All text and interactive elements must meet minimum contrast ratios:
- **Normal Text:** At least `4.5:1` against its background.
- **Large Text (18pt/24px+):** At least `3:1` against its background.
- **UI Components & Icons:** At least `3:1` against adjacent colors.

**Implementation Tip:** When using glass effects, ensure the underlying background doesn't vibrate or obscure text. Use `bg-white/90` or `bg-black/75` (solid variant) if contrast is at risk.

### Typography & Readability

1. **Font Size:** Minimum `14px` (`0.875rem`) for body text. Prefer `16px` (`1rem`) where possible.
2. **Line Height:** Minimum `1.5` for body text to ensure vertical readability.
3. **Paragraph Spacing:** Use `mb-4` or `space-y-4` to clearly separate blocks of text.
4. **Line Length:** Maintain between `45-75 characters` per line for optimal scanning. Use `max-w-prose` or specific `max-w-[ch]` values.
5. **Text Alignment:** Avoid justified text; use left-aligned (or right-aligned for RTL) to maintain consistent word spacing.

### Interactive Elements

1. **Touch Targets:** Minimum `44x44px` for all clickable elements on mobile.
2. **Focus States:** Every interactive element must have a visible focus state. Do not use `outline-none` without providing a high-contrast alternative.
3. **Labels:** Every input must have a programmatically associated `<label>` or `aria-label`.

---

## Theme Management (Jotai Atoms)

**Do NOT use** Tailwind's native dark mode (`dark:` prefix) or native HTML theme detection. These are restricted to ensure consistent behavior with our state management.

**Use Jotai atoms exclusively** for conditional styling.

### Theme Atom Setup

```tsx
// atoms/themeAtoms.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export type Theme = 'light' | 'dark';

// Persisted theme preference (localStorage)
export const themeAtom = atomWithStorage<Theme>('theme', 'light');

// Toggle atom for theme switch
export const toggleThemeAtom = atom(
  null,
  (get, set) => {
    const current = get(themeAtom);
    set(themeAtom, current === 'light' ? 'dark' : 'light');
  }
);
```

### Conditional Styling Pattern

Instead of `dark:`, use the `theme` value to conditionally apply classes:

```tsx
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';

export function MyComponent() {
  const theme = useAtomValue(themeAtom);

  return (
    <div className={`
      p-4 rounded-[1rem] transition-colors duration-200
      ${theme === 'dark' ? 'bg-black text-white border-white/10' : 'bg-white text-black border-black/10'}
      border
    `}>
      Content
    </div>
  );
}
```

### Why We Avoid Native Dark Mode

| Problem | Native `dark:` | Our State-Based Approach |
|---------|-----------------|--------------------------|
| Synchronization | Difficult to sync with JS state | Perfectly synchronized with Jotai |
| Dynamic Control | Limited to CSS class on `<html>` | Full control within React components |
| Complexity | Requires Tailwind config | Pure inline Tailwind |
| Flash of Theme | Harder to prevent without SSR | Managed via persistence in Jotai |

---

## React Component Examples

### GlassCard Component

```tsx
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'solid';
  className?: string;
}

export function GlassCard({
  children,
  variant = 'default',
  className = ''
}: GlassCardProps) {
  const theme = useAtomValue(themeAtom);

  const variantClasses = {
    default: theme === 'dark' ? 'bg-black/50' : 'bg-white/72',
    subtle: theme === 'dark' ? 'bg-black/30' : 'bg-white/50',
    solid: theme === 'dark' ? 'bg-black/75' : 'bg-white/90',
  };

  const borderClass = theme === 'dark' ? 'border-white/10' : 'border-white/[0.18]';
  const shadowClass = theme === 'dark' 
    ? 'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3),0_2px_4px_-2px_rgba(0,0,0,0.2)]'
    : 'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]';

  return (
    <div
      className={`
        backdrop-blur-[20px] saturate-[180%]
        ${variantClasses[variant]}
        border ${borderClass}
        rounded-[2.2rem] ${shadowClass}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
```

### Responsive Container Example

Using arbitrary breakpoints to maintain the 11-level system (200px to 3000px) without global configuration:

```tsx
export function ResponsiveContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="
      w-full px-4
      min-[200px]:px-2
      min-[280px]:px-4
      min-[360px]:px-6
      min-[480px]:px-8
      min-[640px]:max-w-2xl min-[640px]:mx-auto
      min-[768px]:max-w-3xl
      min-[1024px]:max-w-4xl
      min-[1280px]:max-w-5xl
      min-[1536px]:max-w-6xl
      min-[2048px]:max-w-7xl
      min-[3000px]:max-w-[1800px]
    ">
      {children}
    </div>
  );
}
```

---

## Usage Guidelines

### Do's

- Use `rounded-[2.2rem]` for primary containers (cards, modals, panels)
- Use `rounded-[1rem]` for secondary elements (buttons, inputs)
- Use `useAtomValue(themeAtom)` to get the current theme for conditional styling
- Prefer arbitrary Tailwind values `[...]` for project-specific design tokens
- Use height media queries `[@media(min-height:800px)]:` for tall-viewport specific layouts

### Don'ts

- **Don't use `dark:` utilities.** Use conditional expressions `theme === 'dark' ? ... : ...`
- Don't use global CSS classes for glass effects or layouts
- Don't define custom themes or tokens in `tailwind.config.js`
- Don't use `prefers-color-scheme` or `<html data-theme>` for theming
- Don't nest multiple glass layers (performance impact)

---

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| `backdrop-filter` | 76+ | 103+ | 9+ | 79+ |
| `border-radius` | All | All | All | All |
| Arbitrary Values | 3.0+ | 3.0+ | 3.0+ | 3.0+ |

### Fallback for Older Browsers

```tsx
const glassStyles = theme === 'dark'
  ? 'bg-black/95 [@supports(backdrop-filter:blur(0))]:bg-black/50 [@supports(backdrop-filter:blur(0))]:backdrop-blur-[20px]'
  : 'bg-white/95 [@supports(backdrop-filter:blur(0))]:bg-white/72 [@supports(backdrop-filter:blur(0))]:backdrop-blur-[20px]';
```
