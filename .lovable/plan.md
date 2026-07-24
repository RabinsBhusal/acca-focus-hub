
# Achievements, Timers, and Google Calendar Sync

Three additions built on the existing calendar/session infrastructure. No auth is added — the app stays single-user with permissive RLS, but Google sync needs a real signed-in user identity to hold the per-user connection key. See "Auth caveat" below.

## 1. Timers hub + dashboard Pomodoro

New page `/timers` with three tabs:
- **Pomodoro** — 25/5 default, configurable work/break lengths, cycle counter, auto-cycles, ding on transition.
- **Countdown** — pick minutes (or preset chips 15/25/50/90), counts down, logs a `study_session` on finish and asks for subject/topic/rating like today's flow.
- **Stopwatch** — the existing count-up flow, reused as a component.

Dashboard (`/`) gets a compact **Pomodoro widget** card (start / pause / skip, cycle indicator) that shares state with `/timers` via a small Zustand store so it keeps running across route changes.

Shared logic:
- `src/lib/timers/pomodoroStore.ts` — Zustand store: phase (`work`/`shortBreak`/`longBreak`), remainingMs, running, cycles, settings; tick via `requestAnimationFrame` with a persisted `startedAt` so tab-switch drift is fixed.
- `src/lib/timers/countdownStore.ts` — same shape for the countdown timer.
- `src/components/timers/PomodoroCard.tsx`, `CountdownCard.tsx`, `StopwatchCard.tsx` — presentational, driven by stores.
- Existing `/session` stopwatch logic gets extracted into `StopwatchCard` and reused; `/session` route keeps its subject/topic/feedback wrapper.

## 2. Achievements (badges + progress goals)

New tables (one migration):

```
achievements          -- static-ish catalog (seeded in migration)
  id, code text unique, title, description, icon (lucide name),
  category ('streak'|'volume'|'consistency'|'exam'|'timer'),
  threshold int, unit ('sessions'|'minutes'|'days'|'pomodoros')

user_achievements     -- unlock log (single-user, no user_id column needed here)
  id, achievement_code text, unlocked_at timestamptz

goals                 -- user-defined progress goals
  id, title, metric ('minutes'|'sessions'|'pomodoros'),
  target int, period ('week'|'month'|'custom'),
  starts_on date, ends_on date, created_at, updated_at
```

All permissive-anon RLS to match the existing posture, with GRANTs.

New page `/achievements`:
- **Badges grid** — locked badges shown greyed with progress bar toward threshold (e.g. "42 / 50 sessions"), unlocked badges shown in accent color with unlock date.
- **Goals** — cards with title, progress bar, remaining time; add/edit/delete via dialog.

Seeded achievements: 3-day / 7-day / 30-day / 100-day streak, 10/50/100/500 sessions, 10/50/200 hours, first exam, 5/25/100 pomodoros completed.

Evaluation:
- Pure function `evaluateAchievements(sessions, pomodoroCount, exams)` returns which codes should be unlocked.
- Called after session save, exam save, and pomodoro-cycle completion. Any newly unlocked codes get inserted into `user_achievements` and a toast + confetti (canvas-confetti, already tiny) fires.
- Same function runs on `/achievements` mount to backfill anything missed.

Nav: add "Achievements" link between Exams and History.

## 3. Google Calendar two-way sync

Uses the **Google Calendar App User Connector** (per-user OAuth via `connectAppUser`).

### Auth caveat (must resolve first)

Per-user OAuth requires an authenticated app user to key the connection against. This app was built without auth. Two options — I need you to pick before I build sync:

**Option A — Add minimal Supabase email auth just so sync can key against a user.** Everything else stays open. Roughly one route (`/auth`) + `_authenticated` wrapper around the sync UI only.

**Option B — Single-tenant hack: store the one Google connection key in an env-configured "owner" slot.** Faster, no auth, but violates the platform's per-user-identity storage rule. I'd only do this if you accept it's a personal single-user app and are OK with the caveat.

Everything below assumes Option A. If you pick B, the flow is the same minus the auth wrapping.

### Wiring

- `connector_app_user--connect_client` for `google_calendar` (you'll approve a workspace client + add the gateway redirect URI in Google Cloud Console).
- New files:
  - `src/integrations/lovable/appUserConnector.ts` + `appUserConnectorClient.ts` (server + browser halves from the connector knowledge).
  - `src/server/connectionKeyCrypto.ts`, `src/server/appUserConnections.server.ts` — encrypted per-user key storage.
  - Migration: `app_user_connections` table (service-role only).
  - `src/lib/gcal.functions.ts` — server fns: `startGcalConnect`, `saveGcalConnection`, `disconnectGcal`, `listGcalCalendars`, `pushEventToGcal`, `pullGcalEvents`, `syncGcal`.
- `calendar_events` gets three new columns: `google_event_id text`, `google_calendar_id text`, `synced_at timestamptz`.

### Sync behavior

- **Push (app → Google):** on `upsertEvent`, if user has connected Google + enabled sync, mirror to Google via `POST /calendars/{cal}/events` (or PATCH if `google_event_id` exists). Delete mirrors the delete.
- **Pull (Google → app):** manual "Sync now" button on `/calendar` and on-mount incremental pull using Google's `syncToken` (stored in a new `gcal_sync_state` table). Imported events are stored with `category='personal'` by default and flagged as `source='google'` so we don't push them back.
- **Conflict rule:** last-write-wins by `updated_at`; a small badge in the event dialog shows "Synced with Google" when applicable.
- **Settings panel** (`/calendar` header dropdown): connect/disconnect Google, choose target calendar, toggle push and pull independently.

### Apple Calendar

Not covered by two-way OAuth. If you want Apple, easiest add-on is exposing a public read-only `.ics` feed at `/api/public/calendar.ics` that Apple/Google can subscribe to (one-way, no OAuth). Say the word and I'll add it — otherwise skipping.

## Files summary

New:
```
src/routes/timers.tsx
src/routes/achievements.tsx
src/components/timers/{PomodoroCard,CountdownCard,StopwatchCard,TimerTabs}.tsx
src/components/dashboard/PomodoroWidget.tsx
src/components/achievements/{BadgeGrid,BadgeCard,GoalCard,GoalDialog}.tsx
src/lib/timers/{pomodoroStore,countdownStore,timerAudio}.ts
src/lib/achievements.ts          # pure evaluate + catalog types
src/lib/achievements.functions.ts
src/lib/goals.functions.ts
src/lib/gcal.functions.ts
src/lib/gcal.ts                  # mapping between calendar_events and Google events
src/integrations/lovable/appUserConnector.ts
src/integrations/lovable/appUserConnectorClient.ts
src/server/connectionKeyCrypto.ts
src/server/appUserConnections.server.ts
```

Changed:
```
src/components/AppNav.tsx        # add Timers, Achievements
src/routes/index.tsx             # add PomodoroWidget + unlocked-badge strip
src/routes/session.tsx           # extract stopwatch, run evaluateAchievements post-save, push to gcal
src/routes/calendar.tsx          # Google sync button + settings
src/lib/queries.ts               # achievement/goal/gcal query options
src/styles.css                   # add badge accent tokens
```

Dependencies to add: `zustand`, `canvas-confetti` (+ types).

## Order of build

1. Migration (achievements catalog + seed, user_achievements, goals, app_user_connections, gcal columns/state).
2. Timers hub + dashboard Pomodoro widget (no backend dependency).
3. Achievements page + evaluate hook into session/pomodoro/exam paths.
4. Google Calendar sync (after you answer the auth caveat).

## Out of scope (call out)

Apple Calendar OAuth (not supported), recurring events in Google sync (only single events for v1), shared badges/leaderboards, per-goal reminders. Ping me if you want any of these next.
