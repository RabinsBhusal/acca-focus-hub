import { groupEventsByDay, toDateKey, type CalendarEvent, CATEGORY_META } from "@/lib/calendar";
import type { Category } from "@/lib/calendar.functions";
import { Clock } from "lucide-react";

export function DayView({
  anchor,
  events,
  onEventClick,
  onNew,
}: {
  anchor: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onNew: () => void;
}) {
  const grouped = groupEventsByDay(events);
  const dayEvents = (grouped.get(toDateKey(anchor)) ?? []).sort(
    (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
  );

  return (
    <div className="animate-in fade-in duration-300 space-y-2">
      <div className="text-sm text-muted-foreground">
        {anchor.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </div>
      {dayEvents.length === 0 && (
        <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-8 text-center">
          <p className="text-sm text-muted-foreground">Nothing scheduled.</p>
          <button
            onClick={onNew}
            className="mt-3 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
          >
            Add event
          </button>
        </div>
      )}
      <div className="space-y-2">
        {dayEvents.map((e) => {
          const meta = CATEGORY_META[e.category as Category] ?? CATEGORY_META.task;
          const time = new Date(e.start_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <button
              key={e.id}
              onClick={() => onEventClick(e)}
              className="flex w-full items-start gap-3 rounded-lg border border-border/60 bg-card p-3 text-left transition-colors hover:border-border"
            >
              <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${meta.ring}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${meta.color}`}>
                    {meta.label}
                  </span>
                  <span
                    className={`truncate text-sm font-medium text-foreground ${
                      e.completed ? "line-through opacity-60" : ""
                    }`}
                  >
                    {e.title}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {e.all_day ? "All day" : time}
                  {e.duration_minutes ? ` · ${e.duration_minutes}m` : ""}
                </div>
                {e.notes && (
                  <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{e.notes}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
