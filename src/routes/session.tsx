import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, Square, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { SUBJECTS, type Subject } from "@/lib/constants";
import { createSession } from "@/lib/sessions.functions";
import { upsertEvent } from "@/lib/calendar.functions";
import { StarRating } from "@/components/StarRating";
import { useAchievementEvaluator } from "@/hooks/useAchievementEvaluator";

export const Route = createFileRoute("/session")({
  component: SessionPage,
});

type Phase = "setup" | "running" | "feedback";

function fmt(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function SessionPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const createFn = useServerFn(createSession);
  const upsertEventFn = useServerFn(upsertEvent);
  const { check: checkAchievements } = useAchievementEvaluator();

  const [phase, setPhase] = useState<Phase>("setup");
  const [subject, setSubject] = useState<Subject>("ATX");
  const [customSubject, setCustomSubject] = useState("");
  const [topic, setTopic] = useState("");

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startRef = useRef<number | null>(null);
  const accRef = useRef(0);

  const [difficulty, setDifficulty] = useState(0);
  const [notes, setNotes] = useState("");
  const [learning, setLearning] = useState("");

  // ticking
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const now = Date.now();
      setElapsed(accRef.current + Math.floor((now - (startRef.current ?? now)) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, [running]);

  // warn on close during active session
  useEffect(() => {
    if (phase !== "running") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);

  const resolvedSubject = subject === "Other" ? customSubject.trim() || "Other" : subject;

  type NewSession = {
    subject: string;
    topic: string | null;
    duration_minutes: number;
    difficulty: number;
    notes: string | null;
    learning_summary: string | null;
  };

  const mutation = useMutation({
    mutationFn: async (input: NewSession) => {
      const row = await createFn({ data: input });
      // Auto-log to calendar
      try {
        const startIso = row?.date ?? new Date().toISOString();
        await upsertEventFn({
          data: {
            title: `${input.subject}${input.topic ? ` · ${input.topic}` : ""}`,
            category: "study",
            start_at: startIso,
            duration_minutes: input.duration_minutes,
            all_day: false,
            notes: input.learning_summary ?? input.notes ?? null,
            completed: true,
            session_id: row?.id,
          },
        });
      } catch (err) {
        console.warn("Calendar auto-log failed", err);
      }
      return row;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Session saved");
      void checkAchievements();
      navigate({ to: "/" });
    },
    onError: (err: Error) => toast.error(err.message ?? "Could not save session"),
  });

  function startSession() {
    if (subject === "Other" && !customSubject.trim()) {
      toast.error("Enter a subject name");
      return;
    }
    accRef.current = 0;
    startRef.current = Date.now();
    setElapsed(0);
    setRunning(true);
    setPhase("running");
  }

  function togglePause() {
    if (running) {
      accRef.current += Math.floor((Date.now() - (startRef.current ?? Date.now())) / 1000);
      setRunning(false);
    } else {
      startRef.current = Date.now();
      setRunning(true);
    }
  }

  function endSession() {
    if (running) {
      accRef.current += Math.floor((Date.now() - (startRef.current ?? Date.now())) / 1000);
      setRunning(false);
    }
    setPhase("feedback");
  }

  function submitFeedback() {
    if (difficulty < 1) {
      toast.error("Please rate the difficulty");
      return;
    }
    const minutes = Math.max(1, Math.round(elapsed / 60));
    mutation.mutate({
      subject: resolvedSubject,
      topic: topic.trim() || null,
      duration_minutes: minutes,
      difficulty,
      notes: notes.trim() || null,
      learning_summary: learning.trim() || null,
    });
  }

  return (
    <div className="mx-auto max-w-xl animate-in fade-in duration-500">
      <button
        onClick={() => (phase === "setup" ? router.history.back() : setPhase("setup"))}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {phase === "setup" && (
        <div className="space-y-6">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            New session
          </h1>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Subject
            </label>
            <div className="grid grid-cols-4 gap-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                    subject === s
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border/60 bg-card text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {subject === "Other" && (
              <input
                autoFocus
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="e.g. AFM, APM"
                className="mt-2 w-full rounded-lg border border-border/60 bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Topic / chapter
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Chapter 4: Corporate tax planning"
              className="w-full rounded-lg border border-border/60 bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          <button
            onClick={startSession}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-medium text-primary-foreground shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <Play className="h-5 w-5 fill-current" />
            Start Timer
          </button>
        </div>
      )}

      {phase === "running" && (
        <div className="space-y-8 text-center">
          <div>
            <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {resolvedSubject} {topic && `· ${topic}`}
            </div>
            <div
              className={`mt-6 font-display text-7xl font-semibold tabular-nums tracking-tight text-foreground sm:text-8xl ${
                running ? "" : "opacity-60"
              }`}
            >
              {fmt(elapsed)}
            </div>
            {!running && (
              <div className="mt-2 text-sm text-muted-foreground">Paused</div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={togglePause}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-border/60 bg-card text-foreground transition-colors hover:bg-secondary"
              aria-label={running ? "Pause" : "Resume"}
            >
              {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
            </button>
            <button
              onClick={endSession}
              className="flex items-center gap-2 rounded-full bg-destructive/90 px-5 py-3 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive"
            >
              <Square className="h-4 w-4 fill-current" />
              End Session
            </button>
          </div>
        </div>
      )}

      {phase === "feedback" && (
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              How did it go?
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {resolvedSubject} · {Math.max(1, Math.round(elapsed / 60))} minute
              {Math.max(1, Math.round(elapsed / 60)) === 1 ? "" : "s"}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Difficulty <span className="text-destructive">*</span>
            </label>
            <StarRating value={difficulty} onChange={setDifficulty} />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              What I learned
            </label>
            <textarea
              value={learning}
              onChange={(e) => setLearning(e.target.value)}
              rows={3}
              placeholder="Key takeaways..."
              className="w-full resize-none rounded-lg border border-border/60 bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Anything to remember..."
              className="w-full resize-none rounded-lg border border-border/60 bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          <button
            onClick={submitFeedback}
            disabled={mutation.isPending}
            className="w-full rounded-xl bg-primary py-3.5 font-medium text-primary-foreground shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {mutation.isPending ? "Saving..." : "Save Session"}
          </button>
        </div>
      )}
    </div>
  );
}
