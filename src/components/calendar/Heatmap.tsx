import { toDateKey, type CalendarEvent } from "@/lib/calendar";
import type { SessionRow } from "@/lib/stats";

const WEEKS = 26;

export function Heatmap({ sessions }: { sessions: SessionRow[] }) {
  // Aggregate minutes per day
  const perDay = new Map<string, number>();
  for (const s of sessions) {
    const key = toDateKey(new Date(s.date));
    perDay.set(key, (perDay.get(key) ?? 0) + s.duration_minutes);
  }

  // Build grid: 7 rows (Mon..Sun) x WEEKS cols, ending today's week
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay();
  const monOffset = (dow + 6) % 7;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - monOffset);
  const start = new Date(thisMonday);
  start.setDate(thisMonday.getDate() - (WEEKS - 1) * 7);

  const cells: { date: Date; key: string; minutes: number }[] = [];
  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const key = toDateKey(date);
      cells.push({ date, key, minutes: perDay.get(key) ?? 0 });
    }
  }

  function intensity(mins: number) {
    if (mins === 0) return "bg-secondary/50";
    if (mins < 30) return "bg-primary/25";
    if (mins < 60) return "bg-primary/45";
    if (mins < 120) return "bg-primary/70";
    return "bg-primary";
  }

  return (
    <div>
      <div
        className="grid gap-[3px]"
        style={{
          gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))`,
          gridAutoFlow: "column",
          gridTemplateRows: "repeat(7, minmax(0, 1fr))",
        }}
      >
        {cells.map((c) => (
          <div
            key={c.key}
            title={`${c.date.toLocaleDateString()} · ${c.minutes}m`}
            className={`aspect-square rounded-[3px] ${intensity(c.minutes)} transition-transform hover:scale-125`}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
        <span>Less</span>
        <span className="h-2.5 w-2.5 rounded-[2px] bg-secondary/50" />
        <span className="h-2.5 w-2.5 rounded-[2px] bg-primary/25" />
        <span className="h-2.5 w-2.5 rounded-[2px] bg-primary/45" />
        <span className="h-2.5 w-2.5 rounded-[2px] bg-primary/70" />
        <span className="h-2.5 w-2.5 rounded-[2px] bg-primary" />
        <span>More</span>
      </div>
    </div>
  );
}

// Explicit unused import guard for tree-shaking clarity
export type _CalendarEventUnused = CalendarEvent;
