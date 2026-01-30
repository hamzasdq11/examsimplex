
# Plan: Update Website Color Scheme with New Design System Palette

## Overview

This plan updates all CSS color variables in `src/index.css` to match the provided design system palette while maintaining WCAG accessibility standards and preserving the existing component structure.

## Color Palette Reference (HEX to HSL Conversion)

### Primary Colors (Brand Identity, CTAs, Links)
| Name | HEX | HSL |
|------|-----|-----|
| Primary 9 (darkest) | #080066 | 245 100% 20% |
| Primary 8 | #231A97 | 246 70% 35% |
| Primary 7 | #453AD1 | 245 62% 52% |
| Primary 6 (main) | #4A3AFF | 246 100% 61% |
| Primary 5 | #6055F2 | 244 85% 64% |
| Primary 4 | #766CFF | 245 100% 71% |
| Primary 3 | #B5AFFF | 244 100% 84% |
| Primary 2 | #E2E0FF | 244 100% 94% |
| Primary 1 (lightest) | #F4F3FF | 247 100% 98% |

### Secondary Colors (Accents, Badges, Charts)
| Name | HEX | HSL |
|------|-----|-----|
| Secondary 1 | #3324D5 | 249 72% 49% |
| Secondary 2 | #F2F1FF | 244 100% 97% |
| Secondary 3 | #7D42FB | 265 96% 62% |
| Secondary 4 | #2D68FF | 223 100% 59% |

### Neutral Colors (Backgrounds, Typography, Borders)
| Name | HEX | HSL |
|------|-----|-----|
| Neutral 800 (darkest) | #211F54 | 242 48% 23% |
| Neutral 700 | #4E4775 | 252 26% 37% |
| Neutral 600 | #6E7191 | 235 14% 50% |
| Neutral 500 | #A0A3BD | 234 19% 68% |
| Neutral 400 | #DCDDEB | 236 30% 89% |
| Neutral 300 | #EFF0F6 | 234 33% 95% |
| Neutral 200 | #F7F7FC | 240 33% 98% |
| White | #FFFFFF | 0 0% 100% |

### System Colors (States)
| State | Shade | HEX | HSL |
|-------|-------|-----|-----|
| Info (Blue) | 400 | #086CD9 | 211 93% 44% |
| Info (Blue) | 300 | #1D88FE | 212 99% 55% |
| Info (Blue) | 200 | #8FC3FF | 212 100% 78% |
| Info (Blue) | 100 | #EAF4FF | 212 100% 96% |
| Success (Green) | 400 | #11845B | 156 78% 29% |
| Success (Green) | 300 | #05C168 | 153 96% 39% |
| Success (Green) | 200 | #7FDCA4 | 148 58% 68% |
| Success (Green) | 100 | #DEF2E6 | 148 43% 91% |
| Error (Red) | 400 | #DC2B2B | 0 72% 52% |
| Error (Red) | 300 | #FF5A65 | 356 100% 68% |
| Error (Red) | 200 | #FFBEC2 | 356 100% 87% |
| Error (Red) | 100 | #FFEFF0 | 356 100% 97% |
| Warning (Yellow) | 400 | #FFA800 | 39 100% 50% |
| Warning (Yellow) | 300 | #FDBD1A | 43 98% 55% |
| Warning (Yellow) | 200 | #FFE39B | 43 100% 80% |
| Warning (Yellow) | 100 | #FFF6E4 | 43 100% 95% |

---

## File Changes

### File 1: `src/index.css`

Update the CSS variables in the `:root` selector with the new palette:

**Lines 19-71** - Replace CSS variables:

```css
@layer base {
  :root {
    /* Backgrounds & Surfaces - Using Neutral palette */
    --background: 0 0% 100%;
    --foreground: 242 48% 23%;

    --card: 0 0% 100%;
    --card-foreground: 242 48% 23%;

    --popover: 0 0% 100%;
    --popover-foreground: 242 48% 23%;

    /* Primary - Using Primary 6 (#4A3AFF) as main */
    --primary: 246 100% 61%;
    --primary-foreground: 0 0% 100%;

    /* Secondary - Using Primary 2 for light secondary backgrounds */
    --secondary: 244 100% 94%;
    --secondary-foreground: 242 48% 23%;

    /* Muted - Using Neutral 300 */
    --muted: 234 33% 95%;
    --muted-foreground: 235 14% 50%;

    /* Accent - Using Primary 1 for subtle accents */
    --accent: 247 100% 98%;
    --accent-foreground: 242 48% 23%;

    /* Destructive - Using System Red 400 */
    --destructive: 0 72% 52%;
    --destructive-foreground: 0 0% 100%;

    /* Borders & Inputs - Using Neutral 400 */
    --border: 236 30% 89%;
    --input: 236 30% 89%;
    --ring: 246 100% 61%;

    --radius: 0.75rem;

    /* Card accent colors - Updated to match palette */
    --card-cyan: 212 100% 96%;
    --card-lavender: 244 100% 94%;
    --card-blue: 223 100% 94%;
    --card-pink: 356 100% 97%;
    --card-purple: 265 96% 94%;
    --card-mint: 148 43% 91%;

    /* Section backgrounds - Using Primary 9 */
    --section-dark: 245 100% 20%;

    /* Sidebar - Using Neutral palette */
    --sidebar-background: 240 33% 98%;
    --sidebar-foreground: 252 26% 37%;
    --sidebar-primary: 242 48% 23%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 234 33% 95%;
    --sidebar-accent-foreground: 242 48% 23%;
    --sidebar-border: 236 30% 89%;
    --sidebar-ring: 246 100% 61%;

    /* System colors for states */
    --info: 211 93% 44%;
    --info-foreground: 0 0% 100%;
    --success: 156 78% 29%;
    --success-foreground: 0 0% 100%;
    --warning: 39 100% 50%;
    --warning-foreground: 242 48% 23%;
  }
}
```

The dark mode section (lines 73-118) will be kept for future re-activation but updated to use the same palette philosophy with darker variants.

---

### File 2: `tailwind.config.ts`

Add new system color tokens for info, success, and warning states:

**Lines 34-44** - Add new color definitions after destructive:

```typescript
destructive: {
  DEFAULT: "hsl(var(--destructive))",
  foreground: "hsl(var(--destructive-foreground))",
},
info: {
  DEFAULT: "hsl(var(--info))",
  foreground: "hsl(var(--info-foreground))",
},
success: {
  DEFAULT: "hsl(var(--success))",
  foreground: "hsl(var(--success-foreground))",
},
warning: {
  DEFAULT: "hsl(var(--warning))",
  foreground: "hsl(var(--warning-foreground))",
},
```

---

## Color Application Summary

| UI Element | CSS Variable | New Color |
|------------|--------------|-----------|
| Primary buttons, links, CTAs | `--primary` | Primary 6 (#4A3AFF) |
| Button text on primary | `--primary-foreground` | White |
| Secondary buttons/badges | `--secondary` | Primary 2 (#E2E0FF) |
| Text on secondary | `--secondary-foreground` | Neutral 800 |
| Main background | `--background` | White |
| Main text | `--foreground` | Neutral 800 (#211F54) |
| Muted text | `--muted-foreground` | Neutral 600 (#6E7191) |
| Borders | `--border` | Neutral 400 (#DCDDEB) |
| Error states | `--destructive` | Red 400 (#DC2B2B) |
| Info states | `--info` | Blue 400 (#086CD9) |
| Success states | `--success` | Green 400 (#11845B) |
| Warning states | `--warning` | Yellow 400 (#FFA800) |
| Dark sections | `--section-dark` | Primary 9 (#080066) |

---

## Accessibility Considerations

- Primary text (#211F54) on white background: Contrast ratio ~12:1 (exceeds WCAG AAA)
- Primary button (#4A3AFF) with white text: Contrast ratio ~5.2:1 (meets WCAG AA)
- Muted text (#6E7191) on white: Contrast ratio ~5.8:1 (meets WCAG AA)
- All system state colors maintain sufficient contrast with their respective foreground colors

---

## Technical Details

Files to modify:
1. `src/index.css` - Update all CSS custom properties
2. `tailwind.config.ts` - Add info, success, warning color tokens

No component file changes needed - all components already use the CSS variable system via Tailwind classes.
