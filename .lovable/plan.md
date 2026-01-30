

# Plan: Apply iOS 26 Liquid Glass Style

## Overview

Transform the website's visual appearance with Apple's iOS 26 "Liquid Glass" design language, featuring frosted glass effects, subtle transparency, enhanced blur, and refined shadows across all UI components.

## Design Principles

The Liquid Glass aesthetic is characterized by:
- **Frosted glass backgrounds**: Semi-transparent surfaces with backdrop blur
- **Subtle gradient borders**: Light borders with gradient shimmer
- **Soft shadows**: Diffused, layered shadows for depth
- **Refined corners**: Larger, smoother border radii
- **Light overlays**: White-tinted translucent surfaces

---

## File Changes

### 1. CSS Variables and Utility Classes

**File: `src/index.css`**

Add new CSS variables for glass effects and utility classes:

```css
:root {
  /* Glass effect variables */
  --glass-bg: 0 0% 100% / 0.7;
  --glass-bg-subtle: 0 0% 100% / 0.5;
  --glass-border: 0 0% 100% / 0.3;
  --glass-blur: 16px;
  --glass-blur-heavy: 24px;
  --glass-shadow: 0 8px 32px -8px hsl(242 48% 23% / 0.1);
}

/* Glass utility classes */
.glass {
  background: hsl(var(--glass-bg));
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid hsl(var(--glass-border));
}

.glass-heavy {
  background: hsl(var(--glass-bg));
  backdrop-filter: blur(var(--glass-blur-heavy));
  -webkit-backdrop-filter: blur(var(--glass-blur-heavy));
}

.glass-subtle {
  background: hsl(var(--glass-bg-subtle));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
```

---

### 2. Card Component

**File: `src/components/ui/card.tsx`**

Update Card to use glass morphism:

```tsx
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-white/20 bg-white/70 backdrop-blur-xl text-card-foreground shadow-[0_8px_32px_-8px_hsl(242_48%_23%/0.1)]",
        className
      )}
      {...props}
    />
  )
);
```

---

### 3. Dialog Component

**File: `src/components/ui/dialog.tsx`**

Update overlay and content with glass effects:

```tsx
// DialogOverlay - lighter, blurred background
className={cn(
  "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in ...",
  className
)}

// DialogContent - glass panel
className={cn(
  "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-white/20 bg-white/80 backdrop-blur-2xl p-6 shadow-[0_16px_48px_-12px_hsl(242_48%_23%/0.15)] duration-200 sm:rounded-2xl ...",
  className
)}
```

---

### 4. Dropdown Menu Component

**File: `src/components/ui/dropdown-menu.tsx`**

Apply glass to dropdown content:

```tsx
// DropdownMenuContent
className={cn(
  "z-50 min-w-[8rem] overflow-hidden rounded-xl border border-white/20 bg-white/80 backdrop-blur-xl p-1 text-popover-foreground shadow-[0_8px_32px_-8px_hsl(242_48%_23%/0.12)] ...",
  className
)}
```

---

### 5. Popover Component

**File: `src/components/ui/popover.tsx`**

Update with glass styling:

```tsx
className={cn(
  "z-50 w-72 rounded-xl border border-white/20 bg-white/80 backdrop-blur-xl p-4 text-popover-foreground shadow-[0_8px_32px_-8px_hsl(242_48%_23%/0.12)] outline-none ...",
  className
)}
```

---

### 6. Sheet Component

**File: `src/components/ui/sheet.tsx`**

Update overlay and content:

```tsx
// SheetOverlay
className={cn(
  "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in ...",
  className
)}

// sheetVariants base
"fixed z-50 gap-4 bg-white/80 backdrop-blur-2xl p-6 shadow-[0_16px_48px_-12px_hsl(242_48%_23%/0.15)] border-white/20 transition ease-in-out ..."
```

---

### 7. Button Component

**File: `src/components/ui/button.tsx`**

Add glass variant and refine existing variants:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30",
        destructive: "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25 hover:bg-destructive/90",
        outline: "border border-input bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:border-primary/30",
        secondary: "bg-secondary/80 backdrop-blur-sm text-secondary-foreground hover:bg-secondary",
        ghost: "hover:bg-white/60 hover:backdrop-blur-sm",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "bg-white/60 backdrop-blur-xl border border-white/30 text-foreground shadow-lg hover:bg-white/80",
      },
      // ... sizes remain similar but with rounded-xl
    },
  }
);
```

---

### 8. Input Component

**File: `src/components/ui/input.tsx`**

Add subtle glass effect to inputs:

```tsx
className={cn(
  "flex h-10 w-full rounded-xl border border-input bg-white/50 backdrop-blur-sm px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200",
  className
)}
```

---

### 9. Header Component

**File: `src/components/landing/Header.tsx`**

Enhance glass navigation:

```tsx
// Line 46 - Update header className
<header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/60 border-b border-white/20 transition-all duration-300">
```

---

### 10. Hero Floating Cards

**File: `src/components/landing/Hero.tsx`**

Apply glass to floating icons:

```tsx
// Lines 90, 94, 98 - Update floating icon containers
className="absolute top-4 sm:top-6 right-2 sm:right-0 w-10 h-10 sm:w-14 sm:h-14 bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl shadow-[0_8px_24px_-8px_hsl(242_48%_23%/0.1)] flex items-center justify-center hover:scale-110 hover:bg-white/90 transition-all duration-300 animate-float"
```

---

## Tailwind Config Update

**File: `tailwind.config.ts`**

Add glass-related utilities:

```typescript
extend: {
  backdropBlur: {
    xs: '2px',
  },
  boxShadow: {
    'glass': '0 8px 32px -8px hsl(242 48% 23% / 0.1)',
    'glass-lg': '0 16px 48px -12px hsl(242 48% 23% / 0.15)',
  },
}
```

---

## Summary of Changes

| Component | Key Changes |
|-----------|-------------|
| CSS Variables | Add glass effect variables and utility classes |
| Card | Glass background, backdrop blur, refined shadow, rounded-2xl |
| Dialog | Lighter overlay blur, glass content panel |
| Dropdown | Glass background with blur |
| Popover | Glass styling with subtle border |
| Sheet | Glass overlay and content |
| Button | New glass variant, enhanced shadows, rounded-xl |
| Input | Subtle glass background, smooth focus transition |
| Header | Enhanced glass navigation bar |
| Hero | Glass floating icon cards |

---

## Visual Impact

- Navigation feels lighter and more modern
- Cards appear to float above content with subtle depth
- Modals and popovers have an elegant frosted appearance
- Buttons feel more tactile with refined shadows
- Overall UI gains a premium, iOS-inspired aesthetic

