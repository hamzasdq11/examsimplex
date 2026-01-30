

# Plan: Revert University Card Colors to Original Pastel Style

## Overview

Restore the university cards in the Features section to their original colorful pastel appearance, as shown in the screenshot (pink/rose tinted backgrounds with matching colored top borders).

## Changes Required

### File: `src/components/landing/Features.tsx`

**Lines 48-51** - Replace the neutralized color arrays with the original Tailwind pastel colors:

**Current Code:**
```tsx
// Neutral background colors from palette
const bgColors = ["bg-muted", "bg-primary-soft", "bg-muted", "bg-primary-soft", "bg-muted", "bg-primary-soft"];
// Semantic border colors for variety
const borderColors = ["border-t-primary/60", "border-t-success/60", "border-t-warning/60", "border-t-primary/60", "border-t-success/60", "border-t-warning/60"];
```

**Updated Code:**
```tsx
// Pastel background colors for variety
const bgColors = ["bg-rose-50", "bg-sky-50", "bg-amber-50", "bg-emerald-50", "bg-violet-50", "bg-cyan-50"];
// Matching border top colors
const borderColors = ["border-t-rose-300", "border-t-sky-300", "border-t-amber-300", "border-t-emerald-300", "border-t-violet-300", "border-t-cyan-300"];
```

## Visual Result

The university cards will display with:
- **Rose/Pink card**: `bg-rose-50` background with `border-t-rose-300` top border
- **Sky/Blue card**: `bg-sky-50` background with `border-t-sky-300` top border
- **Amber/Yellow card**: `bg-amber-50` background with `border-t-amber-300` top border
- **Emerald/Green card**: `bg-emerald-50` background with `border-t-emerald-300` top border
- **Violet/Purple card**: `bg-violet-50` background with `border-t-violet-300` top border
- **Cyan card**: `bg-cyan-50` background with `border-t-cyan-300` top border

This restores the colorful, varied appearance of the university cards as shown in the reference screenshot.

