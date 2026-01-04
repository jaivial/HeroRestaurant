# DropdownMenu Component

Apple-aesthetic dropdown menu with glass morphism, smooth animations, and full accessibility support.

## Components

- `DropdownMenu` - Container with trigger and menu
- `DropdownMenuItem` - Individual clickable menu item
- `DropdownMenuSeparator` - Visual divider between items

## Features

✅ **Apple Design System**
- Glass morphism effect (backdrop-blur + saturation)
- Smooth fade-in/scale animations
- 1.5rem border radius
- Theme-aware styling (light/dark)

✅ **Accessibility**
- Keyboard navigation (Escape to close)
- Click-outside-to-close
- ARIA labels support
- 44px minimum touch targets
- Focus management

✅ **Variants**
- Default menu items (primary actions)
- Danger menu items (destructive actions)

## Usage

### Basic Example

```tsx
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui';

<DropdownMenu
  align="right"
  trigger={
    <button aria-label="Actions">
      <DotsVerticalIcon />
    </button>
  }
>
  <DropdownMenuItem onClick={handleEdit} icon={<EditIcon />}>
    Edit
  </DropdownMenuItem>
  
  <DropdownMenuItem onClick={handleDuplicate} icon={<CopyIcon />}>
    Duplicate
  </DropdownMenuItem>
  
  <DropdownMenuSeparator />
  
  <DropdownMenuItem variant="danger" onClick={handleDelete} icon={<TrashIcon />}>
    Delete
  </DropdownMenuItem>
</DropdownMenu>
```

### With Dynamic Content

```tsx
<DropdownMenu
  trigger={<button>Options ⋯</button>}
>
  <DropdownMenuItem 
    onClick={() => onToggle(item.id, !item.active)}
    icon={item.active ? <XIcon /> : <CheckIcon />}
  >
    {item.active ? 'Deactivate' : 'Activate'}
  </DropdownMenuItem>
</DropdownMenu>
```

### Left-Aligned

```tsx
<DropdownMenu align="left" trigger={<button>Menu</button>}>
  <DropdownMenuItem>Action</DropdownMenuItem>
</DropdownMenu>
```

## Props

### DropdownMenu

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `ReactNode` | **required** | Element that opens the menu |
| `children` | `ReactNode` | **required** | Menu items |
| `align` | `'left' \| 'right'` | `'right'` | Alignment relative to trigger |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | - | Inline styles |

### DropdownMenuItem

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Item label |
| `onClick` | `() => void` | - | Click handler |
| `variant` | `'default' \| 'danger'` | `'default'` | Visual style |
| `icon` | `ReactNode` | - | Leading icon |
| `disabled` | `boolean` | `false` | Disable interaction |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | - | Inline styles |

### DropdownMenuSeparator

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | - | Inline styles |

## Behavior

- **Open/Close**: Click trigger to toggle
- **Click Outside**: Automatically closes
- **Escape Key**: Closes menu
- **Item Click**: Closes menu after action

## Theme Integration

Uses `themeAtom` for dark/light mode. Never uses `dark:` prefix - follows project conventions.

**Light Mode:**
- Background: `bg-white/90`
- Border: `border-white/[0.25]`
- Shadow: Subtle blue tint

**Dark Mode:**
- Background: `bg-black/75`
- Border: `border-white/20`
- Shadow: Deep black with 50% opacity

## Examples in Codebase

- `MenuCard.tsx` - Menu actions (activate, edit, delete)
