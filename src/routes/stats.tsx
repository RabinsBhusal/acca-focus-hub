import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Clock, Flame, ListChecks, CalendarDays, CalendarRange } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { sessionsQueryOptions } from "@/lib/queries";
import {
  currentStreak,
  dailyMinutesLastNDays,
  formatHours,
  minutesThisMonth,
  minutesThisWeek,
  totalMinutes,
  weeklyMinutesLastNWeeks,
} from "@/lib/stats";

export const Route = createFileRoute("/stats")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(sessionsQueryOptions);
  },
  component: StatsPage,
});

function StatsPage() {
  const { data: sessions } = useSuspenseQuery(sessionsQueryOptions);
  const total = totalMinutes(sessions);
  const week = minutesThisWeek(sessions);
  const month = minutesThisMonth(sessions);
  const streak = currentStreak(sessions);
  const daily = dailyMinutesLastNDays(sessions, 14);
  const weekly = weeklyMinutesLastNWeeks(sessions, 8);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Statistics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Your study patterns at a glance.</p>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Total hours" value={formatHours(total)} icon={Clock} />
        <StatCard label="Sessions" value={String(sessions.length)} icon={ListChecks} />
        <StatCard label="This week" value={formatHours(week)} icon={CalendarDays} />
        <StatCard label="This month" value={formatHours(month)} icon={CalendarRange} />
        <StatCard label="Streak" value={`${streak}d`} icon={Flame} />
      </section>

      <ChartCard title="Study time · last 14 days" subtitle="Minutes per day">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={daily} margin={{ left: -20, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
            <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "var(--color-secondary)", opacity: 0.4 }}
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v: number) => [`${v} min`, "Study"]}
            />
            <Bar dataKey="minutes" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Weekly progress" subtitle="Last 8 weeks">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={weekly} margin={{ left: -20, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
            <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v: number) => [`${v} min`, "Study"]}
            />
            <Line
              type="monotone"
              dataKey="minutes"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              dot={{ fill: "var(--color-primary)", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
