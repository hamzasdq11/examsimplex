

# Plan: Fix Hero Showcase Angle to Match Brix Templates

## Problem Analysis

Comparing our current hero (screenshot) with the Brix reference:

| Aspect | Current | Brix Reference |
|--------|---------|----------------|
| Forward tilt (rotateX) | 12deg - too aggressive, cards look flat | ~4-5deg - subtle, cards remain readable |
| Side perspective (rotateY) | -8deg - too subtle | ~-12deg - creates clear left-to-right depth |
| Z rotation | 2deg - adds awkward skew | 0deg - columns stay vertical |
| Overall feel | Distorted, hard to read | Natural 3D depth, cards remain clear |

## Solution

### File: `src/components/landing/Hero.tsx` (line 113)

Update the transform from:
```css
transform: 'rotateX(12deg) rotateY(-8deg) rotateZ(2deg)'
```

To:
```css
transform: 'rotateX(4deg) rotateY(-12deg) rotateZ(0deg)'
```

Changes:
- **rotateX: 12 -> 4** -- Much less forward tilt so cards stay upright and readable
- **rotateY: -8 -> -12** -- Stronger side angle creates the depth illusion where right side recedes, matching Brix
- **rotateZ: 2 -> 0** -- Remove Z rotation to keep columns clean and vertical

Also increase the perspective value for a more natural depth feel:

```css
perspective: '1000px' -> perspective: '1200px'
```

A larger perspective value makes the 3D effect more subtle and natural, closer to Brix's refined look.

## Files to Modify

1. **`src/components/landing/Hero.tsx`** -- Update transform values (line 113) and perspective (line 103)

