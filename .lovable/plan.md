

## Make Subject Page Fullscreen

Remove the `Header` component and expand the content to fill the full viewport, eliminating the top navigation bar on the Subject page.

### Changes

**File: `src/pages/SubjectPage.tsx`**

1. Remove the `Header` import (line 4)
2. Remove `<Header />` from the main render (line 349)
3. Remove `<Header />` from the loading state (~line 264) and the error state (~line 278) if present
4. Optionally adjust the outer container from `min-h-screen` to use full height without the header offset

This will make the subject page use the full browser window without the landing-page navigation bar at the top.
