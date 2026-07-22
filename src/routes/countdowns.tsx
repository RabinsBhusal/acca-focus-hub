import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountdownCard } from "@/components/countdown/CountdownCard";
import { CountdownForm } from "@/components/countdown/CountdownForm";
import type { Countdown } from "@/lib/countdowns";
import { loadCountdowns, saveCountdowns } from "@/lib/countdowns";

export const Route = createFileRoute("/countdowns")({
  head: () => ({
    meta: [
      { title: "Countdowns — ACCA Study Tracker" },
      {
        name: "description",
        content:
          "Visual deadline countdowns with a dot-grid habit tracker for every day until exam day.",
      },
      { property: "og:title", content: "Countdowns — ACCA Study Tracker" },
      {
        property: "og:description",
        content:
          "Visual deadline countdowns with a dot-grid habit tracker for every day until exam day.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Countdowns — ACCA Study Tracker" },
      {
        name: "twitter:description",
        content:
          "Visual deadline countdowns with a dot-grid habit tracker for every day until exam day.",
      },
    ],
  }),
  component: CountdownsPage,
});

function CountdownsPage() {
  const [list, setList] = useState<Countdown[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setList(loadCountdowns());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCountdowns(list);
  }, [list, hydrated]);

  const update = (c: Countdown) =>
    setList((xs) => xs.map((x) => (x.id === c.id ? c : x)));
  const remove = (id: string) =>
    setList((xs) => xs.filter((x) => x.id !== id));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Every dot is a day.</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Countdowns
          </h1>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> New countdown
        </Button>
      </div>

      {hydrated && list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-12 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-primary">
            <Timer className="h-5 w-5" />
          </div>
          <h2 className="font-display text-lg text-foreground">
            No countdowns yet
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a deadline — an exam, holiday, or job application — and start filling in the days.
          </p>
          <Button className="mt-4" onClick={() => setCreating(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Create your first countdown
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {list.map((c) => (
            <CountdownCard
              key={c.id}
              countdown={c}
              onChange={update}
              onDelete={() => remove(c.id)}
            />
          ))}
        </div>
      )}

      <CountdownForm
        open={creating}
        onOpenChange={setCreating}
        onCreate={(c) => setList((xs) => [c, ...xs])}
      />
    </div>
  );
}
