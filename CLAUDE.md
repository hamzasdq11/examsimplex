# CLAUDE.md - AI Assistant Guide for EXAM Simplex

This file provides comprehensive guidance for AI assistants working with the EXAM Simplex codebase.

## Project Overview

**EXAM Simplex** is an AI-powered exam preparation platform for university students in India. Currently supports AKTU (Abdul Kalam Technical University) with an extensible architecture for additional universities.

**Core Value Proposition**: Free, accessible exam preparation with structured learning paths, AI tutoring, and comprehensive study resources (notes, PYQs, MCQs).

## Quick Reference

### Essential Commands

```bash
# Development
npm run dev          # Start Vite dev server on http://localhost:8080
npm run build        # Production build to /dist
npm run build:dev    # Development build with source maps
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Key Directories

```
src/
├── components/      # React components (organized by feature)
│   ├── landing/     # Landing page sections (Header, Hero, Features, etc.)
│   ├── ui/          # shadcn/ui components (buttons, cards, dialogs)
│   ├── ai/          # AI-specific (MathRenderer, CodeBlock, CitationDrawer)
│   ├── admin/       # Admin dashboard components
│   └── dashboard/   # User dashboard components
├── pages/           # Page components (route handlers)
├── hooks/           # Custom React hooks (14 hooks)
├── contexts/        # React Context providers (Auth, Admin)
├── types/           # TypeScript type definitions
├── integrations/    # Third-party integrations
│   └── supabase/    # Supabase client and auto-generated types
├── lib/             # Utility functions
├── App.tsx          # Main router and provider setup
└── main.tsx         # Entry point

supabase/
├── functions/       # Deno edge functions (11 serverless functions)
└── migrations/      # PostgreSQL schema migrations (14 files)
```

## Technology Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | React 18.3 | Functional components with hooks |
| Language | TypeScript 5.8 | Path alias: `@/` -> `./src/` |
| Build | Vite 5.4 | Dev server on port 8080 |
| Styling | Tailwind CSS 3.4 | Class-based dark mode |
| UI Components | shadcn/ui (Radix) | Located in `src/components/ui/` |
| State | React Context + TanStack Query | Auth, Admin contexts |
| Forms | React Hook Form + Zod | Validation patterns |
| Backend | Supabase | PostgreSQL + Edge Functions |
| AI Models | Gemini 2.5/3, GPT-5 | Via Lovable AI Gateway |

## Code Conventions

### Component Patterns

**File Naming**: PascalCase for components (e.g., `SubjectAIChat.tsx`)

**Component Structure**:
```tsx
// Imports (external, then internal with @/ alias)
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

// Interface definitions
interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
}

// Functional component with explicit props typing
export function ComponentName({ title, onSubmit }: ComponentProps) {
  // Hooks first
  const { user } = useAuth();
  const [state, setState] = useState<StateType>();

  // Handlers
  const handleClick = () => { /* ... */ };

  // Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

### Custom Hook Pattern

```tsx
// hooks/useFeature.tsx
export function useFeature() {
  const { user } = useAuth();
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from("table").select("*");
      if (error) throw error;
      setData(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}
```

### Styling Conventions

- **Tailwind Classes**: Use utility-first approach
- **Custom Colors**: Use CSS variables (see `tailwind.config.ts`)
  - `bg-primary`, `text-primary-foreground`
  - `bg-card`, `bg-muted`, `bg-destructive`
  - Card variants: `bg-card-cyan`, `bg-card-lavender`, etc.
- **Dark Mode**: Use `dark:` prefix for dark mode variants
- **Animations**: Custom animations in Tailwind config
  - `animate-fade-in-up`, `animate-float`, `animate-pulse-soft`

### Import Aliases

Always use the `@/` alias for src imports:
```tsx
// Correct
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

// Avoid
import { Button } from "../../components/ui/button";
```

## Architecture

### Data Hierarchy

```
Universities
└── Courses (B.Tech CSE, ECE, etc.)
    └── Semesters (1-8)
        └── Subjects (DBMS, OS, etc.)
            └── Units (1-5)
                ├── Notes (chapter-wise points)
                ├── PYQ Papers (yearly)
                ├── Important Questions
                └── MCQ Questions
```

### Authentication Flow

1. User enters email on `/auth` page
2. OTP sent via `send-email-otp` edge function
3. OTP verified via `verify-email-otp` function
4. Session stored in localStorage via Supabase client
5. `AuthContext` provides `user`, `signIn`, `signOut`, `signUp`

### AI System Architecture

**Intent-Based Routing**:
```
User Query → Intent Classifier (Flash Lite)
                    ↓
    ┌───────────────┼───────────────┐
    ↓               ↓               ↓
FACTUAL         MATH/CODE        MIXED
    ↓               ↓               ↓
Flash 3       Gemini Pro 2.5    Gemini Pro
```

**Intent Types**: `FACTUAL`, `CONCEPTUAL`, `MATH`, `CODE`, `GRAPH`, `MIXED`

**Edge Functions**:
| Function | Purpose |
|----------|---------|
| `ai-orchestrator` | Main routing and response generation |
| `ai-intent-classifier` | Classify query intent |
| `ai-internal-retrieval` | Search internal knowledge base |
| `ai-web-search` | Perplexity API integration |

**Response Parsing** (`src/lib/responseParser.ts`):
- Parses markdown into segments: text, math, code, citations, graphs
- LaTeX: `$$...$$` (block) and `$...$` (inline)
- Code: Triple backticks with language identifier
- Citations: `[1]`, `[2]` format

### Provider Hierarchy (App.tsx)

```tsx
<HelmetProvider>           // SEO meta tags
  <ThemeProvider>          // Dark/light mode
    <QueryClientProvider>  // TanStack Query
      <AuthProvider>       // User authentication
        <TooltipProvider>  // UI tooltips
          <RouterProvider> // React Router
```

## Database Schema (Supabase/PostgreSQL)

### Core Content Tables

| Table | Key Fields | Purpose |
|-------|------------|---------|
| `universities` | id, name, slug, logo_url | Institution info |
| `courses` | id, university_id, name, code | Degree programs |
| `semesters` | id, course_id, number | Academic semesters |
| `subjects` | id, semester_id, name, code | Course subjects |
| `units` | id, subject_id, number, title | Subject chapters |
| `notes` | id, unit_id, content, order | Study notes |
| `pyq_papers` | id, subject_id, year, file_url | Past papers |
| `important_questions` | id, subject_id, question, marks | Key questions |
| `mcq_questions` | id, subject_id, question, options[], correct_option | MCQs |

### User Tables

| Table | Key Fields | Purpose |
|-------|------------|---------|
| `profiles` | id, email, full_name, avatar_url | User profiles |
| `user_roles` | user_id, role | Role assignment |
| `user_library_items` | user_id, item_type, item_id | Saved materials |
| `studylists` | id, user_id, name, items[] | Custom collections |
| `user_mcq_attempts` | user_id, question_id, selected_option | MCQ history |

### Row Level Security (RLS)

- All tables have RLS enabled
- User-scoped data accessible only by owner
- Public content (universities, courses, notes) readable by all
- Admin operations require `admin` role check

## Key Files Reference

### Configuration

| File | Purpose |
|------|---------|
| `vite.config.ts` | Build config, dev server (port 8080), path aliases |
| `tailwind.config.ts` | Custom colors, animations, fonts |
| `tsconfig.json` | TypeScript config, path aliases (`@/*`) |
| `components.json` | shadcn/ui configuration |
| `.env` | Supabase credentials (VITE_SUPABASE_*) |

### Entry Points

| File | Purpose |
|------|---------|
| `src/main.tsx` | React app bootstrap |
| `src/App.tsx` | Router and provider setup |
| `index.html` | HTML template with SEO meta |

### Type Definitions

| File | Purpose |
|------|---------|
| `src/types/database.ts` | Domain types (University, Course, etc.) |
| `src/integrations/supabase/types.ts` | Auto-generated Supabase types |

### Important Hooks

| Hook | Location | Purpose |
|------|----------|---------|
| `useAuth` | `hooks/useAuth.tsx` | Authentication state |
| `useLibrary` | `hooks/useLibrary.tsx` | User library CRUD |
| `useProfile` | `hooks/useProfile.tsx` | User profile data |
| `useRole` | `hooks/useRole.tsx` | User permissions |
| `usePyodide` | `hooks/usePyodide.tsx` | Python code execution |
| `useAIChatState` | `hooks/useAIChatState.tsx` | AI chat messages |

## Common Tasks

### Adding a New Page

1. Create component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`:
   ```tsx
   <Route path="/new-page" element={<NewPage />} />
   ```
3. Use SEO component for meta tags:
   ```tsx
   import { SEO } from "@/components/SEO";

   export function NewPage() {
     return (
       <>
         <SEO title="New Page" description="..." />
         {/* Page content */}
       </>
     );
   }
   ```

### Adding a New Component

1. Create in appropriate directory under `src/components/`
2. Use TypeScript interfaces for props
3. Follow existing naming conventions (PascalCase)
4. Import shadcn/ui components from `@/components/ui/`

### Adding a shadcn/ui Component

Components are pre-installed. If adding new ones, use the shadcn CLI pattern documented in their configuration.

### Working with Supabase

**Client Access**:
```tsx
import { supabase } from "@/integrations/supabase/client";

// Query
const { data, error } = await supabase
  .from("subjects")
  .select("*, units(*)")
  .eq("id", subjectId)
  .single();

// Insert
const { data, error } = await supabase
  .from("user_library_items")
  .insert({ user_id, item_type, item_id });
```

**Type Safety**: Types are auto-generated in `src/integrations/supabase/types.ts`

### Adding an Edge Function

1. Create directory: `supabase/functions/function-name/`
2. Create `index.ts` with Deno handler:
   ```typescript
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

   const corsHeaders = {
     "Access-Control-Allow-Origin": "*",
     "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
   };

   serve(async (req) => {
     if (req.method === "OPTIONS") {
       return new Response(null, { headers: corsHeaders });
     }

     // Handler logic
     return new Response(JSON.stringify({ result }), {
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   });
   ```
3. Update `supabase/config.toml` if needed

## Testing and Debugging

### Development Server

```bash
npm run dev  # Starts on http://localhost:8080
```

### Linting

```bash
npm run lint
```

### Supabase Local Development

Edge functions can be tested locally using Supabase CLI (if installed).

### Console Debugging

- Check browser console for React errors
- Network tab for API call debugging
- Supabase dashboard for database queries

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_PROJECT_ID=<project-id>
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
VITE_SUPABASE_URL=https://<project-id>.supabase.co
```

Note: `VITE_` prefix required for client-side access in Vite.

## Gotchas and Important Notes

1. **Port**: Dev server runs on **8080**, not the default 5173
2. **Path Aliases**: Always use `@/` for src imports
3. **Type Generation**: Supabase types in `types.ts` are auto-generated - don't edit manually
4. **RLS Policies**: All database operations must consider row-level security
5. **Auth Required**: Many features require authenticated user - check `useAuth()` state
6. **AI API Keys**: Never expose AI service keys client-side - use edge functions
7. **Dark Mode**: Use `dark:` Tailwind prefix for theme-aware styling
8. **Form Validation**: Use Zod schemas with React Hook Form

## AI Response Types

When working with AI responses, handle these types:

```typescript
type AIResponseType =
  | { type: "math"; python: string; explanation: string; latex?: string; steps?: string[] }
  | { type: "graph"; python: string; description: string }
  | { type: "code"; language: string; source: string; explanation: string; executable: boolean }
  | { type: "answer"; text: string; citations: Citation[] };
```

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `SubjectAIChat.tsx` |
| Hooks | camelCase with `use` prefix | `useLibrary.tsx` |
| Utils | camelCase | `responseParser.ts` |
| Types | PascalCase | `database.ts` |
| Pages | PascalCase | `SubjectPage.tsx` |
| Contexts | PascalCase with `Context` suffix | `AuthContext.tsx` |

## Performance Considerations

1. **Code Splitting**: Vite handles automatic code splitting
2. **Lazy Loading**: Consider `React.lazy()` for large page components
3. **Query Caching**: TanStack Query provides automatic caching
4. **Image Optimization**: Use appropriate image formats and sizes
5. **Pyodide Loading**: Python runtime is heavy - loaded on demand

## Security Checklist

- [ ] Never expose API keys client-side
- [ ] Use Supabase RLS for data access control
- [ ] Validate user input with Zod
- [ ] Sanitize HTML with DOMPurify (already implemented)
- [ ] Check user authentication before protected operations
- [ ] Use HTTPS for all external requests
