import { Link } from "@tanstack/react-router";
import { Play, Timer as TimerIcon } from "lucide-react";

/**
 * The full count-up stopwatch flow lives on /session (with subject setup,
 * feedback, and DB save). This card is a compact entry point from /timers.
 */
export function StopwatchCard() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 text-center">
      <TimerIcon className="mx-auto h-8 w-8 text-primary" />
      <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
        Study Stopwatch
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        The classic count-up timer with subject setup and post-session feedback.
      </p>
      <Link
        to="/session"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:scale-[1.02]"
      >
        <Play className="h-4 w-4 fill-current" />
        Start stopwatch
      </Link>
    </div>
  );
}
