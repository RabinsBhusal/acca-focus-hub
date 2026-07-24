import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { X } from "lucide-react";
import { toast } from "sonner";
import { upsertGoal, METRICS, PERIODS } from "@/lib/goals.functions";
import type { GoalRow } from "./GoalCard";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function defaultRange(period: "week" | "month" | "custom") {
  const now = new Date();
  if (period === "week") {
    const dow = now.getDay();
    const monOffset = (dow + 6) % 7;
    const start = new Date(now);
    start.setDate(now.getDate() - monOffset);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { starts_on: isoDate(start), ends_on: isoDate(end) };
  }
  if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { starts_on: isoDate(start), ends_on: isoDate(end) };
  }
  const start = now;
  const end = new Date(now);
  end.setDate(now.getDate() + 30);
  return { starts_on: isoDate(start), ends_on: isoDate(end) };
}

export function GoalDialog({
  open,
  onClose,
  goal,
}: {
  open: boolean;
  onClose: () => void;
  goal: GoalRow | null;
}) {
  const qc = useQueryClient();
  const upsertFn = useServerFn(upsertGoal);
  const [title, setTitle] = useState("");
  const [metric, setMetric] = useState<(typeof METRICS)[number]>("minutes");
  const [target, setTarget] = useState(600);
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("week");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");

  useEffect(() => {
    if (!open) return;
    if (goal) {
      setTitle(goal.title);
      setMetric(goal.metric);
      setTarget(goal.target);
      setPeriod(goal.period);
      setStartsOn(goal.starts_on);
      setEndsOn(goal.ends_on);
    } else {
      setTitle("");
      setMetric("minutes");
      setTarget(600);
      setPeriod("week");
      const r = defaultRange("week");
      setStartsOn(r.starts_on);
      setEndsOn(r.ends_on);
    }
  }, [open, goal]);

  useEffect(() => {
    if (period !== "custom") {
      const r = defaultRange(period);
      setStartsOn(r.starts_on);
      setEndsOn(r.ends_on);
    }
  }, [period]);

  const save = useMutation({
    mutationFn: () =>
      upsertFn({
        data: {
          id: goal?.id,
          title,
          metric,
          target,
          period,
          starts_on: startsOn,
          ends_on: endsOn,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      toast.success(goal ? "Goal updated" : "Goal added");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {goal ? "Edit goal" : "New goal"}
          </h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Study 20 hours this week"
              className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Metric">
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value as (typeof METRICS)[number])}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                {METRICS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Target">
              <input
                type="number"
                min={1}
                value={target}
                onChange={(e) => setTarget(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </Field>
          </div>
          <Field label="Period">
            <div className="flex gap-2">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    period === p
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </Field>
          {period === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Starts">
                <input
                  type="date"
                  value={startsOn}
                  onChange={(e) => setStartsOn(e.target.value)}
                  className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </Field>
              <Field label="Ends">
                <input
                  type="date"
                  value={endsOn}
                  onChange={(e) => setEndsOn(e.target.value)}
                  className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </Field>
            </div>
          )}
        </div>
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending || !title.trim()}
          className="mt-5 w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground shadow-lg disabled:opacity-60"
        >
          {save.isPending ? "Saving..." : "Save goal"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
