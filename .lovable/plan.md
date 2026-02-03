

# Plan: Implement Smooth Scrolling Hero Image Showcase

## Overview

Replace the current circular hero image with a Brix Templates-style continuously scrolling showcase of stacked UI preview cards, creating a premium ambient motion effect.

## Design Analysis

Based on the reference screenshots, the key characteristics are:
- **Multiple stacked UI mockups** arranged with slight rotation and scale variation
- **Slow, linear horizontal scroll** (ambient, not attention-grabbing)
- **Seamless infinite loop** with no visible reset point
- **Layered depth illusion** through card positioning
- **Hero text remains fixed** on the left

## Implementation

### File 1: `src/index.css`

Add a new keyframe for the infinite horizontal scroll:

```css
@keyframes scroll-showcase {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-scroll-showcase {
  animation: scroll-showcase 40s linear infinite;
}
```

The 40-second duration creates the slow, ambient feel. The `-50%` translation works because we'll duplicate the content to create seamless looping.

---

### File 2: `src/components/landing/Hero.tsx`

Replace the right content section with the scrolling showcase:

**Structure:**
```
[Left Content - unchanged]     [Right Content - New Scrolling Showcase]
                               ┌─────────────────────────────────────┐
  Headline                     │  ┌────────┐                         │
  Subtext                      │  │ Card 1 │  ┌────────┐            │
  CTA Button                   │  │(rotated)│  │ Card 2 │           │
                               │  └────────┘  │(larger) │ ...       │
                               │              └────────┘            │
                               └─────────────────────────────────────┘
                                        ← Scrolling direction
```

**Mockup Cards Data:**
Use relevant education/study-themed preview images:

```tsx
const showcaseCards = [
  { 
    src: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=300&fit=crop",
    alt: "Notes preview",
    rotate: "-3deg",
    scale: 1,
    zIndex: 3
  },
  { 
    src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop",
    alt: "Study dashboard",
    rotate: "2deg", 
    scale: 1.05,
    zIndex: 4
  },
  // ... more cards
];
```

**Implementation:**
- Outer container with `overflow-hidden` to clip the scroll
- Inner flex container with duplicated cards for seamless loop
- Each card styled with `rounded-xl shadow-lg` and positioned transforms
- Animation applied to the inner container

---

### Key CSS Properties

| Property | Value | Purpose |
|----------|-------|---------|
| `animation-timing-function` | `linear` | No acceleration, constant speed |
| `animation-duration` | `40s` | Very slow, ambient motion |
| `transform` | `translateX()` | GPU-accelerated, smooth 60fps |
| `will-change` | `transform` | Optimize for animation |

---

## Visual Hierarchy

The implementation preserves visual hierarchy:
1. **Primary focus**: Headline and CTA button (static, left side)
2. **Secondary/ambient**: Scrolling showcase (motion draws peripheral attention without distraction)

---

## Mobile Considerations

- On smaller screens (< lg breakpoint), the showcase will be hidden or shown at reduced scale
- The stacked arrangement works vertically on mobile with the scroll going upward instead

---

## Files to Modify

1. **`src/index.css`** - Add `scroll-showcase` keyframe and utility class
2. **`src/components/landing/Hero.tsx`** - Replace right content with scrolling showcase

---

## Preview Images

Using high-quality Unsplash images that represent:
- Study notes and notebooks
- Dashboard interfaces
- Students learning
- Educational content

This creates a thematic connection to the EXAM Simplex product while maintaining the premium visual effect.

