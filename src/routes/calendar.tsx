import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { eventsQueryOptions, sessionsQueryOptions } from "@/lib/queries";
import { CalendarHeader, type CalendarView } from "@/components/calendar/CalendarHeader";
import { MonthView } from "@/components/calendar/MonthView";
import { WeekView } from "@/components/calendar/WeekView";
import { DayView } from "@/components/calendar/DayView";
import { EventDialog } from "@/components/calendar/EventDialog";
import { Heatmap } from "@/components/calendar/Heatmap";
import type { CalendarEvent } from "@/lib/calendar";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — ACCA Study Tracker" },
      {
        name: "description",
        content: "Plan study sessions, exams, tasks and reminders in one calendar.",
      },
      { property: "og:title", content: "Calendar — ACCA Study Tracker" },
      {
        property: "og:description",
        content: "Plan study sessions, exams, tasks and reminders in one calendar.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(eventsQueryOptions);
    context.queryClient.ensureQueryData(sessionsQueryOptions);
  },
  component: CalendarPage,
});

function CalendarPage() {
  const { data: events } = useSuspenseQuery(eventsQueryOptions);
  const { data: sessions } = useSuspenseQuery(sessionsQueryOptions);

  const [view, setView] = useState<CalendarView>("month");
  const [anchor, setAnchor] = useState(() => new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [prefillDate, setPrefillDate] = useState<Date | undefined>();

  const typedEvents = events as unknown as CalendarEvent[];

  function openNew(date?: Date) {
    setEditing(null);
    setPrefillDate(date);
    setDialogOpen(true);
  }
  function openEdit(e: CalendarEvent) {
    setEditing(e);
    setPrefillDate(undefined);
    setDialogOpen(true);
  }

  function step(delta: number) {
    const next = new Date(anchor);
    if (view === "month") next.setMonth(anchor.getMonth() + delta);
    else if (view === "week") next.setDate(anchor.getDate() + delta * 7);
    else next.setDate(anchor.getDate() + delta);
    setAnchor(next);
  }

  const label =
    view === "month"
      ? anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" })
      : view === "week"
      ? (() => {
          const dow = anchor.getDay();
          const monOffset = (dow + 6) % 7;
          const start = new Date(anchor);
          start.setDate(anchor.getDate() - monOffset);
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
        })()
      : anchor.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <CalendarHeader
        view={view}
        onViewChange={setView}
        anchor={anchor}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        onToday={() => setAnchor(new Date())}
        onNew={() => openNew()}
        label={label}
      />

      {view === "month" && (
        <MonthView
          anchor={anchor}
          events={typedEvents}
          onDayClick={(d) => openNew(d)}
          onEventClick={openEdit}
        />
      )}
      {view === "week" && (
        <WeekView
          anchor={anchor}
          events={typedEvents}
          onDayClick={(d) => openNew(d)}
          onEventClick={openEdit}
        />
      )}
      {view === "day" && (
        <DayView
          anchor={anchor}
          events={typedEvents}
          onEventClick={openEdit}
          onNew={() => openNew(anchor)}
        />
      )}

      <div className="rounded-xl border border-border/60 bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">
              Productivity heatmap
            </h2>
            <p className="text-xs text-muted-foreground">Last 26 weeks of study activity</p>
          </div>
        </div>
        <Heatmap sessions={sessions} />
      </div>

      <EventDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        event={editing}
        prefillDate={prefillDate}
      />
    </div>
  );
}
