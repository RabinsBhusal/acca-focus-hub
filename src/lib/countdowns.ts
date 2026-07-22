export type DayStatus = "productive" | "average" | "missed" | null;

export type DayEntry = {
  status: DayStatus;
  notes?: string;
  hours?: number;
  topics?: string;
};

export type Milestone = {
  id: string;
  label: string;
  done: boolean;
};

export type Countdown = {
  id: string;
  title: string;
  startDate: string; // ISO date (YYYY-MM-DD)
  deadline: string; // ISO date (YYYY-MM-DD)
  studyHoursGoal?: number;
  topicsGoal?: number;
  mockExamsGoal?: number;
  mockExamsDone?: number;
  milestones: Milestone[];
  days: Record<string, DayEntry>; // key: YYYY-MM-DD
  createdAt: string;
};

const STORAGE_KEY = "acca:countdowns:v1";

export function loadCountdowns(): Countdown[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Countdown[];
  } catch {
    return [];
  }
}

export function saveCountdowns(list: Countdown[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function toDateKey(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function daysBetween(a: string, b: string): number {
  const d1 = parseDateKey(toDateKey(a));
  const d2 = parseDateKey(toDateKey(b));
  return Math.round((d2.getTime() - d1.getTime()) / 86400000);
}

export function buildDayList(start: string, deadline: string): string[] {
  const total = Math.max(1, daysBetween(start, deadline) + 1);
  const s = parseDateKey(toDateKey(start));
  const out: string[] = [];
  for (let i = 0; i < total; i++) {
    const d = new Date(s);
    d.setDate(d.getDate() + i);
    out.push(toDateKey(d));
  }
  return out;
}

export function countdownStats(c: Countdown) {
  const todayKey = toDateKey(new Date());
  const days = buildDayList(c.startDate, c.deadline);
  const total = days.length;
  const elapsedIdx = Math.max(0, Math.min(total, daysBetween(c.startDate, todayKey) + 1));
  const remaining = Math.max(0, daysBetween(todayKey, c.deadline));
  const elapsedPct = Math.round((elapsedIdx / total) * 100);
  const remainingPct = 100 - elapsedPct;

  const hoursLogged = Object.values(c.days).reduce(
    (sum, d) => sum + (d.hours ?? 0),
    0,
  );
  const topicsDone = c.milestones.filter((m) => m.done).length;

  return {
    days,
    total,
    todayKey,
    elapsedIdx,
    remaining,
    elapsedPct,
    remainingPct,
    hoursLogged,
    topicsDone,
  };
}

export function currentStreak(c: Countdown): number {
  const todayKey = toDateKey(new Date());
  let cursor = parseDateKey(todayKey);
  // if today not logged productive/average, start from yesterday
  const isCounted = (k: string) => {
    const e = c.days[k];
    return e && (e.status === "productive" || e.status === "average" || (e.hours ?? 0) > 0);
  };
  if (!isCounted(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (isCounted(toDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}
