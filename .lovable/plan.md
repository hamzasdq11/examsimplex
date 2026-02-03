

# Plan: Brix Templates-Style Two-Column Vertical Scroll Hero

## Current vs Target

| Current | Target (Brix Style) |
|---------|---------------------|
| Single horizontal row | Two-column grid |
| Horizontal scroll (left) | Vertical scroll (one up, one down) |
| Mild 3D perspective | Strong isometric tilt |
| Cards in a line | Cards stacked vertically |

## Visual Reference Analysis

The Brix Templates effect has these key characteristics:
- **Two columns** of cards side by side
- **Opposing scroll directions** - left column scrolls up, right column scrolls down
- **Strong perspective tilt** - approximately `rotateX(10deg) rotateY(-15deg)`
- **Cards extend beyond viewport** - creates infinite scroll illusion
- **Uniform card sizing** - consistent dimensions for all cards

## Implementation

### File 1: `src/index.css`

Replace the horizontal scroll animation with two vertical scroll animations:

```css
@keyframes scroll-up {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}

@keyframes scroll-down {
  0% { transform: translateY(-50%); }
  100% { transform: translateY(0); }
}

.animate-scroll-up {
  animation: scroll-up 30s linear infinite;
}

.animate-scroll-down {
  animation: scroll-down 30s linear infinite;
}
```

### File 2: `src/components/landing/Hero.tsx`

Restructure the showcase into a two-column layout:

**New Structure:**
```
┌─────────────────────────────────────────────┐
│ Container (perspective: 1000px)             │
│ ┌─────────────────────────────────────────┐ │
│ │ Grid (rotateX + rotateY)                │ │
│ │ ┌─────────────┐  ┌─────────────┐        │ │
│ │ │  Column 1   │  │  Column 2   │        │ │
│ │ │  ↑ scroll   │  │  ↓ scroll   │        │ │
│ │ │  [Card]     │  │  [Card]     │        │ │
│ │ │  [Card]     │  │  [Card]     │        │ │
│ │ │  [Card]     │  │  [Card]     │        │ │
│ │ │  ...        │  │  ...        │        │ │
│ │ └─────────────┘  └─────────────┘        │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Key Changes:**

1. **Two card arrays** - one for left column, one for right column
2. **Grid layout** with `grid-cols-2` and gap
3. **Stronger perspective transform**:
   ```tsx
   transform: 'rotateX(10deg) rotateY(-15deg)'
   ```
4. **Vertical gradient overlays** (top/bottom instead of left/right)
5. **Taller container** to show more cards
6. **Each column has duplicated cards** for seamless vertical loop

**Card Configuration:**
```tsx
const leftColumnCards = [
  { src: "...", alt: "Notes preview" },
  { src: "...", alt: "Dashboard" },
  { src: "...", alt: "Study material" },
  // ... 6+ cards
];

const rightColumnCards = [
  { src: "...", alt: "Practice tests" },
  { src: "...", alt: "Progress tracking" },
  { src: "...", alt: "AI assistant" },
  // ... 6+ cards
];
```

## CSS Properties

| Property | Value | Purpose |
|----------|-------|---------|
| `perspective` | `1000px` | Creates 3D depth for child elements |
| `rotateX` | `10deg` | Tilts grid forward (top recedes) |
| `rotateY` | `-15deg` | Tilts grid left (right side recedes) |
| `animation-duration` | `30s` | Slow ambient motion |
| `translateY(-50%)` | Vertical loop | Cards duplicate for seamless reset |

## Files to Modify

1. **`src/index.css`** - Add vertical scroll keyframes and utility classes
2. **`src/components/landing/Hero.tsx`** - Restructure to two-column vertical grid

## Mobile Behavior

- On screens < `sm`, continue showing the simple circular image fallback
- The two-column effect requires sufficient screen width to look good

