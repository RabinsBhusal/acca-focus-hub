import type { SessionRow } from "./stats";
import { currentStreak, totalMinutes } from "./stats";

export type AchievementRow = {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  threshold: number;
  unit: string;
};

export type UserAchievementRow = {
  id: string;
  achievement_code: string;
  unlocked_at: string;
};

export type EvaluateInput = {
  sessions: SessionRow[];
  pomodoroCount: number;
  examCount: number;
};

/**
 * Return the current progress value for an achievement.
 */
export function progressFor(a: AchievementRow, input: EvaluateInput): number {
  switch (a.code) {
    case "streak_3":
    case "streak_7":
    case "streak_30":
    case "streak_100":
      return currentStreak(input.sessions);
    case "sessions_10":
    case "sessions_50":
    case "sessions_100":
    case "sessions_500":
      return input.sessions.length;
    case "hours_10":
    case "hours_50":
    case "hours_200":
      return totalMinutes(input.sessions);
    case "first_exam":
      return input.examCount;
    case "pomo_5":
    case "pomo_25":
    case "pomo_100":
      return input.pomodoroCount;
    default:
      return 0;
  }
}

export function isUnlocked(a: AchievementRow, input: EvaluateInput): boolean {
  return progressFor(a, input) >= a.threshold;
}

/**
 * Given the catalog + previously-unlocked codes, return codes that should be
 * newly inserted into user_achievements.
 */
export function evaluateAchievements(
  catalog: AchievementRow[],
  unlocked: UserAchievementRow[],
  input: EvaluateInput,
): string[] {
  const already = new Set(unlocked.map((u) => u.achievement_code));
  return catalog.filter((a) => !already.has(a.code) && isUnlocked(a, input)).map((a) => a.code);
}
