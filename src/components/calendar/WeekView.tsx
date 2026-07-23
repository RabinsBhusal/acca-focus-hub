import { weekDays, groupEventsByDay, toDateKey, isSameDay, type CalendarEvent } from "@/lib/calendar";
import { EventChip } from "./EventDot";

export function WeekView({
  anchor,
  events,
  onDayClick,
  onEventClick,
}: {
  anchor: Date;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}) {
  const days = weekDays(anchor);
  const grouped = groupEventsByDay(events);
  const today = new Date();

  return (
    <div className="animate-in fade-in duration-300 grid grid-cols-1 gap-2 sm:grid-cols-7">
      {days.map((d) => {
        const key = toDateKey(d);
        const dayEvents = grouped.get(key) ?? [];
        const isToday = isSameDay(d, today);
        return (
          <button
            key={key}
            onClick={() => onDayClick(d)}
            className="flex min-h-[220px] flex-col rounded-lg border border-border/50 bg-card/60 p-2 text-left transition-colors hover:border-border hover:bg-card"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {d.toLocaleDateString(undefined, { weekday: "short" })}
              </div>
              <div
                className={`grid h-6 w-6 place-items-center rounded text-xs font-semibold ${
                  isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                }`}
              >
                {d.getDate()}
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-1">
              {dayEvents.length === 0 && (
                <div className="text-[11px] text-muted-foreground/60">—</div>
              )}
              {dayEvents.map((e) => (
                <EventChip key={e.id} event={e} onClick={() => onEventClick(e)} />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
