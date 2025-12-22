# Styling Guidelines

## Overview

This document defines the styling rules for the HeroRestaurant SaaS application. We follow Apple's iOS aesthetic with liquid glass (glassmorphism) effects and comprehensive responsive breakpoints.

---

## Design Principles

### Apple Aesthetic Core Values

1. **Clarity** - Clean, minimal interfaces with purposeful whitespace and high contrast.
2. **Deference** - Content takes priority over chrome; UI elements are subtle and support the content.
3. **Depth** - Layered interfaces using `z-index`, subtle glass effects, and dynamic shadows to communicate hierarchy.
4. **Consistency** - Unified design language across all viewports using a shared set of semantic tokens.
5. **Fluidity** - Motion and interactions feel natural, using spring-based animations that respond to user intent.

### Primary Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Border Radius (Primary) | `2.2rem` | Cards, modals, panels, large containers |
| Border Radius (Secondary) | `1rem` | Buttons, inputs, small elements, tooltips |
| Glass Blur | `20px` | Background blur for all translucent elements |
| Glass Saturation | `180%` | Enhanced color vibrancy for "Liquid Glass" effect |
| Grid Unit | `4px / 8px` | Base unit for all spacing, margins, and padding |

---

## Component Extensibility & SOLID

To maintain a scalable and flexible UI system, all reusable components must adhere to the following architectural standards:

### 1. SOLID Principles

- **Single Responsibility (SRP):** Each component should do one thing. If a component grows too complex, split it into smaller sub-components.
- **Open/Closed (OCP):** Components should be open for extension but closed for modification. Use props to change behavior or appearance without altering the internal logic.
- **Interface Segregation (ISP):** Components should only require the props they actually use. Avoid passing giant "config" objects if only two fields are needed.

### 2. Styling Extensibility

Every reusable component **MUST** accept and correctly merge the following props:

1.  `className`: For overriding or adding Tailwind classes from the parent.
2.  `style`: For specific inline CSS adjustments (e.g., dynamic positioning).

**Correct Implementation Pattern:**

```tsx
interface MyComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function MyComponent({ className = '', style, children }: MyComponentProps) {
  return (
    <div 
      style={style}
      className={`base-classes-here ${className}`}
    >
      {children}
    </div>
  );
}
```

---

## Typography

We use the Apple system font stack (San Francisco) to ensure a native feel. Avoid custom web fonts to maintain performance and "deference" to the OS environment.

### Font Stack Implementation

```tsx
// Apply this to the root or specific text blocks
const fontStack = "font-['-apple-system','BlinkMacSystemFont','_Segoe_UI','Roboto','Helvetica','Arial',sans-serif]";
```

### Semantic Type Hierarchy

Use arbitrary font sizes to match Apple's standard dynamic type sizes:

| Level | Size (px) | Weight | Tailwind Class | Usage |
|-------|-----------|--------|----------------|-------|
| Large Title | `34px` | `bold` | `text-[34px] font-bold leading-tight` | Main page headers |
| Title 1 | `28px` | `semibold`| `text-[28px] font-semibold leading-snug` | Section headers |
| Title 2 | `22px` | `semibold`| `text-[22px] font-semibold leading-normal`| Sub-sections |
| Body | `17px` | `normal` | `text-[17px] leading-relaxed` | Default text |
| Callout | `16px` | `semibold`| `text-[16px] font-semibold` | Action labels |
| Caption | `12px` | `normal` | `text-[12px] opacity-60` | Footnotes, meta info |

---

## Semantic Color System
<!--  -->
Instead of fixed hex codes, use semantic names based on their function. Always define values for both `light` and `dark` themes.

#### System Colors (Vibrant)

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| `systemBlue` | `#007AFF` | `#0A84FF` | Primary actions, links |
| `systemRed` | `#FF3B30" | `#FF453A" | Errors, destructive actions |
| `systemGreen`| `#34C759" | `#30D158" | Success states |
| `systemGray` | `#8E8E93" | `#8E8E93" | Neutral icons, borders |

#### Text Colors (Semantic)

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| `primary` | `#1D1D1F" | `#FFFFFF" | Main body text |
| `secondary`| `black/70` | `white/60` | Subtitles, secondary info |
| `tertiary` | `black/55` | `white/45` | Placeholder text, meta info |
| `quaternary`| `black/35` | `white/30` | Disabled text, separators |

#### Background & Surface Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| `primaryBG` | `#E5E5EA` | `#000000` | Main application background |
| `secondaryBG`| `#FFFFFF` | `#0A0A0B` | Card surfaces, grouped lists |
| `tertiaryBG` | `#F2F2F7` | `#2C2C2E` | Inner nested elements |

---

## Liquid Glass Effect

Instead of global CSS classes, use inline Tailwind with arbitrary values and conditional logic based on the current theme. The "Liquid Glass" effect requires three layers: **Translucency**, **Saturation**, and **Inner Stroke**.

### Implementation Pattern

```tsx
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';

export function GlassComponent() {
  const theme = useAtomValue(themeAtom);
  
  // 1. Translucency & Blur
  const baseClasses = "backdrop-blur-[20px] saturate-[180%]";
  
  // 2. Theme-specific colors and shadows
  const themeClasses = theme === 'dark'
    ? 'bg-black/50 border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]'
    : 'bg-white/85 border-black/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]';

  return (
    <div className={`${baseClasses} ${themeClasses} border rounded-[2.2rem]`}>
      {/* Content */}
    </div>
  );
}
```

### Inner Stroke (The "Apple Edge")

To give glass elements a premium feel, add a subtle inner border (stroke) that is lighter than the background in dark mode, and darker in light mode.

```tsx
const innerStroke = theme === 'dark' 
  ? 'border-white/20' // Lighter edge for dark mode
  : 'border-black/[0.08]'; // Darker edge for light mode
```

---

## Button Styles

We follow the four standard Apple button configurations. Buttons should always have a `rounded-[1rem]` radius and a minimum touch target of `44x44px`.

| Variant | Visuals | Usage |
|---------|---------|-------|
| **Filled** | High contrast (e.g., `systemBlue` bg) | Primary action of a view |
| **Tinted** | Low contrast (e.g., `systemBlue/10` bg) | Secondary actions |
| **Gray** | Neutral (e.g., `systemGray/10` bg) | Tertiary actions, cancel buttons |
| **Plain** | Text only (no bg) | Navigation items, minor actions |

### Button Implementation

```tsx
const buttonBase = "h-[44px] px-6 rounded-[1rem] font-semibold transition-all duration-200 active:scale-[0.98]";

const variantClasses = {
  filled: theme === 'dark' ? 'bg-[#0A84FF] text-white' : 'bg-[#007AFF] text-white',
  tinted: theme === 'dark' ? 'bg-[#0A84FF]/20 text-[#0A84FF]' : 'bg-[#007AFF]/10 text-[#007AFF]',
  gray: theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/5 text-black',
  plain: 'bg-transparent text-[#007AFF]'
};
```

---

## Fluid Motion & Animations

Animations must feel "physical" and "liquid". Avoid linear or harsh easing. Use spring-like cubic-beziers.

### Recommended Bezier Curves

| Type | Cubic Bezier | Usage |
|------|--------------|-------|
| **Standard** | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Default movement |
| **Entrance** | `cubic-bezier(0, 0, 0.2, 1)` | Modals appearing |
| **Exit** | `cubic-bezier(0.4, 0, 1, 1)` | Elements disappearing |
| **Spring** | `[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]` | Popups, scale effects |

---

## Spacing & The 8pt Grid

All layout dimensions must be multiples of **8px** (or **4px** for micro-adjustments). This ensures alignment across all Apple devices.

- **Margins/Padding:** `p-2 (8px)`, `p-4 (16px)`, `p-8 (32px)`, `p-12 (48px)`
- **Component Heights:** `h-11 (44px)` for standard interactive elements.
- **Icon Sizes:** `17px`, `20px`, `24px`.

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
    default: theme === 'dark' ? 'bg-black/50' : 'bg-white/85',
    subtle: theme === 'dark' ? 'bg-black/30' : 'bg-white/60',
    solid: theme === 'dark' ? 'bg-black/75' : 'bg-white/95',
  };

  const borderClass = theme === 'dark' ? 'border-white/10' : 'border-black/[0.08]';
  const shadowClass = theme === 'dark' 
    ? 'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3),0_2px_4px_-2px_rgba(0,0,0,0.2)]'
    : 'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-2px_rgba(0,0,0,0.04)]';

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
- **Follow the 8pt grid:** Ensure all padding and margins are multiples of 4 or 8.
- **Use SF Symbols:** Prefer Apple's icon set for internal tools or common UI actions (Home, Settings, etc.).
- **Prioritize "Vibrancy":** Use saturation and translucency to let background colors bleed through glass layers.

### Don'ts

- **Don't use `dark:` utilities.** Use conditional expressions `theme === 'dark' ? ... : ...`
- Don't use global CSS classes for glass effects or layouts
- Don't define custom themes or tokens in `tailwind.config.js`
- Don't use `prefers-color-scheme` or `<html data-theme>` for theming
- Don't nest multiple glass layers (performance impact)
- **Avoid harsh shadows:** Use large, soft, low-opacity shadows for depth.
- **Don't use "Pure Black" text on "Pure White" backgrounds:** Use `#1D1D1F` for light mode text to reduce eye strain.

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
  : 'bg-white/95 [@supports(backdrop-filter:blur(0))]:bg-white/85 [@supports(backdrop-filter:blur(0))]:backdrop-blur-[20px]';
```
