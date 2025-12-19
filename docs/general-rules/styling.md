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

### Light Mode

```css
.glass-light {
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 2.2rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1);
}
```

### Dark Mode

```css
.glass-dark {
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 2.2rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.3),
    0 2px 4px -2px rgba(0, 0, 0, 0.2);
}
```

### Glass Intensity Variants

| Variant | Light BG Opacity | Dark BG Opacity | Use Case |
|---------|------------------|-----------------|----------|
| `glass-subtle` | 0.5 | 0.3 | Overlays, tooltips |
| `glass` | 0.72 | 0.5 | Cards, panels |
| `glass-solid` | 0.9 | 0.75 | Modals, dialogs |

---

## Responsive Breakpoints

### Width Breakpoints (10 levels: 280px → 3000px)

| Token | Min-Width | Target Devices |
|-------|-----------|----------------|
| `xs` | 280px | Very small mobile (Galaxy Fold) |
| `sm` | 360px | Small mobile (iPhone SE, small Android) |
| `md` | 480px | Large mobile / phablet |
| `lg` | 640px | Small tablet (portrait) |
| `xl` | 768px | Tablet (iPad Mini, standard tablets) |
| `2xl` | 1024px | Small desktop / large tablet (iPad Pro) |
| `3xl` | 1280px | Desktop (standard laptops) |
| `4xl` | 1536px | Large desktop (external monitors) |
| `5xl` | 2048px | 2K displays |
| `6xl` | 3000px | Ultra-wide / 4K displays |

### Height Breakpoints (10 levels: 490px → 2000px)

| Token | Min-Height | Target Viewports |
|-------|------------|------------------|
| `h-xs` | 490px | Landscape mobile |
| `h-sm` | 600px | Short viewport / split screen |
| `h-md` | 700px | Medium-short |
| `h-lg` | 800px | Medium |
| `h-xl` | 900px | Medium-tall |
| `h-2xl` | 1024px | Tall (standard desktop) |
| `h-3xl` | 1200px | Very tall |
| `h-4xl` | 1440px | Extra tall (QHD) |
| `h-5xl` | 1800px | Ultra tall |
| `h-6xl` | 2000px | Maximum (4K portrait) |

---

## Theme Management (Jotai Atoms)

**Do NOT use** native HTML theme detection (`prefers-color-scheme`, `<html data-theme>`, or media queries for theme). These approaches cause hydration mismatches, flash of wrong theme (FOWT), and are difficult to sync with user preferences.

**Use Jotai atoms exclusively** for theme state management.

### Theme Atom Setup

```tsx
// atoms/themeAtoms.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export type Theme = 'light' | 'dark';

// Persisted theme preference (localStorage)
export const themeAtom = atomWithStorage<Theme>('theme', 'light');

// Derived atom that applies theme class to document
export const themeEffectAtom = atom(
  (get) => get(themeAtom),
  (get, set, newTheme: Theme) => {
    set(themeAtom, newTheme);

    // Apply theme class to <html> element
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
);

// Toggle atom for theme switch
export const toggleThemeAtom = atom(
  null,
  (get, set) => {
    const current = get(themeAtom);
    set(themeEffectAtom, current === 'light' ? 'dark' : 'light');
  }
);
```

### Theme Initialization

```tsx
// App.tsx or main.tsx
import { useAtom } from 'jotai';
import { themeEffectAtom } from '@/atoms/themeAtoms';

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useAtom(themeEffectAtom);

  // Apply theme on mount and changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
}
```

### Theme Toggle Component

```tsx
// components/ui/ThemeToggle/ThemeToggle.tsx
import { useAtom } from 'jotai';
import { themeAtom, toggleThemeAtom } from '@/atoms/themeAtoms';

export function ThemeToggle() {
  const [theme] = useAtom(themeAtom);
  const [, toggle] = useAtom(toggleThemeAtom);

  return (
    <button onClick={toggle} className="glass-button">
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

### Why NOT Native Theme Detection

| Problem | Native Approach | Jotai Approach |
|---------|-----------------|----------------|
| Hydration mismatch | Server doesn't know client preference | State is consistent |
| Flash of wrong theme | Renders before JS loads | Theme applied before render |
| User preference sync | Complex to override system | Simple atom update |
| SSR compatibility | Requires workarounds | Works seamlessly |
| React integration | Requires useEffect hacks | Native hook usage |

---

## Tailwind CSS Configuration

```javascript
// tailwind.config.js
export default {
  darkMode: 'class',  // Required for Jotai theme control
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    // Override default screens with our 10 breakpoints
    screens: {
      'xs': '280px',
      'sm': '360px',
      'md': '480px',
      'lg': '640px',
      'xl': '768px',
      '2xl': '1024px',
      '3xl': '1280px',
      '4xl': '1536px',
      '5xl': '2048px',
      '6xl': '3000px',
      // Height breakpoints (raw media queries)
      'h-xs': { 'raw': '(min-height: 490px)' },
      'h-sm': { 'raw': '(min-height: 600px)' },
      'h-md': { 'raw': '(min-height: 700px)' },
      'h-lg': { 'raw': '(min-height: 800px)' },
      'h-xl': { 'raw': '(min-height: 900px)' },
      'h-2xl': { 'raw': '(min-height: 1024px)' },
      'h-3xl': { 'raw': '(min-height: 1200px)' },
      'h-4xl': { 'raw': '(min-height: 1440px)' },
      'h-5xl': { 'raw': '(min-height: 1800px)' },
      'h-6xl': { 'raw': '(min-height: 2000px)' },
    },
    // Override border radius with Apple-style values
    borderRadius: {
      'none': '0',
      'sm': '0.5rem',
      'md': '1rem',
      'lg': '1.5rem',
      'xl': '2.2rem',
      '2xl': '3rem',
      'full': '9999px',
    },
    extend: {
      // Glass effect utilities
      backdropBlur: {
        'glass': '20px',
      },
      backdropSaturate: {
        'glass': '180%',
      },
      // Apple-inspired shadows
      boxShadow: {
        'glass': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'glass-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        'glass-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      },
      // Apple system font stack
      fontFamily: {
        'system': [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
```

---

## CSS Custom Properties

Add these to your global CSS file for additional flexibility:

```css
/* globals.css */
:root {
  /* Border Radius Scale */
  --radius-none: 0;
  --radius-sm: 0.5rem;
  --radius-md: 1rem;
  --radius-lg: 1.5rem;
  --radius-xl: 2.2rem;
  --radius-2xl: 3rem;
  --radius-full: 9999px;

  /* Glass Effect Properties */
  --glass-blur: 20px;
  --glass-saturation: 180%;

  /* Light Mode Glass */
  --glass-bg: rgba(255, 255, 255, 0.72);
  --glass-bg-subtle: rgba(255, 255, 255, 0.5);
  --glass-bg-solid: rgba(255, 255, 255, 0.9);
  --glass-border: rgba(255, 255, 255, 0.18);
  --glass-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.dark {
  /* Dark Mode Glass */
  --glass-bg: rgba(0, 0, 0, 0.5);
  --glass-bg-subtle: rgba(0, 0, 0, 0.3);
  --glass-bg-solid: rgba(0, 0, 0, 0.75);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}
```

---

## Utility Classes

### Glass Component Classes

```css
/* Base glass effect */
.glass {
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--glass-shadow);
}

/* Glass variants */
.glass-subtle {
  background: var(--glass-bg-subtle);
}

.glass-solid {
  background: var(--glass-bg-solid);
}

/* Glass with smaller radius */
.glass-sm {
  border-radius: var(--radius-md);
}
```

### Tailwind @apply Utilities

```css
/* Use in your component styles */
@layer components {
  .glass-card {
    @apply backdrop-blur-glass backdrop-saturate-glass
           bg-white/70 dark:bg-black/50
           border border-white/20 dark:border-white/10
           rounded-xl shadow-glass dark:shadow-glass-dark;
  }

  .glass-button {
    @apply backdrop-blur-glass backdrop-saturate-glass
           bg-white/60 dark:bg-black/40
           border border-white/20 dark:border-white/10
           rounded-lg px-4 py-2
           hover:bg-white/80 dark:hover:bg-black/60
           transition-colors duration-200;
  }

  .glass-input {
    @apply backdrop-blur-glass backdrop-saturate-glass
           bg-white/50 dark:bg-black/30
           border border-white/20 dark:border-white/10
           rounded-lg px-4 py-2
           focus:outline-none focus:ring-2 focus:ring-white/30
           placeholder:text-gray-500 dark:placeholder:text-gray-400;
  }
}
```

---

## React Component Examples

### GlassCard Component

```tsx
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
  const variantClasses = {
    default: 'bg-white/70 dark:bg-black/50',
    subtle: 'bg-white/50 dark:bg-black/30',
    solid: 'bg-white/90 dark:bg-black/75',
  };

  return (
    <div
      className={`
        backdrop-blur-glass backdrop-saturate-glass
        ${variantClasses[variant]}
        border border-white/20 dark:border-white/10
        rounded-xl shadow-glass dark:shadow-glass-dark
        ${className}
      `}
    >
      {children}
    </div>
  );
}
```

### Responsive Container Example

```tsx
export function ResponsiveContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="
      w-full px-4
      xs:px-4
      sm:px-6
      md:px-8
      lg:max-w-2xl lg:mx-auto
      xl:max-w-3xl
      2xl:max-w-4xl
      3xl:max-w-5xl
      4xl:max-w-6xl
      5xl:max-w-7xl
      6xl:max-w-[1800px]
    ">
      {children}
    </div>
  );
}
```

---

## Usage Guidelines

### Do's

- Use `rounded-xl` (2.2rem) for primary containers (cards, modals, panels)
- Use `rounded-lg` (1.5rem) for secondary elements (buttons, inputs)
- Always include `-webkit-backdrop-filter` for Safari support
- Test glass effects on various background colors/images
- Use height breakpoints for critical above-fold content

### Don'ts

- Don't use glass effects on solid color backgrounds (no visual benefit)
- Don't nest multiple glass layers (performance impact)
- Don't use glass blur values above 30px (diminishing returns)
- Don't forget dark mode variants for all glass elements
- Don't use `prefers-color-scheme` or `<html data-theme>` for theming — use Jotai atoms

---

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| `backdrop-filter` | 76+ | 103+ | 9+ | 79+ |
| `border-radius` | All | All | All | All |
| CSS Custom Properties | 49+ | 31+ | 9.1+ | 15+ |

### Fallback for Older Browsers

```css
.glass {
  /* Fallback for browsers without backdrop-filter */
  background: rgba(255, 255, 255, 0.95);
}

@supports (backdrop-filter: blur(20px)) {
  .glass {
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: blur(20px) saturate(180%);
  }
}
```
