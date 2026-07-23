import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { X } from "lucide-react";
import { upsertExam } from "@/lib/exams.functions";
import type { ExamRow } from "./ExamCard";

export function ExamForm({
  open,
  onClose,
  exam,
}: {
  open: boolean;
  onClose: () => void;
  exam: ExamRow | null;
}) {
  const qc = useQueryClient();
  const save = useServerFn(upsertExam);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(exam?.title ?? "");
    setDate(exam?.exam_date ?? new Date().toISOString().slice(0, 10));
    setNotes(exam?.notes ?? "");
  }, [open, exam]);

  const mut = useMutation({
    mutationFn: () =>
      save({
        data: {
          id: exam?.id,
          title: title.trim(),
          exam_date: date,
          topics: Array.isArray(exam?.topics)
            ? (exam!.topics as { name: string; progress: number }[])
            : [],
          notes: notes.trim() || null,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exams"] });
      toast.success(exam ? "Exam updated" : "Exam added");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border/60 bg-card p-5 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {exam ? "Edit exam" : "New exam"}
          </h2>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. ACCA ATX"
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Notes"
            className="w-full resize-none rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!title.trim() || !date) {
                toast.error("Title and date are required");
                return;
              }
              mut.mutate();
            }}
            disabled={mut.isPending}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {mut.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
