# PublicMenu Visual Preview

## 📱 Mobile Layout (375px - Primary)

```
┌─────────────────────────────────┐
│                                 │
│        🏪 (Restaurant Logo)      │
│                                 │
│        BELLA ITALIA             │
│                                 │
│      WEEKEND SPECIAL MENU       │
│                                 │
│    ┌─────────────────────┐     │
│    │       €35.00        │     │
│    │     per person      │     │
│    └─────────────────────┘     │
│                                 │
│   🍷 Drink   ☕ Coffee          │
│    included   included          │
│                                 │
├─────────────────────────────────┤
│                                 │
│  Starters                       │
│  ────                          │
│                                 │
│  ┌─────────────────────────┐   │
│  │ [Beautiful dish image]  │   │
│  │                         │   │
│  ├─────────────────────────┤   │
│  │ Bruschetta Classica     │   │
│  │                         │   │
│  │ Toasted bread with      │   │
│  │ fresh tomatoes, basil,  │   │
│  │ and extra virgin olive  │   │
│  │ oil                     │   │
│  │                         │   │
│  │ 🌾 Gluten  🥚 Eggs     │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Caprese Salad    +€3.50 │   │
│  │                         │   │
│  │ Fresh mozzarella,       │   │
│  │ tomatoes, and basil     │   │
│  │                         │   │
│  │ 🥛 Milk                 │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│                                 │
│  Main Courses                   │
│  ────                          │
│                                 │
│  ┌─────────────────────────┐   │
│  │ [Pasta dish image]      │   │
│  │                         │   │
│  ├─────────────────────────┤   │
│  │ Spaghetti Carbonara     │   │
│  │                         │   │
│  │ Traditional Roman pasta │   │
│  │ with guanciale, egg,    │   │
│  │ and Pecorino Romano     │   │
│  │                         │   │
│  │ 🌾 Gluten  🥚 Eggs     │   │
│  │ 🥛 Milk                 │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Grilled Sea Bass        │   │
│  │                         │   │
│  │ Fresh catch of the day  │   │
│  │ with lemon and herbs    │   │
│  │                         │   │
│  │ 🐟 Fish                 │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│                                 │
│  Desserts                       │
│  ────                          │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Tiramisu Classico       │   │
│  │                         │   │
│  │ Traditional Italian     │   │
│  │ coffee-flavored dessert │   │
│  │                         │   │
│  │ 🥚 Eggs  🥛 Milk        │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Panna Cotta             │   │
│  │                         │   │
│  │ Smooth vanilla cream    │   │
│  │ with berry compote      │   │
│  │                         │   │
│  │ 🥛 Milk                 │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│                                 │
│   ───────────────────────       │
│                                 │
│   Powered by Hero Restaurant    │
│                                 │
└─────────────────────────────────┘
```

---

## 🎨 Color Palette

### Light Mode
```
Background:    #F5F5F7  (Apple Gray)
Cards:         rgba(255,255,255,0.9)  (White 90%)
Borders:       rgba(0,0,0,0.05)
Primary Text:  #1D1D1F  (Apple Dark)
Secondary:     rgba(0,0,0,0.6)
Tertiary:      rgba(0,0,0,0.4)
Accent (Blue): #007AFF
```

### Dark Mode
```
Background:    #000000  (Pure Black)
Cards:         rgba(0,0,0,0.3)  (Black 30%)
Borders:       rgba(255,255,255,0.1)
Primary Text:  #FFFFFF
Secondary:     rgba(255,255,255,0.6)
Tertiary:      rgba(255,255,255,0.4)
Accent (Blue): #0A84FF
```

---

## 🎯 Key Visual Elements

### 1. MenuHeader Component
- **Restaurant Logo:** 80x80px, rounded-[1.5rem], centered, shadow
- **Restaurant Name:** UPPERCASE, 11px, tracking-wide, secondary color
- **Menu Title:** 28px, semibold, dark/white
- **Price Badge:** Glass background, 22px price, 11px label
- **Include Badges:** Blue accent, icon + text, pill-shaped

### 2. DishCard Component
- **Container:** rounded-[2.2rem], glass effect, border
- **Image:** 16:10 aspect ratio, lazy-loaded, rounded-top
- **Title:** 17px, semibold, with supplement price aligned right
- **Description:** 15px, secondary color, relaxed line-height
- **Allergen Tags:** Icon (14px) + Name (12px), rounded-full pills

### 3. Section Header
- **Title:** 22px, bold, primary color
- **Divider:** 1px height, 64px width, 20% opacity

### 4. States

**Loading Skeleton:**
```
┌─────────────────┐
│  ⚪ (circular)  │  ← Logo
│  ▂▂▂▂ (text)    │  ← Name
│  ▂▂▂▂▂▂ (text)  │  ← Title
│  ▂▂▂ (rounded)  │  ← Price
└─────────────────┘

▂▂▂▂▂ (text)       ← Section

┌───────────────┐
│ ▂▂▂▂▂▂▂▂▂▂   │  ← Dish title
│ ▂▂▂▂▂▂▂▂     │  ← Description
│ ▂▂▂  ▂▂▂     │  ← Allergens
└───────────────┘
```

**404 Not Found:**
```
┌─────────────────┐
│                 │
│       🔍        │  (8xl emoji)
│                 │
│  Menu Not Found │  (title1, bold)
│                 │
│  The menu you're│  (body, secondary)
│  looking for... │
│                 │
└─────────────────┘
```

**Inactive Menu:**
```
┌─────────────────┐
│                 │
│       🍽️        │  (8xl emoji)
│                 │
│  Menu Currently │  (title1, bold)
│   Unavailable   │
│                 │
│  This menu from │  (body, secondary)
│  Bella Italia   │  (bold restaurant)
│  is not active  │
│                 │
└─────────────────┘
```

---

## 📐 Spacing & Measurements

### Container
- Max width: `768px` (3xl)
- Padding: `24px` (6) on mobile
- Padding: `32px` (8) on tablet+

### Cards
- Border radius: `2.2rem`
- Padding: `24px` (6)
- Gap between cards: `16px` (4)

### Typography
- Title 1: 28px / line-height: 1.2
- Title 2: 22px / line-height: 1.3
- Headline: 17px / line-height: 1.4
- Subheadline: 15px / line-height: 1.5
- Caption: 12px / line-height: 1.3

### Touch Targets
- Buttons: min `44x44px`
- Allergen tags: `28px` height (readable, not interactive)

---

## 🌊 Animations

### Card Hover (not used on mobile)
- Transform: `scale(1.01)`
- Shadow: Increased depth
- Duration: `300ms`
- Easing: `cubic-bezier(0.25,0.1,0.25,1)`

### Loading Skeleton
- Animation: `pulse` (Tailwind built-in)
- Additional: `shimmer` gradient sweep

### Image Lazy Load
- Native browser `loading="lazy"`
- Fade-in on load (browser default)

---

## 🎭 Glass Morphism Effect

```css
backdrop-blur-[20px]
saturate-[180%]

/* Light Mode */
background: rgba(255, 255, 255, 0.72)
border: rgba(255, 255, 255, 0.18)
shadow: rgba(31, 38, 135, 0.07)

/* Dark Mode */
background: rgba(0, 0, 0, 0.5)
border: rgba(255, 255, 255, 0.1)
shadow: rgba(0, 0, 0, 0.37)
```

---

## 🏆 Design Highlights

1. **Premium Feel:** Glass effects, generous whitespace, professional typography
2. **Mobile Optimized:** Single column, easy scrolling, large touch targets
3. **Visual Hierarchy:** Clear title → section → dish progression
4. **Information Density:** Balanced - not overwhelming, not sparse
5. **Allergen Clarity:** Icons + text for universal understanding
6. **Price Transparency:** Fixed price upfront, supplements clearly marked
7. **Brand Consistency:** Restaurant logo and name prominently displayed
8. **Trust Signals:** Professional layout, clear information, accessible design

---

## 📱 Responsive Behavior

### Mobile (< 640px)
- Single column layout
- Full-width cards
- Padding: 24px

### Tablet (640px - 1024px)
- Same layout (mobile-first)
- Max-width container (768px)
- Centered content
- Padding: 32px

### Desktop (> 1024px)
- Max-width container (768px)
- Centered on screen
- Generous margins
- Padding: 32px

**Note:** Design is intentionally mobile-first since QR codes are primarily scanned on phones.

---

## ✨ Special Features

### Conditional Display
- **Images:** Only shown if `showImage: true` AND `imageUrl` exists
- **Descriptions:** Only shown if `showDescription: true` AND `description` exists
- **Allergens:** Hidden if allergens array includes `'none'`
- **Supplement Price:** Only shown if `hasSupplement: true` AND price exists

### Performance
- **Lazy Loading:** All images use `loading="lazy"` attribute
- **Memoization:** All components wrapped with `React.memo()`
- **Single Render:** Efficient state management, minimal re-renders

### Accessibility
- **Alt Text:** All images have descriptive alt text
- **Semantic HTML:** Proper heading hierarchy (h1 → h2)
- **Color Contrast:** WCAG AA compliant (4.5:1 minimum)
- **Touch Targets:** 44px minimum for interactive elements
- **Focus States:** Visible focus indicators on buttons
