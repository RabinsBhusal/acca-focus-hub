import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Play, Clock, Flame, CalendarDays, CalendarRange } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { SessionCard } from "@/components/SessionCard";
import { PomodoroCard } from "@/components/timers/PomodoroCard";
import { sessionsQueryOptions } from "@/lib/queries";
import {
  currentStreak,
  formatHours,
  minutesThisMonth,
  minutesThisWeek,
  minutesToday,
} from "@/lib/stats";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — ACCA Study Tracker" },
      {
        name: "description",
        content: "Today's study totals, streak, and a built-in Pomodoro timer.",
      },
      { property: "og:title", content: "Dashboard — ACCA Study Tracker" },
      {
        property: "og:description",
        content: "Today's study totals, streak, and a built-in Pomodoro timer.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(sessionsQueryOptions);
  },
  component: Dashboard,
});

function Dashboard() {
  const { data: sessions } = useSuspenseQuery(sessionsQueryOptions);
  const today = minutesToday(sessions);
  const week = minutesThisWeek(sessions);
  const month = minutesThisMonth(sessions);
  const streak = currentStreak(sessions);
  const recent = sessions.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Ready to study?
        </h1>
      </section>

      <Link
        to="/session"
        className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6 transition-all hover:border-primary/50 hover:shadow-[0_0_40px_-10px_hsl(var(--primary))]"
      >
        <div>
          <div className="text-xs font-medium uppercase tracking-widest text-primary/80">
            Focus mode
          </div>
          <div className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Start Study Session
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Pick a subject and start the timer.
          </div>
        </div>
        <span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-105">
          <Play className="h-6 w-6 translate-x-0.5 fill-current" />
        </span>
      </Link>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Today" value={formatHours(today)} icon={Clock} />
        <StatCard label="This week" value={formatHours(week)} icon={CalendarDays} />
        <StatCard label="This month" value={formatHours(month)} icon={CalendarRange} />
        <StatCard label="Streak" value={`${streak}d`} icon={Flame} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Recent activity
          </h2>
          {sessions.length > 0 && (
            <Link
              to="/history"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View all →
            </Link>
          )}
        </div>
        {recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No sessions yet. Start your first one above.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
