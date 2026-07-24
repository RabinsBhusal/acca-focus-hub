import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteGoal } from "@/lib/goals.functions";
import type { SessionRow } from "@/lib/stats";

export type GoalRow = {
  id: string;
  title: string;
  metric: "minutes" | "sessions" | "pomodoros";
  target: number;
  period: "week" | "month" | "custom";
  starts_on: string;
  ends_on: string;
  created_at: string;
  updated_at: string;
};

export function GoalCard({
  goal,
  sessions,
  pomodoroCount,
  onEdit,
}: {
  goal: GoalRow;
  sessions: SessionRow[];
  pomodoroCount: number;
  onEdit: () => void;
}) {
  const qc = useQueryClient();
  const deleteFn = useServerFn(deleteGoal);
  const [confirming, setConfirming] = useState(false);

  const del = useMutation({
    mutationFn: () => deleteFn({ data: { id: goal.id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const progress = useMemo(() => {
    const start = new Date(goal.starts_on);
    const end = new Date(goal.ends_on);
    end.setHours(23, 59, 59, 999);
    const inRange = sessions.filter((s) => {
      const d = new Date(s.date);
      return d >= start && d <= end;
    });
    if (goal.metric === "minutes") {
      return inRange.reduce((sum, s) => sum + s.duration_minutes, 0);
    }
    if (goal.metric === "sessions") {
      return inRange.length;
    }
    // pomodoros: we don't have per-pomodoro dates cheaply here, use total count
    return pomodoroCount;
  }, [goal, sessions, pomodoroCount]);

  const pct = Math.min(100, Math.round((progress / goal.target) * 100));
  const complete = progress >= goal.target;
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(goal.ends_on).getTime() - Date.now()) / 86400000),
  );

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-display text-sm font-semibold text-foreground">{goal.title}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {progress.toLocaleString()} / {goal.target.toLocaleString()} {goal.metric} ·{" "}
            {daysLeft}d left
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Edit goal"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => (confirming ? del.mutate() : setConfirming(true))}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
            aria-label={confirming ? "Confirm delete" : "Delete goal"}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            complete ? "bg-emerald-400" : "bg-primary"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {complete && (
        <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
          ✓ Complete
        </div>
      )}
    </div>
  );
}
