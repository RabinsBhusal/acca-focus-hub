import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { DayEntry, DayStatus } from "@/lib/countdowns";

const STATUSES: { value: DayStatus; label: string; emoji: string; cls: string }[] = [
  { value: "productive", label: "Productive", emoji: "✅", cls: "border-primary/60 bg-primary/15 text-foreground" },
  { value: "average", label: "Average", emoji: "🟡", cls: "border-amber-500/50 bg-amber-500/10 text-foreground" },
  { value: "missed", label: "Missed", emoji: "🔴", cls: "border-destructive/50 bg-destructive/10 text-foreground" },
];

export function DayModal({
  open,
  onOpenChange,
  dateKey,
  dayNumber,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  dateKey: string | null;
  dayNumber: number;
  initial: DayEntry | undefined;
  onSave: (entry: DayEntry) => void;
}) {
  const [status, setStatus] = useState<DayStatus>(null);
  const [hours, setHours] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [topics, setTopics] = useState("");

  useEffect(() => {
    if (open) {
      setStatus(initial?.status ?? null);
      setHours(initial?.hours != null ? String(initial.hours) : "");
      setNotes(initial?.notes ?? "");
      setTopics(initial?.topics ?? "");
    }
  }, [open, initial]);

  if (!dateKey) return null;
  const pretty = new Date(dateKey).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Day {dayNumber}</DialogTitle>
          <p className="text-xs text-muted-foreground">{pretty}</p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
              Status
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setStatus(status === s.value ? null : s.value)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    status === s.value
                      ? s.cls
                      : "border-border/60 bg-card text-muted-foreground hover:border-border"
                  }`}
                >
                  <div className="text-base">{s.emoji}</div>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="hours" className="text-xs uppercase tracking-wider text-muted-foreground">
                Study hours
              </Label>
              <Input
                id="hours"
                type="number"
                min="0"
                step="0.25"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="topics" className="text-xs uppercase tracking-wider text-muted-foreground">
                Topics
              </Label>
              <Input
                id="topics"
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                placeholder="IHT, CGT…"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-xs uppercase tracking-wider text-muted-foreground">
              Notes
            </Label>
            <Textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you work on?"
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              onSave({ status: null, hours: undefined, notes: "", topics: "" });
              onOpenChange(false);
            }}
          >
            Clear
          </Button>
          <Button
            onClick={() => {
              onSave({
                status,
                hours: hours ? Number(hours) : undefined,
                notes: notes.trim() || undefined,
                topics: topics.trim() || undefined,
              });
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
