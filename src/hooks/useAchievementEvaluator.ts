import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCallback } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  achievementsQueryOptions,
  userAchievementsQueryOptions,
  sessionsQueryOptions,
  pomodorosQueryOptions,
  examsQueryOptions,
} from "@/lib/queries";
import { unlockAchievements } from "@/lib/achievements.functions";
import { evaluateAchievements } from "@/lib/achievements";
import type { SessionRow } from "@/lib/stats";

/**
 * Hook: evaluates achievements against current cached data and unlocks any
 * newly-earned ones. Call `check()` after saving a session, exam, or pomodoro.
 */
export function useAchievementEvaluator() {
  const qc = useQueryClient();
  const unlockFn = useServerFn(unlockAchievements);
  const catalog = useQuery(achievementsQueryOptions);
  const unlocked = useQuery(userAchievementsQueryOptions);

  const mutation = useMutation({
    mutationFn: (codes: string[]) => unlockFn({ data: { codes } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-achievements"] });
    },
  });

  const check = useCallback(async () => {
    // pull fresh data so counters reflect the just-inserted row
    const [sessions, poms, exams] = await Promise.all([
      qc.ensureQueryData(sessionsQueryOptions),
      qc.ensureQueryData(pomodorosQueryOptions),
      qc.ensureQueryData(examsQueryOptions),
    ]);
    const cat = catalog.data ?? (await qc.ensureQueryData(achievementsQueryOptions));
    const un = unlocked.data ?? (await qc.ensureQueryData(userAchievementsQueryOptions));
    const newCodes = evaluateAchievements(cat, un, {
      sessions: sessions as SessionRow[],
      pomodoroCount: poms.length,
      examCount: exams.length,
    });
    if (newCodes.length === 0) return [];
    await mutation.mutateAsync(newCodes);
    // celebrate
    for (const code of newCodes) {
      const a = cat.find((x) => x.code === code);
      toast.success(`🏆 Achievement unlocked: ${a?.title ?? code}`);
    }
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.35 },
    });
    return newCodes;
  }, [qc, catalog.data, unlocked.data, mutation]);

  return { check };
}
