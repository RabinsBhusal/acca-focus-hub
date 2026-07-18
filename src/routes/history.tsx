import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { SessionCard } from "@/components/SessionCard";
import { sessionsQueryOptions } from "@/lib/queries";

export const Route = createFileRoute("/history")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(sessionsQueryOptions);
  },
  component: HistoryPage,
});

function HistoryPage() {
  const { data: sessions } = useSuspenseQuery(sessionsQueryOptions);
  const [subject, setSubject] = useState<string>("All");
  const [sortDesc, setSortDesc] = useState(true);

  const subjects = useMemo(() => {
    const set = new Set(sessions.map((s) => s.subject));
    return ["All", ...Array.from(set)];
  }, [sessions]);

  const filtered = useMemo(() => {
    const list = sessions.filter((s) => subject === "All" || s.subject === subject);
    list.sort((a, b) =>
      sortDesc
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    return list;
  }, [sessions, subject, sortDesc]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          History
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {sessions.length} session{sessions.length === 1 ? "" : "s"} logged
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                subject === s
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border/60 bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSortDesc((v) => !v)}
          className="ml-auto flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {sortDesc ? <ArrowDownAZ className="h-3.5 w-3.5" /> : <ArrowUpAZ className="h-3.5 w-3.5" />}
          {sortDesc ? "Newest" : "Oldest"}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">No sessions match this filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  );
}
