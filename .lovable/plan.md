

# Plan: Envelope Reveal Hero Effect

## Overview

Replace the entire two-column scrolling card showcase with a single interactive element: the uploaded meme image inside an envelope that slides up as the user hovers over it.

## Visual Concept

```text
  Before hover:          During hover:
  ┌──────────────┐      ┌──────────────┐
  │              │      │  ┌────────┐  │
  │   envelope   │      │  │ image  │  │  <-- slides up
  │   ________   │      │  │ peeking│  │
  │  /        \  │      │  └────────┘  │
  │ /  flap    \ │      │   ________   │
  │/____________\│      │  /        \  │
  │ [envelope   ]│      │ /  flap    \ │
  │ [body      ]│      │/____________\│
  └──────────────┘      └──────────────┘
```

The image starts hidden inside the envelope. On mouse hover/move, it slides upward out of the envelope, revealing the "let's get this degree" meme.

## Implementation

### Step 1: Copy the image to the project

Copy `user-uploads://im_so_done.jpg` to `src/assets/hero-meme.jpg`

### Step 2: Modify `src/components/landing/Hero.tsx`

- Remove all card arrays (`leftColumnCards`, `rightColumnCards`)
- Remove the two-column scrolling grid and all related 3D transform code
- Replace with an envelope component:
  - An SVG/CSS envelope shape (bottom half + triangular flap)
  - The meme image positioned behind/inside the envelope
  - `onMouseMove` / `onMouseEnter` / `onMouseLeave` handlers to track cursor position
  - The image translates upward (negative Y) based on cursor proximity, using CSS `transition` for smooth motion
  - On mobile, use a simple tap-to-reveal or show the image partially peeking out

### Step 3: Clean up `src/index.css`

- Remove the `scroll-up` and `scroll-down` keyframe animations
- Remove `.animate-scroll-up` and `.animate-scroll-down` classes (no longer needed)

## Technical Details

**Envelope construction (CSS):**
- Container div with `overflow: hidden` on the lower portion
- Envelope body: a rounded rectangle with a subtle paper/cream color and shadow
- Envelope flap: a CSS triangle (using `clip-path` or borders) layered on top with a higher z-index so the image slides behind it
- The image sits inside and translates from `translateY(80%)` (hidden) to `translateY(-20%)` (revealed)

**Hover interaction:**
```tsx
const [revealed, setRevealed] = useState(false);

// Image style
style={{
  transform: revealed ? 'translateY(-40%)' : 'translateY(20%)',
  transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
}}
```

**Mobile fallback:**
- On mobile (`sm:` breakpoint), show the image partially peeking out of the envelope by default, with a tap to fully reveal

## Files to Modify

1. **Copy** `user-uploads://im_so_done.jpg` to `src/assets/hero-meme.jpg`
2. **`src/components/landing/Hero.tsx`** -- Replace scrolling cards with envelope + image reveal
3. **`src/index.css`** -- Remove unused scroll animation keyframes

