import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Plus, Trophy } from "lucide-react";
import {
  achievementsQueryOptions,
  userAchievementsQueryOptions,
  sessionsQueryOptions,
  pomodorosQueryOptions,
  examsQueryOptions,
  goalsQueryOptions,
} from "@/lib/queries";
import { BadgeCard } from "@/components/achievements/BadgeCard";
import { GoalCard, type GoalRow } from "@/components/achievements/GoalCard";
import { GoalDialog } from "@/components/achievements/GoalDialog";
import type { SessionRow } from "@/lib/stats";
import { useAchievementEvaluator } from "@/hooks/useAchievementEvaluator";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — ACCA Study Tracker" },
      {
        name: "description",
        content: "Unlock badges and track your study goals over time.",
      },
      { property: "og:title", content: "Achievements — ACCA Study Tracker" },
      {
        property: "og:description",
        content: "Unlock badges and track your study goals over time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Achievements — ACCA Study Tracker" },
      {
        name: "twitter:description",
        content: "Unlock badges and track your study goals over time.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(achievementsQueryOptions);
    context.queryClient.ensureQueryData(userAchievementsQueryOptions);
    context.queryClient.ensureQueryData(sessionsQueryOptions);
    context.queryClient.ensureQueryData(pomodorosQueryOptions);
    context.queryClient.ensureQueryData(examsQueryOptions);
    context.queryClient.ensureQueryData(goalsQueryOptions);
  },
  component: AchievementsPage,
});

function AchievementsPage() {
  const { data: catalog } = useSuspenseQuery(achievementsQueryOptions);
  const { data: unlocked } = useSuspenseQuery(userAchievementsQueryOptions);
  const { data: sessions } = useSuspenseQuery(sessionsQueryOptions);
  const { data: poms } = useSuspenseQuery(pomodorosQueryOptions);
  const { data: exams } = useSuspenseQuery(examsQueryOptions);
  const { data: goals } = useSuspenseQuery(goalsQueryOptions);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GoalRow | null>(null);
  const { check } = useAchievementEvaluator();

  // backfill any missed unlocks on mount
  useEffect(() => {
    void check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const input = useMemo(
    () => ({
      sessions: sessions as SessionRow[],
      pomodoroCount: poms.length,
      examCount: exams.length,
    }),
    [sessions, poms, exams],
  );

  const unlockedByCode = useMemo(() => {
    const m = new Map<string, (typeof unlocked)[number]>();
    for (const u of unlocked) m.set(u.achievement_code, u);
    return m;
  }, [unlocked]);

  const sorted = useMemo(() => {
    return [...catalog].sort((a, b) => {
      const au = unlockedByCode.has(a.code) ? 0 : 1;
      const bu = unlockedByCode.has(b.code) ? 0 : 1;
      if (au !== bu) return au - bu;
      return a.threshold - b.threshold;
    });
  }, [catalog, unlockedByCode]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            Achievements
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unlocked.length} of {catalog.length} badges unlocked
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-primary sm:flex">
          <Trophy className="h-5 w-5" />
          <span className="font-display text-xl font-semibold">{unlocked.length}</span>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">Goals</h2>
          <button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" /> New goal
          </button>
        </div>
        {goals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-6 text-center text-sm text-muted-foreground">
            No goals yet. Set one to track weekly or monthly progress.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {(goals as GoalRow[]).map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                sessions={sessions as SessionRow[]}
                pomodoroCount={poms.length}
                onEdit={() => {
                  setEditing(g);
                  setDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Badges</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((a) => (
            <BadgeCard
              key={a.id}
              achievement={a}
              unlocked={unlockedByCode.get(a.code)}
              input={input}
            />
          ))}
        </div>
      </section>

      <GoalDialog open={dialogOpen} onClose={() => setDialogOpen(false)} goal={editing} />
    </div>
  );
}
