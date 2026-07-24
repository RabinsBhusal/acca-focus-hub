import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PomodoroCard } from "@/components/timers/PomodoroCard";
import { CountdownCard } from "@/components/timers/CountdownCard";
import { StopwatchCard } from "@/components/timers/StopwatchCard";

export const Route = createFileRoute("/timers")({
  head: () => ({
    meta: [
      { title: "Timers — ACCA Study Tracker" },
      {
        name: "description",
        content: "Pomodoro, countdown, and stopwatch timers for focused study sessions.",
      },
      { property: "og:title", content: "Timers — ACCA Study Tracker" },
      {
        property: "og:description",
        content: "Pomodoro, countdown, and stopwatch timers for focused study sessions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Timers — ACCA Study Tracker" },
      {
        name: "twitter:description",
        content: "Pomodoro, countdown, and stopwatch timers for focused study sessions.",
      },
    ],
  }),
  component: TimersPage,
});

type Tab = "pomodoro" | "countdown" | "stopwatch";

const TABS: { id: Tab; label: string }[] = [
  { id: "pomodoro", label: "Pomodoro" },
  { id: "countdown", label: "Countdown" },
  { id: "stopwatch", label: "Stopwatch" },
];

function TimersPage() {
  const [tab, setTab] = useState<Tab>("pomodoro");

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Timers
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick your focus mode. Timers keep running as you move between pages.
        </p>
      </div>

      <div className="inline-flex rounded-lg border border-border/60 bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "pomodoro" && <PomodoroCard />}
      {tab === "countdown" && <CountdownCard />}
      {tab === "stopwatch" && <StopwatchCard />}
    </div>
  );
}
