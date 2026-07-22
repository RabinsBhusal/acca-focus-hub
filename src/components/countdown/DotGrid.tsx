import { useState } from "react";
import type { Countdown, DayEntry } from "@/lib/countdowns";

function statusColor(entry: DayEntry | undefined, passed: boolean, isToday: boolean) {
  if (entry?.status === "missed") return "bg-destructive/70";
  if (entry?.status === "average") return "bg-amber-400/80";
  if (entry?.status === "productive") return "bg-primary";
  if (isToday) return "bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.25)]";
  if (passed) return "bg-primary/70";
  return "bg-muted-foreground/20 hover:bg-muted-foreground/40";
}

export function DotGrid({
  countdown,
  days,
  todayKey,
  onSelect,
}: {
  countdown: Countdown;
  days: string[];
  todayKey: string;
  onSelect: (key: string, dayNumber: number) => void;
}) {
  const [hover, setHover] = useState<{ key: string; idx: number } | null>(null);
  const hoverEntry = hover ? countdown.days[hover.key] : undefined;

  return (
    <div className="relative">
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(14px, 1fr))" }}
      >
        {days.map((key, idx) => {
          const entry = countdown.days[key];
          const isToday = key === todayKey;
          const passed = key < todayKey;
          const cls = statusColor(entry, passed, isToday);
          return (
            <button
              key={key}
              type="button"
              onMouseEnter={() => setHover({ key, idx })}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect(key, idx + 1)}
              className={`aspect-square w-full rounded-full transition-all duration-300 ${cls} ${
                isToday ? "animate-pulse" : ""
              } hover:scale-125`}
              aria-label={`Day ${idx + 1}: ${key}`}
            />
          );
        })}
      </div>

      {hover && (
        <div className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
          <div className="font-medium text-foreground">
            Day {hover.idx + 1} ·{" "}
            {new Date(hover.key).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="mt-0.5 space-y-0.5 text-muted-foreground">
            <div>Hours: {hoverEntry?.hours ?? 0}</div>
            <div>
              Status:{" "}
              {hoverEntry?.status
                ? hoverEntry.status
                : hover.key < countdown.startDate
                  ? "—"
                  : "not logged"}
            </div>
            {hoverEntry?.notes && (
              <div className="max-w-[200px] truncate">Note: {hoverEntry.notes}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
