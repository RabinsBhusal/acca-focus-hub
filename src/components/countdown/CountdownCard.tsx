import { useMemo, useState } from "react";
import { Calendar, Clock, Flame, Target, Trash2, BookCheck, Trophy } from "lucide-react";
import type { Countdown, DayEntry } from "@/lib/countdowns";
import { countdownStats, currentStreak } from "@/lib/countdowns";
import { DotGrid } from "./DotGrid";
import { DayModal } from "./DayModal";
import { MilestoneList } from "./MilestoneList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CountdownCard({
  countdown,
  onChange,
  onDelete,
}: {
  countdown: Countdown;
  onChange: (c: Countdown) => void;
  onDelete: () => void;
}) {
  const stats = useMemo(() => countdownStats(countdown), [countdown]);
  const streak = useMemo(() => currentStreak(countdown), [countdown]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);

  const updateDay = (key: string, entry: DayEntry) => {
    const days = { ...countdown.days };
    if (!entry.status && entry.hours == null && !entry.notes && !entry.topics) {
      delete days[key];
    } else {
      days[key] = entry;
    }
    onChange({ ...countdown, days });
  };

  const prettyDeadline = new Date(countdown.deadline).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-widest text-primary/80">
            Countdown
          </div>
          <h2 className="mt-1 font-display text-xl font-semibold text-foreground sm:text-2xl">
            {countdown.title}
          </h2>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {prettyDeadline}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="font-display text-5xl font-semibold tabular-nums text-foreground sm:text-6xl">
            {stats.remaining}
          </div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            days left
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
          <span>{stats.elapsedPct}% elapsed</span>
          <span>{stats.remainingPct}% remaining</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-700"
            style={{ width: `${stats.elapsedPct}%` }}
          />
        </div>
      </div>

      {/* Dot grid */}
      <DotGrid
        countdown={countdown}
        days={stats.days}
        todayKey={stats.todayKey}
        onSelect={(key, dayNumber) => {
          setSelectedKey(key);
          setSelectedDay(dayNumber);
        }}
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric icon={Clock} label="Days left" value={String(stats.remaining)} />
        <Metric
          icon={Target}
          label="Study hours"
          value={`${stats.hoursLogged.toFixed(0)}${
            countdown.studyHoursGoal ? ` / ${countdown.studyHoursGoal}` : ""
          }`}
        />
        <Metric
          icon={BookCheck}
          label="Topics"
          value={`${stats.topicsDone}${countdown.topicsGoal ? ` / ${countdown.topicsGoal}` : ""}`}
        />
        <Metric icon={Flame} label="Streak" value={`${streak}d`} />
      </div>

      {/* Mocks + hours predict */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border/60 bg-background/40 p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5" /> Mock exams</span>
            <span>
              {countdown.mockExamsDone ?? 0}
              {countdown.mockExamsGoal ? ` / ${countdown.mockExamsGoal}` : ""}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                onChange({
                  ...countdown,
                  mockExamsDone: Math.max(0, (countdown.mockExamsDone ?? 0) - 1),
                })
              }
            >
              −
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                onChange({
                  ...countdown,
                  mockExamsDone: (countdown.mockExamsDone ?? 0) + 1,
                })
              }
            >
              +
            </Button>
            <Input
              type="number"
              min="0"
              value={countdown.mockExamsGoal ?? ""}
              onChange={(e) =>
                onChange({
                  ...countdown,
                  mockExamsGoal: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="goal"
              className="ml-auto h-8 w-20 text-xs"
            />
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/40 p-3">
          <div className="text-xs text-muted-foreground">Predicted total hours</div>
          <div className="mt-1 font-display text-lg text-foreground">
            {predictedHours(stats.hoursLogged, stats.elapsedIdx, stats.total).toFixed(0)}h
          </div>
          <div className="text-xs text-muted-foreground">
            at your current daily average
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div>
        <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Milestones
        </h3>
        <MilestoneList
          milestones={countdown.milestones}
          onChange={(milestones) => onChange({ ...countdown, milestones })}
        />
      </div>

      <div className="flex justify-end border-t border-border/40 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
        </Button>
      </div>

      <DayModal
        open={!!selectedKey}
        onOpenChange={(o) => !o && setSelectedKey(null)}
        dateKey={selectedKey}
        dayNumber={selectedDay}
        initial={selectedKey ? countdown.days[selectedKey] : undefined}
        onSave={(entry) => selectedKey && updateDay(selectedKey, entry)}
      />
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 font-display text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}

function predictedHours(logged: number, elapsedDays: number, totalDays: number) {
  if (elapsedDays < 1) return 0;
  const avg = logged / elapsedDays;
  return avg * totalDays;
}
