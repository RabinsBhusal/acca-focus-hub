import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Pause, Play, RotateCcw, SkipForward, Settings2 } from "lucide-react";
import { usePomodoro, displayRemaining, fmtMs, type PomodoroPhase } from "@/lib/timers/pomodoroStore";
import { playDing } from "@/lib/timers/timerAudio";
import { logPomodoro } from "@/lib/achievements.functions";
import { useAchievementEvaluator } from "@/hooks/useAchievementEvaluator";

const PHASE_LABEL: Record<PomodoroPhase, string> = {
  work: "Focus",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

const PHASE_COLOR: Record<PomodoroPhase, string> = {
  work: "text-primary",
  shortBreak: "text-emerald-400",
  longBreak: "text-sky-400",
};

export function PomodoroCard({ compact = false }: { compact?: boolean }) {
  const state = usePomodoro();
  const [, force] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const qc = useQueryClient();
  const logFn = useServerFn(logPomodoro);
  const { check } = useAchievementEvaluator();

  const logMutation = useMutation({
    mutationFn: (duration_minutes: number) => logFn({ data: { duration_minutes } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pomodoros"] });
      void check();
    },
  });

  // ticking + auto-transition
  useEffect(() => {
    const id = setInterval(() => {
      state.tick();
      force((n) => n + 1);
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // wire completion callback once
  useEffect(() => {
    state.setOnPhaseComplete((finished) => {
      playDing();
      if (finished === "work") {
        logMutation.mutate(state.workMin);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remaining = displayRemaining(state);
  const total =
    state.phase === "work"
      ? state.workMin * 60000
      : state.phase === "shortBreak"
        ? state.shortBreakMin * 60000
        : state.longBreakMin * 60000;
  const progress = 1 - remaining / total;

  const size = compact ? 140 : 240;
  const stroke = compact ? 8 : 12;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className={`text-xs font-semibold uppercase tracking-widest ${PHASE_COLOR[state.phase]}`}>
            {PHASE_LABEL[state.phase]}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {state.completedWorkCycles} focus cycles today
          </div>
        </div>
        {!compact && (
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Timer settings"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="hsl(var(--muted))"
              strokeOpacity="0.3"
              strokeWidth={stroke}
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="currentColor"
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - progress)}
              strokeLinecap="round"
              className={`${PHASE_COLOR[state.phase]} transition-all duration-500`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className={`font-display font-semibold tabular-nums text-foreground ${
                compact ? "text-3xl" : "text-5xl"
              }`}
            >
              {fmtMs(remaining)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        {state.running ? (
          <button
            onClick={state.pause}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-card text-foreground hover:bg-secondary"
            aria-label="Pause"
          >
            <Pause className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={state.start}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform"
            aria-label="Start"
          >
            <Play className="h-5 w-5 fill-current" />
          </button>
        )}
        <button
          onClick={state.reset}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground hover:text-foreground"
          aria-label="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={state.skip}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground hover:text-foreground"
          aria-label="Skip phase"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>

      {showSettings && !compact && (
        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border/50 pt-4">
          <SettingInput
            label="Focus"
            value={state.workMin}
            onChange={(v) => state.setSettings({ workMin: v })}
          />
          <SettingInput
            label="Short break"
            value={state.shortBreakMin}
            onChange={(v) => state.setSettings({ shortBreakMin: v })}
          />
          <SettingInput
            label="Long break"
            value={state.longBreakMin}
            onChange={(v) => state.setSettings({ longBreakMin: v })}
          />
        </div>
      )}
    </div>
  );
}

function SettingInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        min={1}
        max={180}
        value={value}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
        className="w-full rounded-md border border-border/60 bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary"
      />
    </label>
  );
}
