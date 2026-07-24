import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useCountdown } from "@/lib/timers/countdownStore";
import { fmtMs } from "@/lib/timers/pomodoroStore";
import { playDing } from "@/lib/timers/timerAudio";
import { toast } from "sonner";

const PRESETS = [15, 25, 50, 90];

export function CountdownCard() {
  const state = useCountdown();
  const [, force] = useState(0);
  const [minutes, setMinutes] = useState(25);

  useEffect(() => {
    const id = setInterval(() => {
      state.tick();
      force((n) => n + 1);
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    state.setOnFinish(() => {
      playDing();
      toast.success("Countdown finished!");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remaining =
    state.running && state.endsAt != null
      ? Math.max(0, state.endsAt - Date.now())
      : state.remainingMs;
  const progress = state.totalMs > 0 ? 1 - remaining / state.totalMs : 0;

  const size = 240;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  function applyPreset(m: number) {
    setMinutes(m);
    state.set(m);
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="mb-4 flex flex-wrap gap-2">
        {PRESETS.map((m) => (
          <button
            key={m}
            onClick={() => applyPreset(m)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              state.totalMs === m * 60000
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {m}m
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={240}
            value={minutes}
            onChange={(e) => setMinutes(Math.max(1, Number(e.target.value) || 1))}
            className="w-16 rounded-md border border-border/60 bg-background px-2 py-1 text-sm text-foreground outline-none focus:border-primary"
          />
          <button
            onClick={() => state.set(minutes)}
            className="rounded-md border border-border/60 bg-secondary px-2 py-1 text-xs font-medium text-foreground hover:bg-secondary/70"
          >
            Set
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center">
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
              className="text-amber-400 transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-display text-5xl font-semibold tabular-nums text-foreground">
              {fmtMs(remaining)}
            </div>
            {state.finished && (
              <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
                Done
              </div>
            )}
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
      </div>
    </div>
  );
}
