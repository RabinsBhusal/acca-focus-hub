# ACCA Study Tracker — Build Plan

A private, dark-mode study companion. React + Tailwind + Lovable Cloud (Supabase). No auth, no extras.

## Stack & setup
- TanStack Start (existing template), Tailwind v4, shadcn components already available.
- Enable Lovable Cloud for the database.
- Charts: `recharts` (lightweight, standard).
- Icons: `lucide-react` (already available).
- Dark mode: force `.dark` class on `<html>` in root — no toggle.

## Database (one table)
Migration creates `public.study_sessions`:
- `id uuid pk default gen_random_uuid()`
- `subject text not null`
- `topic text`
- `duration_minutes int not null`
- `date timestamptz not null default now()`
- `difficulty int check (1-5)`
- `notes text`
- `learning_summary text`
- `created_at timestamptz default now()`

Since there is no auth, RLS will be enabled with permissive policies (`USING (true)` for select/insert/update/delete to `anon` + `authenticated`) plus the standard GRANTs. This is acceptable because the app is private and unlisted. Note: anyone who knows the published URL could read/write — call this out to the user.

## Routes (TanStack file-based)
```
src/routes/
  __root.tsx          → dark shell, top nav (Dashboard / History / Stats), <Outlet/>
  index.tsx           → Dashboard
  session.tsx         → Timer + post-session feedback form
  history.tsx         → Sessions list with subject filter + date sort
  stats.tsx           → Totals + charts
```

## Components (`src/components/`)
- `AppNav.tsx` — top navigation
- `StatCard.tsx` — reusable metric card
- `SessionCard.tsx` — one recent session row/card
- `SubjectPicker.tsx` — ATX / AAA / SBL / Other (with custom text input when Other)
- `Timer.tsx` — count-up timer with pause/resume/end
- `StarRating.tsx` — 1–5 stars
- `SessionFeedbackForm.tsx` — difficulty + notes + learning summary
- `ui/*` — existing shadcn primitives (Button, Card, Input, Textarea, Select)

## Data layer (`src/lib/`)
- `sessions.functions.ts` — TanStack server functions using the server publishable client:
  - `listSessions()` — all sessions ordered by date desc
  - `createSession({subject, topic, duration_minutes, difficulty, notes, learning_summary})`
- `stats.ts` — pure helpers: today total, week total, month total, streak (consecutive days with ≥1 session up to today), by-day series (last 14 days), weekly series (last 8 weeks).
- Client uses TanStack Query: `queryOptions` in `src/lib/queries.ts`; loaders call `ensureQueryData`, components use `useSuspenseQuery`.

## Feature detail

**Dashboard (`/`)**
- Hero card with big "Start Study Session" → navigates to `/session`.
- Row of StatCards: Today, This Week, This Month, Streak.
- Recent activity: last 5 sessions (subject, topic, duration, relative date).

**Timer (`/session`)**
- Phase 1 (setup): Subject picker + topic input + "Start" button.
- Phase 2 (running): mm:ss (or hh:mm:ss) count-up, Pause/Resume, End Session. Timer state in component state + `requestAnimationFrame`/`setInterval`. Warn on tab close via `beforeunload` while running.
- Phase 3 (feedback): required star rating; optional notes and "What I learned". On submit → create session (duration rounded to minutes, min 1) → redirect to `/` with toast.

**History (`/history`)**
- Card list (responsive; table-like on desktop).
- Filter: subject dropdown (All / ATX / AAA / SBL / Other).
- Sort: date asc/desc toggle.

**Stats (`/stats`)**
- StatCards: total hours, total sessions, week, month, streak.
- Charts (recharts):
  - Bar chart: study minutes per day, last 14 days.
  - Line/area chart: weekly totals, last 8 weeks.

## Design
- Dark by default. Neutral zinc/slate background, single accent (soft indigo/violet). Semantic tokens only — no hardcoded colors in components.
- Cards with subtle border + soft shadow. Generous spacing. `Inter`-alternative — use a distinctive pairing (e.g. Space Grotesk display + Inter body loaded via `<link>` in `__root.tsx`).
- Motion: fade/slide-in on route mount and card lists via Tailwind `tw-animate-css` utilities (already installed). No heavy animation.

## Build stages (each ends with a short recap in chat)
1. Enable Cloud + migration + routes/nav/dashboard shell with mock data.
2. Timer flow + feedback form (still local state).
3. Wire Supabase reads/writes; dashboard + history live.
4. Stats page with charts + polish.

## Out of scope (explicit)
No auth, AI, social, payments, settings, profiles, export, editing/deleting past sessions (can add later).

## Technical notes
- Server fns use the server publishable client (no user; `TO anon` policies allow read/write).
- All colors via `src/styles.css` tokens; dark values are the defaults shown.
- Head metadata set in `__root.tsx` with real app title/description.

## What I'll explain after building
Folder structure, how the single table + server fns work, how to run locally, and where to edit to add a subject or a new stat.
