import { CATEGORY_META, type CalendarEvent } from "@/lib/calendar";
import type { Category } from "@/lib/calendar.functions";

export function EventChip({
  event,
  onClick,
}: {
  event: CalendarEvent;
  onClick?: () => void;
}) {
  const meta = CATEGORY_META[event.category as Category] ?? CATEGORY_META.task;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`group flex w-full items-center gap-1.5 truncate rounded-md border ${meta.border} ${meta.bg} px-1.5 py-0.5 text-left text-[11px] font-medium ${meta.color} transition-transform hover:scale-[1.02]`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.ring}`} />
      <span className={`truncate ${event.completed ? "line-through opacity-60" : ""}`}>
        {event.title}
      </span>
    </button>
  );
}
