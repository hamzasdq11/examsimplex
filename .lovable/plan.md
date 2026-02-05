

# Plan: Fix Card Flow Diagonal Angle

## Issue Analysis

The black lines you drew show the desired flow direction - cards should appear to flow diagonally from top-right toward bottom-left. Currently the transform creates a different tilt that doesn't match this flow.

## Solution

Adjust the CSS transform values to create the correct diagonal stripe effect:

### File: `src/components/landing/Hero.tsx`

**Current transform:**
```css
transform: 'rotateX(8deg) rotateY(-12deg) rotateZ(-8deg)'
```

**Updated transform:**
```css
transform: 'rotateX(12deg) rotateY(-8deg) rotateZ(2deg)'
```

Key changes:
- Increase `rotateX` to `12deg` - tilts the plane more forward (top recedes back)
- Reduce `rotateY` to `-8deg` - less side tilt
- Change `rotateZ` to `2deg` (positive) - rotates the grid slightly clockwise to align columns with the diagonal flow you indicated

This combination will make the two vertical columns appear to flow along the diagonal direction from top-right to bottom-left, matching your reference lines.

## Files to Modify

1. **`src/components/landing/Hero.tsx`** - Update the transform values on line 111

