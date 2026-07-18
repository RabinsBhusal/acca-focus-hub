import type { SessionRow } from "@/lib/stats";
import { formatDuration } from "@/lib/stats";
import { Star } from "lucide-react";

function relativeDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffDay === 0) return `Today · ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function SessionCard({ session }: { session: SessionRow }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-4 transition-colors hover:border-border">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
              {session.subject}
            </span>
            <span className="truncate text-sm text-foreground">
              {session.topic || "Untitled topic"}
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {relativeDate(session.date)} · {formatDuration(session.duration_minutes)}
          </div>
        </div>
        {session.difficulty != null && (
          <div className="flex shrink-0 items-center gap-0.5 text-amber-400/90">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < (session.difficulty ?? 0) ? "fill-current" : "opacity-25"
                }`}
              />
            ))}
          </div>
        )}
      </div>
      {(session.notes || session.learning_summary) && (
        <div className="mt-3 space-y-1.5 border-t border-border/40 pt-3 text-xs text-muted-foreground">
          {session.learning_summary && (
            <p><span className="text-foreground/80">Learned:</span> {session.learning_summary}</p>
          )}
          {session.notes && (
            <p><span className="text-foreground/80">Notes:</span> {session.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}
