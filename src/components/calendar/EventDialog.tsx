import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { X, Trash2 } from "lucide-react";
import { CATEGORIES, deleteEvent, upsertEvent, type Category } from "@/lib/calendar.functions";
import { CATEGORY_META, type CalendarEvent } from "@/lib/calendar";

type Draft = {
  id?: string;
  title: string;
  category: Category;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration_minutes: number | null;
  all_day: boolean;
  priority: number | null;
  notes: string;
  completed: boolean;
};

function eventToDraft(e: CalendarEvent | null, prefill?: Date): Draft {
  if (e) {
    const d = new Date(e.start_at);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return {
      id: e.id,
      title: e.title,
      category: (e.category as Category) ?? "task",
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
      duration_minutes: e.duration_minutes,
      all_day: e.all_day,
      priority: e.priority,
      notes: e.notes ?? "",
      completed: e.completed,
    };
  }
  const base = prefill ?? new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return {
    title: "",
    category: "task",
    date: `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}`,
    time: "09:00",
    duration_minutes: 60,
    all_day: false,
    priority: null,
    notes: "",
    completed: false,
  };
}

export function EventDialog({
  open,
  onClose,
  event,
  prefillDate,
}: {
  open: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  prefillDate?: Date;
}) {
  const [draft, setDraft] = useState<Draft>(() => eventToDraft(event, prefillDate));
  const qc = useQueryClient();
  const save = useServerFn(upsertEvent);
  const del = useServerFn(deleteEvent);

  useEffect(() => {
    if (open) setDraft(eventToDraft(event, prefillDate));
  }, [open, event, prefillDate]);

  type SavePayload = {
    id?: string;
    title: string;
    category: Category;
    start_at: string;
    duration_minutes: number | null;
    all_day: boolean;
    priority: number | null;
    notes: string | null;
    completed: boolean;
  };

  const saveMut = useMutation({
    mutationFn: (input: SavePayload) => save({ data: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success(event ? "Event updated" : "Event added");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Event deleted");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!open) return null;

  function submit() {
    if (!draft.title.trim()) {
      toast.error("Give it a title");
      return;
    }
    const start = new Date(`${draft.date}T${draft.all_day ? "00:00" : draft.time}:00`);
    saveMut.mutate({
      id: draft.id,
      title: draft.title.trim(),
      category: draft.category,
      start_at: start.toISOString(),
      duration_minutes: draft.all_day ? null : draft.duration_minutes,
      all_day: draft.all_day,
      priority: draft.priority,
      notes: draft.notes.trim() || null,
      completed: draft.completed,
    });
  }

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
            {event ? "Edit event" : "New event"}
          </h2>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            autoFocus
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Title"
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />

          <div>
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Category
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.map((c) => {
                const meta = CATEGORY_META[c];
                const active = draft.category === c;
                return (
                  <button
                    key={c}
                    onClick={() => setDraft({ ...draft, category: c })}
                    className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? `${meta.border} ${meta.bg} ${meta.color}`
                        : "border-border/60 bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.ring}`} />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Date
              </div>
              <input
                type="date"
                value={draft.date}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Time
              </div>
              <input
                type="time"
                value={draft.time}
                disabled={draft.all_day}
                onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary disabled:opacity-40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Duration (min)
              </div>
              <input
                type="number"
                min={0}
                value={draft.duration_minutes ?? ""}
                disabled={draft.all_day}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    duration_minutes: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary disabled:opacity-40"
              />
            </div>
            <div>
              <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Priority
              </div>
              <select
                value={draft.priority ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, priority: e.target.value ? Number(e.target.value) : null })
                }
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="">—</option>
                <option value="1">Low</option>
                <option value="2">Medium</option>
                <option value="3">High</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={draft.all_day}
              onChange={(e) => setDraft({ ...draft, all_day: e.target.checked })}
              className="h-4 w-4 rounded border-border/60 bg-background"
            />
            All day
          </label>

          <textarea
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            rows={3}
            placeholder="Notes"
            className="w-full resize-none rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />

          {event && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={draft.completed}
                onChange={(e) => setDraft({ ...draft, completed: e.target.checked })}
                className="h-4 w-4 rounded border-border/60 bg-background"
              />
              Mark completed
            </label>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          {event ? (
            <button
              onClick={() => draft.id && delMut.mutate(draft.id)}
              disabled={delMut.isPending}
              className="inline-flex items-center gap-1 rounded-md border border-destructive/40 px-2.5 py-1.5 text-xs font-medium text-destructive/90 hover:bg-destructive/10 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={saveMut.isPending}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {saveMut.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
