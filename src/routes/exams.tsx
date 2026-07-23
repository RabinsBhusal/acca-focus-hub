import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { examsQueryOptions } from "@/lib/queries";
import { ExamCard, type ExamRow } from "@/components/exam/ExamCard";
import { ExamForm } from "@/components/exam/ExamForm";

export const Route = createFileRoute("/exams")({
  head: () => ({
    meta: [
      { title: "Exams — ACCA Study Tracker" },
      {
        name: "description",
        content: "Track ACCA exam countdowns and topic-by-topic progress.",
      },
      { property: "og:title", content: "Exams — ACCA Study Tracker" },
      {
        property: "og:description",
        content: "Track ACCA exam countdowns and topic-by-topic progress.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(examsQueryOptions),
  component: ExamsPage,
});

function ExamsPage() {
  const { data } = useSuspenseQuery(examsQueryOptions);
  const exams = data as unknown as ExamRow[];
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExamRow | null>(null);

  function openNew() {
    setEditing(null);
    setOpen(true);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Exams
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Countdown to each exam, with topic-by-topic progress.
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> New exam
        </button>
      </div>

      {exams.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">No exams yet.</p>
          <button
            onClick={openNew}
            className="mt-4 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
          >
            Add your first exam
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {exams.map((e) => (
            <ExamCard
              key={e.id}
              exam={e}
              onEdit={() => {
                setEditing(e);
                setOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <ExamForm open={open} onClose={() => setOpen(false)} exam={editing} />
    </div>
  );
}
