import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export type CalendarView = "month" | "week" | "day";

export function CalendarHeader({
  view,
  onViewChange,
  anchor,
  onPrev,
  onNext,
  onToday,
  onNew,
  label,
}: {
  view: CalendarView;
  onViewChange: (v: CalendarView) => void;
  anchor: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onNew: () => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          {label}
        </h1>
        <div className="ml-2 flex items-center gap-1">
          <button
            onClick={onPrev}
            aria-label="Previous"
            className="grid h-8 w-8 place-items-center rounded-md border border-border/60 bg-card text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={onToday}
            className="rounded-md border border-border/60 bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Today
          </button>
          <button
            onClick={onNext}
            aria-label="Next"
            className="grid h-8 w-8 place-items-center rounded-md border border-border/60 bg-card text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-md border border-border/60 bg-card p-0.5 text-xs font-medium">
          {(["month", "week", "day"] as const).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`rounded px-2.5 py-1 capitalize transition-colors ${
                view === v
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <button
          onClick={onNew}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" /> New
        </button>
      </div>
    </div>
  );
}
