import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Countdown } from "@/lib/countdowns";
import { toDateKey, uid } from "@/lib/countdowns";

export function CountdownForm({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (c: Countdown) => void;
}) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(toDateKey(new Date()));
  const [deadline, setDeadline] = useState("");
  const [studyHoursGoal, setStudyHoursGoal] = useState("");
  const [topicsGoal, setTopicsGoal] = useState("");
  const [mockExamsGoal, setMockExamsGoal] = useState("");

  const reset = () => {
    setTitle("");
    setStartDate(toDateKey(new Date()));
    setDeadline("");
    setStudyHoursGoal("");
    setTopicsGoal("");
    setMockExamsGoal("");
  };

  const submit = () => {
    if (!title.trim() || !deadline) return;
    onCreate({
      id: uid(),
      title: title.trim(),
      startDate,
      deadline,
      studyHoursGoal: studyHoursGoal ? Number(studyHoursGoal) : undefined,
      topicsGoal: topicsGoal ? Number(topicsGoal) : undefined,
      mockExamsGoal: mockExamsGoal ? Number(mockExamsGoal) : undefined,
      mockExamsDone: 0,
      milestones: [],
      days: {},
      createdAt: new Date().toISOString(),
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">New countdown</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ACCA ATX Exam"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start">Start</Label>
              <Input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="hoursGoal" className="text-xs">Hours goal</Label>
              <Input
                id="hoursGoal"
                type="number"
                min="0"
                value={studyHoursGoal}
                onChange={(e) => setStudyHoursGoal(e.target.value)}
                placeholder="150"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="topicsGoal" className="text-xs">Topics</Label>
              <Input
                id="topicsGoal"
                type="number"
                min="0"
                value={topicsGoal}
                onChange={(e) => setTopicsGoal(e.target.value)}
                placeholder="9"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="mocksGoal" className="text-xs">Mocks</Label>
              <Input
                id="mocksGoal"
                type="number"
                min="0"
                value={mockExamsGoal}
                onChange={(e) => setMockExamsGoal(e.target.value)}
                placeholder="5"
                className="mt-1"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!title.trim() || !deadline}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
