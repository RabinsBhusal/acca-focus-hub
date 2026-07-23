import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { deleteExam, upsertExam, type ExamTopic } from "@/lib/exams.functions";
import { daysUntil } from "@/lib/calendar";

export type ExamRow = {
  id: string;
  title: string;
  exam_date: string;
  topics: ExamTopic[] | unknown;
  notes: string | null;
};

function normalizeTopics(t: unknown): ExamTopic[] {
  if (!Array.isArray(t)) return [];
  return t
    .filter(
      (x): x is ExamTopic =>
        !!x && typeof x === "object" && "name" in x && "progress" in x,
    )
    .map((x) => ({ name: String(x.name), progress: Number(x.progress) || 0 }));
}

export function ExamCard({ exam, onEdit }: { exam: ExamRow; onEdit: () => void }) {
  const qc = useQueryClient();
  const save = useServerFn(upsertExam);
  const del = useServerFn(deleteExam);
  const topics = normalizeTopics(exam.topics);
  const [local, setLocal] = useState<ExamTopic[]>(topics);
  const [adding, setAdding] = useState("");

  const days = daysUntil(exam.exam_date);
  const overall = local.length
    ? Math.round(local.reduce((s, t) => s + t.progress, 0) / local.length)
    : 0;

  const saveMut = useMutation({
    mutationFn: (next: ExamTopic[]) =>
      save({
        data: {
          id: exam.id,
          title: exam.title,
          exam_date: exam.exam_date,
          topics: next,
          notes: exam.notes,
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exams"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: () => del({ data: { id: exam.id } }),
    onSuccess: () => {
      toast.success("Exam removed");
      qc.invalidateQueries({ queryKey: ["exams"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function updateTopic(i: number, progress: number) {
    const next = local.map((t, idx) => (idx === i ? { ...t, progress } : t));
    setLocal(next);
    saveMut.mutate(next);
  }

  function removeTopic(i: number) {
    const next = local.filter((_, idx) => idx !== i);
    setLocal(next);
    saveMut.mutate(next);
  }

  function addTopic() {
    const name = adding.trim();
    if (!name) return;
    const next = [...local, { name, progress: 0 }];
    setLocal(next);
    setAdding("");
    saveMut.mutate(next);
  }

  const daysLabel =
    days > 0 ? `${days} days remaining` : days === 0 ? "Today" : `${Math.abs(days)} days ago`;
  const dateLabel = new Date(exam.exam_date + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-red-400/90">
            Exam
          </div>
          <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
            {exam.title}
          </h3>
          <div className="text-xs text-muted-foreground">{dateLabel}</div>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl font-semibold tracking-tight text-foreground">
            {days >= 0 ? days : 0}
          </div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {daysLabel}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Overall progress</span>
          <span className="font-medium text-foreground">{overall}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${overall}%` }}
          />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {local.map((t, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-28 shrink-0 truncate text-xs text-foreground">{t.name}</div>
            <input
              type="range"
              min={0}
              max={100}
              value={t.progress}
              onChange={(e) => updateTopic(i, Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <div className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
              {t.progress}%
            </div>
            <button
              onClick={() => removeTopic(i)}
              className="text-muted-foreground/60 hover:text-destructive"
              aria-label="Remove topic"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1">
          <input
            value={adding}
            onChange={(e) => setAdding(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTopic()}
            placeholder="Add topic (e.g. IHT)"
            className="flex-1 rounded-md border border-border/60 bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
          />
          <button
            onClick={addTopic}
            className="inline-flex items-center gap-1 rounded-md bg-primary/20 px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/30"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 border-t border-border/40 pt-3">
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
        <button
          onClick={() => delMut.mutate()}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}
