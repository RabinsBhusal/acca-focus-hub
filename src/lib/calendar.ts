import type { Category } from "./calendar.functions";

export const CATEGORY_META: Record<
  Category,
  { label: string; color: string; bg: string; border: string; ring: string }
> = {
  study: {
    label: "Study",
    color: "text-sky-300",
    bg: "bg-sky-500/20",
    border: "border-sky-500/40",
    ring: "bg-sky-500",
  },
  exam: {
    label: "Exam",
    color: "text-red-300",
    bg: "bg-red-500/20",
    border: "border-red-500/40",
    ring: "bg-red-500",
  },
  task: {
    label: "Task",
    color: "text-emerald-300",
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/40",
    ring: "bg-emerald-500",
  },
  personal: {
    label: "Personal",
    color: "text-violet-300",
    bg: "bg-violet-500/20",
    border: "border-violet-500/40",
    ring: "bg-violet-500",
  },
  assignment: {
    label: "Assignment",
    color: "text-amber-300",
    bg: "bg-amber-500/20",
    border: "border-amber-500/40",
    ring: "bg-amber-500",
  },
  reminder: {
    label: "Reminder",
    color: "text-slate-300",
    bg: "bg-slate-500/20",
    border: "border-slate-500/40",
    ring: "bg-slate-500",
  },
};

export type CalendarEvent = {
  id: string;
  title: string;
  category: string;
  start_at: string;
  duration_minutes: number | null;
  all_day: boolean;
  priority: number | null;
  notes: string | null;
  completed: boolean;
  session_id: string | null;
  exam_id: string | null;
  created_at: string;
  updated_at: string;
};

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 6-week grid starting on Monday for the month containing `anchor`. */
export function monthGrid(anchor: Date): Date[] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const dow = first.getDay();
  const monOffset = (dow + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - monOffset);
  const out: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push(d);
  }
  return out;
}

/** 7 days starting Monday of the week containing `anchor`. */
export function weekDays(anchor: Date): Date[] {
  const dow = anchor.getDay();
  const monOffset = (dow + 6) % 7;
  const start = new Date(anchor);
  start.setHours(0, 0, 0, 0);
  start.setDate(anchor.getDate() - monOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function groupEventsByDay(events: CalendarEvent[]) {
  const map = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const key = toDateKey(new Date(e.start_at));
    const arr = map.get(key) ?? [];
    arr.push(e);
    map.set(key, arr);
  }
  return map;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}
