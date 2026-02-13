

# Plan: Add Animated Network Mesh Background to Hero

## What's Changing

Add an animated geometric network/mesh background effect (inspired by the IIT Patna Incubation Centre website) behind the hero section. This is a background-only enhancement -- all existing content, layout, typography, buttons, spacing, and colors remain untouched.

## The Effect

The reference shows an animated network of interconnected dots (nodes) connected by thin lines, creating a molecular/constellation-like mesh pattern. The nodes slowly drift and the connections form/break as nodes move in and out of range. The effect is subtle -- light blue/primary-colored lines and dots on a white background.

## Technical Approach

### 1. Create a new component: `src/components/landing/NetworkBackground.tsx`

A canvas-based animated background component using the HTML5 Canvas API:
- Renders ~80 randomly placed nodes (small circles) that drift slowly in random directions
- Draws lines between nodes that are within a distance threshold (~150px)
- Line opacity fades as distance increases (closer = more opaque)
- Uses `requestAnimationFrame` for smooth 60fps animation
- Colors: primary blue (`hsl(246, 100%, 61%)`) at low opacity for lines (~0.15), slightly higher for dots (~0.4)
- Nodes bounce off canvas edges
- Canvas is responsive -- resizes with window
- Component uses `useEffect` + `useRef` for the canvas lifecycle
- Cleans up animation frame and resize listener on unmount

### 2. Modify `src/components/landing/Hero.tsx`

- Import `NetworkBackground`
- Add it as an absolutely positioned layer behind the hero content (inside the existing `<section>` with `relative overflow-hidden`)
- No changes to any existing elements, classes, or styles
- The background sits at `z-0`, content remains above via natural stacking or `z-10`

## Files to Create/Modify

1. **Create** `src/components/landing/NetworkBackground.tsx` -- Canvas animation component
2. **Modify** `src/components/landing/Hero.tsx` -- Add the background component as a positioned layer (2 lines: import + JSX element)

