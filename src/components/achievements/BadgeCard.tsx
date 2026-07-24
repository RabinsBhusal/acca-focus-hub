import * as Icons from "lucide-react";
import type { AchievementRow, UserAchievementRow } from "@/lib/achievements";
import { progressFor, type EvaluateInput } from "@/lib/achievements";

export function BadgeCard({
  achievement,
  unlocked,
  input,
}: {
  achievement: AchievementRow;
  unlocked?: UserAchievementRow;
  input: EvaluateInput;
}) {
  const Icon =
    (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
      achievement.icon
    ] ?? Icons.Award;
  const progress = progressFor(achievement, input);
  const pct = Math.min(100, Math.round((progress / achievement.threshold) * 100));
  const isUnlocked = !!unlocked;

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all ${
        isUnlocked
          ? "border-primary/40 bg-gradient-to-br from-primary/10 to-transparent"
          : "border-border/60 bg-card"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
            isUnlocked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div
            className={`font-display text-sm font-semibold ${
              isUnlocked ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {achievement.title}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {achievement.description}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>
            {progress.toLocaleString()} / {achievement.threshold.toLocaleString()} {achievement.unit}
          </span>
          {isUnlocked && (
            <span className="font-semibold text-primary">
              ✓ {new Date(unlocked.unlocked_at).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isUnlocked ? "bg-primary" : "bg-muted-foreground/40"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
