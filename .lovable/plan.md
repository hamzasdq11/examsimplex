

## Optimize Subject Page Panel Sizes

Adjust the resizable panel split on the Subject Page to better match the reference layout, where the AI chat panel is slightly wider than the current 23%.

### Changes

**File: `src/pages/SubjectPage.tsx`**

- **Line 371**: Change main content panel `defaultSize` from `78` to `72`
- **Line 682**: Change AI chat panel `defaultSize` from `23` to `28`
- **Line 683**: Keep `minSize` at `15` (unchanged)
- **Line 684**: Keep `maxSize` at `45` (unchanged)

This gives the AI panel more breathing room (28% vs 23%) so the chat input and messages aren't as cramped, matching the proportions in the reference screenshot.
