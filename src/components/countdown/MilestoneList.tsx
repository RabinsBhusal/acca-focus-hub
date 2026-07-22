import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import type { Milestone } from "@/lib/countdowns";
import { uid } from "@/lib/countdowns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function MilestoneList({
  milestones,
  onChange,
}: {
  milestones: Milestone[];
  onChange: (list: Milestone[]) => void;
}) {
  const [label, setLabel] = useState("");

  const add = () => {
    if (!label.trim()) return;
    onChange([...milestones, { id: uid(), label: label.trim(), done: false }]);
    setLabel("");
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {milestones.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() =>
              onChange(
                milestones.map((x) => (x.id === m.id ? { ...x, done: !x.done } : x)),
              )
            }
            className={`group flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all ${
              m.done
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-border/60 bg-card text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2 truncate">
              <span
                className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${
                  m.done ? "border-primary bg-primary text-primary-foreground" : "border-border"
                }`}
              >
                {m.done && <Check className="h-3 w-3" />}
              </span>
              <span className="truncate">{m.label}</span>
            </span>
            <X
              className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onChange(milestones.filter((x) => x.id !== m.id));
              }}
            />
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="Add milestone (e.g. Corporation Tax)"
        />
        <Button type="button" variant="secondary" onClick={add}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
