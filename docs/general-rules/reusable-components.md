# Reusable Components

## Overview

All components are **handmade** — no third-party UI libraries. Every component follows the styling rules defined in [`styling.md`](./styling.md) (glass effects, 2.2rem radius, responsive breakpoints).

---

## Component Index

### Layout & Structure

| Component | Variation | Description |
|-----------|-----------|-------------|
| `Container` | `fluid` | Responsive wrapper with max-width constraints |
| `Card` | `interactive` | Glass panel with hover state |
| `Divider` | `vertical` | Visual separator line |
| `Grid` | `masonry` | CSS grid layout system |
| `Stack` | `horizontal` | Flexbox stacking utility |
| `Spacer` | `responsive` | Dynamic spacing element |
| `Section` | `hero` | Full-width content section |
| `AspectRatio` | `video` | Fixed aspect ratio container |

### Navigation

| Component | Variation | Description |
|-----------|-----------|-------------|
| `Navbar` | `transparent` | Top navigation bar |
| `Sidebar` | `collapsible` | Side navigation panel |
| `Breadcrumb` | `truncated` | Path navigation trail |
| `Tabs` | `pills` | Tabbed content switcher |
| `Pagination` | `compact` | Page navigation controls |
| `Stepper` | `vertical` | Multi-step progress indicator |
| `NavLink` | `active` | Navigation link item |
| `Menu` | `nested` | Navigation menu group |
| `BottomNav` | `floating` | Mobile bottom navigation |
| `CommandPalette` | `spotlight` | Keyboard command menu |

### Buttons & Actions

| Component | Variation | Description |
|-----------|-----------|-------------|
| `Button` | `ghost` | Primary action trigger |
| `IconButton` | `circular` | Icon-only button |
| `ButtonGroup` | `attached` | Grouped button set |
| `FloatingAction` | `extended` | FAB with label |
| `SplitButton` | `dropdown` | Button with menu |
| `LinkButton` | `external` | Anchor styled as button |
| `CopyButton` | `inline` | Copy to clipboard |
| `DownloadButton` | `progress` | File download trigger |

### Form Inputs

| Component | Variation | Description |
|-----------|-----------|-------------|
| `Input` | `floating-label` | Text input field |
| `Textarea` | `auto-resize` | Multi-line text input |
| `Checkbox` | `indeterminate` | Boolean toggle box |
| `Radio` | `card` | Single selection option |
| `Toggle` | `labeled` | On/off switch |
| `Select` | `searchable` | Dropdown selector |
| `MultiSelect` | `tags` | Multiple selection dropdown |
| `Combobox` | `creatable` | Input + dropdown hybrid |
| `Slider` | `range` | Value range selector |
| `RangeSlider` | `dual-thumb` | Min/max range picker |
| `NumberInput` | `stepper` | Numeric input with controls |
| `PasswordInput` | `strength` | Password with visibility toggle |
| `SearchInput` | `autocomplete` | Search with suggestions |
| `DatePicker` | `range` | Date selection calendar |
| `TimePicker` | `12-hour` | Time selection input |
| `DateTimePicker` | `inline` | Combined date/time picker |
| `FileUpload` | `dropzone` | File input with drag-drop |
| `ImageUpload` | `crop` | Image upload with preview |
| `ColorPicker` | `swatches` | Color selection input |
| `RichTextEditor` | `minimal` | WYSIWYG text editor |
| `CodeInput` | `syntax` | Code/OTP input field |
| `PinInput` | `masked` | PIN/verification code input |
| `PhoneInput` | `international` | Phone number with country |
| `CurrencyInput` | `formatted` | Money input with symbol |
| `TagInput` | `suggestions` | Tag/chip input field |
| `Rating` | `half-star` | Star rating input |

### Form Structure

| Component | Variation | Description |
|-----------|-----------|-------------|
| `Form` | `inline` | Form wrapper with validation |
| `FormField` | `horizontal` | Label + input wrapper |
| `FormLabel` | `required` | Input label |
| `FormError` | `animated` | Validation error message |
| `FormHint` | `icon` | Helper text below input |
| `Fieldset` | `collapsible` | Grouped form section |

### Feedback & Notifications

| Component | Variation | Description |
|-----------|-----------|-------------|
| `Toast` | `promise` | Temporary notification |
| `Alert` | `dismissible` | Inline status message |
| `Banner` | `sticky` | Full-width announcement |
| `Snackbar` | `action` | Bottom notification bar |
| `Notification` | `stacked` | Notification list item |
| `Progress` | `circular` | Progress indicator |
| `ProgressBar` | `striped` | Linear progress bar |
| `Skeleton` | `pulse` | Loading placeholder |
| `Spinner` | `dots` | Loading spinner |
| `LoadingOverlay` | `blur` | Full-screen loader |
| `EmptyState` | `action` | No content placeholder |
| `ErrorState` | `retry` | Error with recovery |

### Overlays & Modals

| Component | Variation | Description |
|-----------|-----------|-------------|
| `Modal` | `fullscreen` | Dialog overlay |
| `Drawer` | `resizable` | Slide-in panel |
| `Sheet` | `detached` | Bottom sheet (mobile) |
| `Dialog` | `confirm` | Simple dialog box |
| `AlertDialog` | `destructive` | Confirmation dialog |
| `Lightbox` | `gallery` | Image/media viewer |
| `Popover` | `hover` | Contextual popup |
| `Tooltip` | `rich` | Hover hint |
| `ContextMenu` | `nested` | Right-click menu |
| `Dropdown` | `mega` | Dropdown menu panel |
| `HoverCard` | `preview` | Hover preview card |
| `Command` | `modal` | Command palette overlay |

### Data Display

| Component | Variation | Description |
|-----------|-----------|-------------|
| `Table` | `sortable` | Data table |
| `DataGrid` | `virtual` | Advanced data grid |
| `List` | `virtual` | Scrollable list |
| `ListItem` | `selectable` | List row item |
| `Tree` | `checkbox` | Hierarchical tree view |
| `Timeline` | `alternating` | Chronological events |
| `Feed` | `infinite` | Activity/news feed |
| `Accordion` | `multiple` | Collapsible sections |
| `Collapse` | `animated` | Single collapsible |
| `Carousel` | `fade` | Content slideshow |
| `Gallery` | `lightbox` | Image grid gallery |
| `Kanban` | `draggable` | Kanban board columns |
| `Calendar` | `week` | Calendar view |

### Data Visualization

| Component | Variation | Description |
|-----------|-----------|-------------|
| `Stat` | `trend` | Metric display card |
| `Counter` | `animated` | Animated number |
| `Chart` | `sparkline` | Mini inline chart |
| `BarChart` | `stacked` | Bar chart wrapper |
| `LineChart` | `area` | Line chart wrapper |
| `PieChart` | `donut` | Pie/donut chart |
| `Gauge` | `semi` | Gauge meter |
| `Heatmap` | `calendar` | Heat map grid |

### Media & Content

| Component | Variation | Description |
|-----------|-----------|-------------|
| `Avatar` | `group` | User avatar image |
| `AvatarGroup` | `overflow` | Stacked avatars |
| `Badge` | `dot` | Status indicator |
| `Chip` | `removable` | Tag/label chip |
| `Tag` | `colored` | Categorization tag |
| `Label` | `icon` | Small label text |
| `Icon` | `animated` | SVG icon wrapper |
| `Image` | `lazy` | Optimized image |
| `Video` | `controls` | Video player |
| `Audio` | `waveform` | Audio player |
| `Embed` | `responsive` | Iframe embed |
| `Code` | `copy` | Code snippet block |
| `CodeBlock` | `highlight` | Syntax highlighted code |
| `Markdown` | `github` | Markdown renderer |
| `PDF` | `viewer` | PDF document viewer |

### Typography

| Component | Variation | Description |
|-----------|-----------|-------------|
| `Heading` | `gradient` | H1-H6 headings |
| `Text` | `truncate` | Paragraph text |
| `Link` | `underline` | Anchor link |
| `Highlight` | `mark` | Highlighted text |
| `Kbd` | `combo` | Keyboard shortcut |
| `Blockquote` | `bordered` | Quote block |
| `Caption` | `muted` | Small caption text |

### Utility Components

| Component | Variation | Description |
|-----------|-----------|-------------|
| `Portal` | `root` | Render outside DOM tree |
| `Transition` | `fade` | Animation wrapper |
| `AnimatePresence` | `exit` | Mount/unmount animations |
| `FocusTrap` | `escape` | Focus lock container |
| `ClickAway` | `touch` | Outside click detector |
| `ScrollArea` | `horizontal` | Custom scrollbar |
| `VirtualScroll` | `dynamic` | Virtualized list |
| `Resizable` | `handle` | Resizable container |
| `Draggable` | `bounds` | Drag-and-drop item |
| `Sortable` | `grid` | Sortable list/grid |
| `InfiniteScroll` | `loader` | Infinite loading |
| `Intersection` | `once` | Visibility observer |
| `Clipboard` | `feedback` | Copy/paste handler |
| `Hotkey` | `global` | Keyboard shortcut |
| `MediaQuery` | `hook` | Responsive helper |
| `ThemeToggle` | `system` | Dark/light switcher |
| `LocaleSwitcher` | `dropdown` | Language selector |

### Authentication

| Component | Variation | Description |
|-----------|-----------|-------------|
| `LoginForm` | `social` | Login form layout |
| `SignupForm` | `steps` | Registration form |
| `ForgotPassword` | `code` | Password reset form |
| `OTPVerify` | `resend` | OTP verification |
| `SocialLogin` | `icons` | OAuth buttons group |

### E-commerce (Optional)

| Component | Variation | Description |
|-----------|-----------|-------------|
| `ProductCard` | `quick-view` | Product display card |
| `PriceTag` | `sale` | Price display |
| `CartItem` | `editable` | Cart line item |
| `CartSummary` | `sticky` | Cart totals |
| `CheckoutForm` | `express` | Checkout layout |
| `OrderStatus` | `timeline` | Order tracking |

---

## Implementation Priority

### Phase 1 — Core (MVP)
`Button`, `Input`, `Card`, `Modal`, `Toast`, `Dropdown`, `Tabs`, `Avatar`, `Badge`, `Spinner`, `Container`, `Navbar`

### Phase 2 — Forms
`Select`, `Checkbox`, `Radio`, `Toggle`, `Textarea`, `Form`, `FormField`, `DatePicker`, `FileUpload`

### Phase 3 — Data
`Table`, `Pagination`, `Accordion`, `List`, `Skeleton`, `EmptyState`, `Alert`

### Phase 4 — Advanced
`Drawer`, `Popover`, `Tooltip`, `CommandPalette`, `Calendar`, `RichTextEditor`, `Charts`

---

## File Structure

```
src/
└── components/
    ├── ui/                    # All reusable components
    │   ├── Button/
    │   │   ├── Button.tsx
    │   │   ├── Button.types.ts
    │   │   └── index.ts
    │   ├── Input/
    │   ├── Card/
    │   └── ...
    ├── layout/                # Layout components
    │   ├── Container/
    │   ├── Navbar/
    │   └── Sidebar/
    └── index.ts               # Barrel export
```

---

## Notes

- All components support **dark mode** via CSS variables
- All interactive components include **keyboard navigation**
- All components are **fully typed** with TypeScript
- Animations use **CSS transitions** or **Framer Motion patterns** (handmade)
- No dependencies on Radix, Headless UI, shadcn, or similar libraries
