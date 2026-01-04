# DropdownMenu Visual Guide

## Component Structure

```
┌──────────────────────────────────────┐
│          DropdownMenu                │
│  ┌────────────────────────────────┐  │
│  │         Trigger Button          │  │
│  │           [⋯ Icon]             │  │ ← Click to open
│  └────────────────────────────────┘  │
│                ↓                     │
│  ┌────────────────────────────────┐  │
│  │      Glass Menu Panel          │  │
│  │ ┌────────────────────────────┐ │  │
│  │ │ [Icon] Activate Menu       │ │  │ ← DropdownMenuItem
│  │ └────────────────────────────┘ │  │
│  │ ┌────────────────────────────┐ │  │
│  │ │ [Icon] Edit Menu           │ │  │ ← DropdownMenuItem
│  │ └────────────────────────────┘ │  │
│  │ ──────────────────────────────  │  │ ← DropdownMenuSeparator
│  │ ┌────────────────────────────┐ │  │
│  │ │ [Icon] Delete Menu (red)   │ │  │ ← DropdownMenuItem (danger)
│  │ └────────────────────────────┘ │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

## Animation Timeline

```
CLOSED STATE (t=0ms)
┌─────────┐
│   ⋯     │  opacity: 0
└─────────┘  scale: 0.95
             translateY: -8px
             pointer-events: none

    ↓ Click trigger

ANIMATING (t=0-200ms)
┌─────────┐
│   ⋯     │  opacity: 0 → 100%
└─────────┘  scale: 0.95 → 1.0
    ↓        translateY: -8px → 0
┌───────────────────┐
│ [Icon] Action 1   │
│ [Icon] Action 2   │
│ ───────────────── │
│ [Icon] Delete     │
└───────────────────┘

OPEN STATE (t=200ms)
┌─────────┐
│   ⋯     │  opacity: 100%
└─────────┘  scale: 1.0
    ↓        translateY: 0
┌───────────────────┐  pointer-events: auto
│ [Icon] Action 1   │
│ [Icon] Action 2   │
│ ───────────────── │
│ [Icon] Delete     │
└───────────────────┘

    ↓ Click outside / Escape

CLOSING (t=0-200ms)
Reverse animation
```

## Theme Comparison

### Light Mode
```
┌─────────────────────────────────┐
│  Trigger: transparent → blue/10 │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│ Menu Background: white/90       │
│ Border: white/25%               │
│ Shadow: rgba(31,38,135,0.15)    │
│ ┌─────────────────────────────┐ │
│ │ Item: black on white/5      │ │ ← Hover
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Danger: red on red/5        │ │ ← Hover
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Dark Mode
```
┌─────────────────────────────────┐
│  Trigger: transparent → blue/10 │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│ Menu Background: black/75       │
│ Border: white/20                │
│ Shadow: rgba(0,0,0,0.5)         │
│ ┌─────────────────────────────┐ │
│ │ Item: white on white/10     │ │ ← Hover
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Danger: #FF453A on red/10   │ │ ← Hover
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## MenuCard Before & After

### BEFORE (Old Design)
```
┌───────────────────────────────────────────────────────────────┐
│  [Menu Icon]  Title                                           │
│               Fixed Price • 25€ • Drink included              │
│                                                               │
│  Status: Active [Toggle]  [Edit Button]  [Delete Button]     │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### AFTER (New Design with Dropdown)
```
┌───────────────────────────────────────────────────────────────┐
│  [Menu Icon]  Title                                           │
│               Fixed Price • 25€ • Drink included              │
│                                                               │
│  Status: Active                              [⋯]             │
│                                               ↓               │
│                                  ┌──────────────────────┐     │
│                                  │ ✓ Deactivate Menu    │     │
│                                  │ ✏ Edit Menu         │     │
│                                  │ ──────────────────── │     │
│                                  │ 🗑 Delete Menu      │     │
│                                  └──────────────────────┘     │
└───────────────────────────────────────────────────────────────┘
```

**Improvements:**
- ✅ Less visual clutter (1 button vs 2)
- ✅ Status toggle moved into dropdown
- ✅ Better mobile experience
- ✅ Consistent action pattern
- ✅ Easy to add more actions
- ✅ Professional, modern look

## Touch Target Sizes

```
Trigger Button
┌─────────────────────┐
│                     │
│    44px × 44px      │  ← Minimum WCAG AAA
│                     │
└─────────────────────┘

Menu Item
┌──────────────────────────────┐
│ [Icon]  Label Text           │  ← min-height: 44px
│                              │  padding: 12px 16px
└──────────────────────────────┘

Separator
──────────────────────────────── ← height: 1px, margin: 8px 16px
```

## Alignment Options

### align="right" (default)
```
                    Trigger
                       [⋯]
                        ↓
          ┌───────────────────┐
          │ Action 1          │
          │ Action 2          │
          └───────────────────┘
                    ↑
                   Menu aligns to right edge
```

### align="left"
```
Trigger
  [⋯]
   ↓
┌───────────────────┐
│ Action 1          │
│ Action 2          │
└───────────────────┘
↑
Menu aligns to left edge
```

## Interaction States

### Trigger States
```
Default:     [⋯]  (transparent)
Hover:       [⋯]  (blue/10 background)
Active:      [⋯]  (scale 0.95)
Open:        [⋯]  (blue/10 background)
```

### Menu Item States
```
Default:     [Icon] Label
Hover:       [Icon] Label  (background highlight)
Active:      [Icon] Label  (no change, closes immediately)
Disabled:    [Icon] Label  (opacity 50%, no interaction)
```

### Danger Variant
```
Default:     [Icon] Delete  (red text)
Hover:       [Icon] Delete  (red text + red/5 background)
```

## Z-Index Layering

```
z-0    Base content (cards, etc.)
  ↓
z-10   Elevated content
  ↓
z-20   Modals backdrop
  ↓
z-30   Modals
  ↓
z-40   Toasts
  ↓
z-50   DropdownMenu ← Here
  ↓
z-60   Tooltips (if implemented)
```

## Glass Morphism Effect

```
┌─────────────────────────────────┐
│  backdrop-blur-[20px]           │  ← Blur background
│  saturate-[180%]                │  ← Enhance colors
│  bg-white/90 or bg-black/75     │  ← Semi-transparent bg
│  border-white/25 or /20         │  ← Subtle border
│  shadow-[...]                   │  ← Depth shadow
└─────────────────────────────────┘

Result: Frosted glass effect that allows
background to show through while maintaining
legibility and depth.
```

## Keyboard Navigation

```
[Tab]        → Focus trigger button
[Enter]      → Open menu
[Escape]     → Close menu
[Tab]        → Navigate items (future enhancement)
[↑/↓]        → Navigate items (future enhancement)
[Enter]      → Activate focused item
[Space]      → Activate focused item
Click Outside → Close menu
```

## Responsive Behavior

### Desktop (≥ 768px)
```
Menu aligns to trigger
Min-width: 200px
Max-width: None (content-based)
Position: absolute
```

### Mobile (< 768px)
```
Same behavior, but:
- Touch targets remain 44px
- Backdrop blur may be reduced on older devices
- Menu may shift to stay in viewport
```

## Usage Patterns

### Simple Actions
```tsx
<DropdownMenu trigger={<DotsIcon />}>
  <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
  <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
</DropdownMenu>
```

### With Icons
```tsx
<DropdownMenu trigger={<DotsIcon />}>
  <DropdownMenuItem icon={<EditIcon />} onClick={handleEdit}>
    Edit
  </DropdownMenuItem>
  <DropdownMenuItem icon={<TrashIcon />} onClick={handleDelete}>
    Delete
  </DropdownMenuItem>
</DropdownMenu>
```

### With Separator & Danger
```tsx
<DropdownMenu trigger={<DotsIcon />}>
  <DropdownMenuItem icon={<EditIcon />} onClick={handleEdit}>
    Edit
  </DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem 
    variant="danger" 
    icon={<TrashIcon />} 
    onClick={handleDelete}
  >
    Delete
  </DropdownMenuItem>
</DropdownMenu>
```

### Dynamic Content
```tsx
<DropdownMenu trigger={<DotsIcon />}>
  <DropdownMenuItem 
    icon={item.active ? <XIcon /> : <CheckIcon />}
    onClick={() => toggle(!item.active)}
  >
    {item.active ? 'Deactivate' : 'Activate'}
  </DropdownMenuItem>
</DropdownMenu>
```

---

## Summary

The DropdownMenu component provides a beautiful, accessible, and performant solution for action menus. Its glass morphism effect, smooth animations, and careful attention to accessibility make it a perfect fit for the Hero Restaurant design system.

**Key Visual Features:**
- 🎨 Apple-inspired glass effect
- ✨ Smooth 200ms fade-in/scale animation
- 🎯 44px minimum touch targets
- 🌓 Seamless dark/light theme support
- ⚡ GPU-accelerated transforms
- ♿ Full accessibility support
