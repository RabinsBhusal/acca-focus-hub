export type SessionRow = {
  id: string;
  subject: string;
  topic: string | null;
  duration_minutes: number;
  date: string;
  difficulty: number | null;
  notes: string | null;
  learning_summary: string | null;
  created_at: string;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function minutesToday(sessions: SessionRow[]): number {
  const today = new Date();
  return sessions
    .filter((s) => isSameDay(new Date(s.date), today))
    .reduce((sum, s) => sum + s.duration_minutes, 0);
}

export function minutesThisWeek(sessions: SessionRow[]): number {
  const now = new Date();
  const dow = now.getDay(); // Sun = 0
  const monOffset = (dow + 6) % 7; // days since Monday
  const weekStart = startOfDay(new Date(now.getTime() - monOffset * 86400000));
  return sessions
    .filter((s) => new Date(s.date) >= weekStart)
    .reduce((sum, s) => sum + s.duration_minutes, 0);
}

export function minutesThisMonth(sessions: SessionRow[]): number {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return sessions
    .filter((s) => new Date(s.date) >= monthStart)
    .reduce((sum, s) => sum + s.duration_minutes, 0);
}

export function currentStreak(sessions: SessionRow[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(
    sessions.map((s) => startOfDay(new Date(s.date)).toISOString()),
  );
  let streak = 0;
  const cursor = startOfDay(new Date());
  // If nothing today, streak may still count from yesterday
  if (!days.has(cursor.toISOString())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(cursor.toISOString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function totalMinutes(sessions: SessionRow[]): number {
  return sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
}

export function formatHours(mins: number): string {
  const h = mins / 60;
  if (h < 1) return `${mins}m`;
  return `${h.toFixed(h < 10 ? 1 : 0)}h`;
}

export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function dailyMinutesLastNDays(sessions: SessionRow[], n: number) {
  const out: { label: string; date: string; minutes: number }[] = [];
  const today = startOfDay(new Date());
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const mins = sessions
      .filter((s) => isSameDay(new Date(s.date), d))
      .reduce((sum, s) => sum + s.duration_minutes, 0);
    out.push({
      label: d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" }),
      date: d.toISOString(),
      minutes: mins,
    });
  }
  return out;
}

export function weeklyMinutesLastNWeeks(sessions: SessionRow[], n: number) {
  const out: { label: string; minutes: number }[] = [];
  const now = new Date();
  const dow = now.getDay();
  const monOffset = (dow + 6) % 7;
  const thisWeekStart = startOfDay(new Date(now.getTime() - monOffset * 86400000));
  for (let i = n - 1; i >= 0; i--) {
    const start = new Date(thisWeekStart);
    start.setDate(start.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const mins = sessions
      .filter((s) => {
        const d = new Date(s.date);
        return d >= start && d < end;
      })
      .reduce((sum, s) => sum + s.duration_minutes, 0);
    out.push({
      label: start.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      minutes: mins,
    });
  }
  return out;
}
