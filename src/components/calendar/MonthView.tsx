import { monthGrid, groupEventsByDay, toDateKey, isSameDay, type CalendarEvent } from "@/lib/calendar";
import { EventChip } from "./EventDot";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthView({
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
  const grid = monthGrid(anchor);
  const grouped = groupEventsByDay(events);
  const today = new Date();
  const currentMonth = anchor.getMonth();

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {grid.map((d) => {
          const key = toDateKey(d);
          const dayEvents = grouped.get(key) ?? [];
          const inMonth = d.getMonth() === currentMonth;
          const isToday = isSameDay(d, today);
          return (
            <button
              key={key}
              onClick={() => onDayClick(d)}
              className={`group flex min-h-[86px] flex-col rounded-md border border-border/50 bg-card/60 p-1.5 text-left transition-colors hover:border-border hover:bg-card ${
                inMonth ? "" : "opacity-40"
              }`}
            >
              <div
                className={`mb-1 inline-flex h-5 w-5 items-center justify-center rounded text-[11px] font-semibold ${
                  isToday
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {d.getDate()}
              </div>
              <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                {dayEvents.slice(0, 3).map((e) => (
                  <EventChip key={e.id} event={e} onClick={() => onEventClick(e)} />
                ))}
                {dayEvents.length > 3 && (
                  <div className="mt-0.5 text-[10px] text-muted-foreground">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
