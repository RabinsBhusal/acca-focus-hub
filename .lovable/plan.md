
# Calendar Hub — MVP Plan

A central `/calendar` page becomes the planning hub. Study sessions auto-log as calendar events. Exams live in a new table and replace the existing localStorage `/countdowns` page. AI planner, deadline risk, and daily reflection are deferred to follow-ups.

## Scope (this pass)

In:
- Calendar page with Month / Week / Day views
- Event CRUD (create by clicking a date, edit, delete, toggle completion)
- Categories: study, task, assignment, exam, personal, reminder (color-coded)
- Exam countdown page (days remaining, progress bar per topic, milestones)
- Study session → auto-created calendar event on submit
- GitHub-style productivity heatmap (last ~26 weeks)
- Remove `/countdowns` route and localStorage code; nav points to new pages

Deferred (follow-up passes):
- AI study planner
- Deadline risk (green/yellow/red) automation
- Daily reflection notes
- Recurring events, drag/reschedule, notifications

## Database (one migration)

Two new tables in `public`, permissive `anon` RLS to match the existing private-app posture (already recorded in security memory).

`calendar_events`
- `id uuid pk`
- `title text not null`
- `category text not null` — one of study/task/assignment/exam/personal/reminder
- `start_at timestamptz not null`
- `duration_minutes int` (nullable for all-day/reminders)
- `all_day bool default false`
- `priority int` (1–3, nullable)
- `notes text`
- `completed bool default false`
- `session_id uuid` — nullable FK to `study_sessions.id` (auto-log link)
- `exam_id uuid` — nullable FK to `exams.id`
- `created_at`, `updated_at` with trigger

`exams`
- `id uuid pk`
- `title text not null` (e.g. "ACCA ATX")
- `exam_date date not null`
- `topics jsonb not null default '[]'` — `[{ name, progress: 0-100 }]`
- `notes text`
- `created_at`, `updated_at`

Both tables: GRANT to `anon`, `authenticated`, `service_role`; enable RLS with `USING (true) / WITH CHECK (true)` policies (consistent with current app). Add `updated_at` trigger.

## Files

New:
```
src/lib/calendar.functions.ts     // list/create/update/delete events
src/lib/exams.functions.ts        // list/create/update/delete exams
src/lib/calendar.ts               // pure helpers: month grid, week range, heatmap buckets, category color tokens
src/lib/queries.ts (extend)       // add calendarEventsQueryOptions, examsQueryOptions
src/components/calendar/CalendarHeader.tsx     // view switcher + prev/next/today
src/components/calendar/MonthView.tsx
src/components/calendar/WeekView.tsx
src/components/calendar/DayView.tsx
src/components/calendar/EventDot.tsx           // color-coded pill/dot
src/components/calendar/EventDialog.tsx        // create/edit form (shadcn Dialog)
src/components/calendar/Heatmap.tsx            // GitHub-style grid from study_sessions
src/components/exam/ExamCard.tsx               // countdown + topic progress bars
src/components/exam/ExamForm.tsx
src/routes/calendar.tsx                        // main hub with view switcher
src/routes/exams.tsx                           // exam countdowns list + create
```

Changed:
- `src/routes/session.tsx` — after `createSession` succeeds, also insert a `calendar_events` row (category=study, linked via `session_id`).
- `src/components/AppNav.tsx` — replace `Countdowns` with `Calendar` and `Exams`.
- `src/routes/__root.tsx` — head title/description updates.

Deleted:
- `src/routes/countdowns.tsx`
- `src/lib/countdowns.ts`
- `src/components/countdown/*`

## Views

- **Month**: 6-row grid, each cell shows date + up to 3 event chips (color by category), "+N more" collapses; click a day → EventDialog with prefilled date.
- **Week**: 7 columns, hourly rows (6am–10pm default), events positioned by start + duration.
- **Day**: single-column agenda with time gutter.
- **Heatmap**: on Calendar page bottom, 7×26 cells fed from `study_sessions.date` totals; tooltip shows minutes and session count.

Header shows current period label, prev/next/today buttons, and a segmented view switcher. Category filter chips filter chips shown in views.

## Event dialog

Fields: title, category (select w/ color swatch), date (shadcn Datepicker), time + duration OR all-day toggle, priority (Low/Med/High), notes, completed checkbox. Uses TanStack Query mutation with cache invalidation of `["calendar-events"]`.

## Exam countdown

`/exams` lists exam cards:
- Big "43 days remaining" number
- Overall progress = average of topic progresses; progress bar
- Per-topic list with editable 0–100 progress (inline slider); saves via mutation
- Link "Add to calendar" pre-fills EventDialog with category=exam and the exam date

## Design

- Reuse existing OKLCH tokens; add semantic tokens `--cat-study`, `--cat-exam`, `--cat-task`, `--cat-personal`, `--cat-assignment`, `--cat-reminder` in `src/styles.css`.
- Category colors: study=blue, exam=red, task=green, personal=purple, assignment=amber, reminder=slate.
- Motion: `animate-fade-in` on view mount and dialog; hover-scale on chips.
- Mobile: month view stays; week/day collapse to agenda list under `sm`.

## Technical notes

- All DB access via `createServerFn` in `.functions.ts`, using the existing server publishable client pattern from `sessions.functions.ts`.
- Loaders use `ensureQueryData`; components use `useSuspenseQuery`.
- Head metadata on `/calendar` and `/exams` (unique title/description/og).
- Timezone: store `timestamptz` UTC, render in browser local time using `date-fns`.
- New dependency: `date-fns` (small, tree-shakeable). Existing recharts already handles any charts; no new chart lib.

## Security posture

Same permissive-anon model as `study_sessions`, already documented in security memory. No new auth. Called out that anyone with the URL can read/write.

## Out of scope (call out to user)

AI planner UI stub, deadline risk indicator, daily reflection, recurring events, drag-to-reschedule, push/email reminders — I'll add these in a follow-up once the MVP feels right.
