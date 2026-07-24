import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PomodoroPhase = "work" | "shortBreak" | "longBreak";

type PomodoroState = {
  // settings (minutes)
  workMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  longEvery: number; // long break every N work cycles

  // runtime
  phase: PomodoroPhase;
  running: boolean;
  endsAt: number | null; // epoch ms when current phase ends
  remainingMs: number; // when paused
  completedWorkCycles: number; // work phases completed this session

  // actions
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  tick: () => void; // called by UI to check if phase is over
  setSettings: (s: Partial<Pick<PomodoroState, "workMin" | "shortBreakMin" | "longBreakMin" | "longEvery">>) => void;
  onPhaseComplete?: (finished: PomodoroPhase, next: PomodoroPhase) => void;
  setOnPhaseComplete: (cb: PomodoroState["onPhaseComplete"]) => void;
};

function phaseDurationMs(state: PomodoroState, phase: PomodoroPhase): number {
  const m =
    phase === "work"
      ? state.workMin
      : phase === "shortBreak"
        ? state.shortBreakMin
        : state.longBreakMin;
  return m * 60 * 1000;
}

function nextPhase(state: PomodoroState, finished: PomodoroPhase): PomodoroPhase {
  if (finished !== "work") return "work";
  const done = state.completedWorkCycles + 1;
  return done % state.longEvery === 0 ? "longBreak" : "shortBreak";
}

export const usePomodoro = create<PomodoroState>()(
  persist(
    (set, get) => ({
      workMin: 25,
      shortBreakMin: 5,
      longBreakMin: 15,
      longEvery: 4,
      phase: "work",
      running: false,
      endsAt: null,
      remainingMs: 25 * 60 * 1000,
      completedWorkCycles: 0,

      start: () => {
        const s = get();
        if (s.running) return;
        const remaining = s.remainingMs > 0 ? s.remainingMs : phaseDurationMs(s, s.phase);
        set({ running: true, endsAt: Date.now() + remaining, remainingMs: remaining });
      },
      pause: () => {
        const s = get();
        if (!s.running || s.endsAt == null) return;
        const remainingMs = Math.max(0, s.endsAt - Date.now());
        set({ running: false, endsAt: null, remainingMs });
      },
      reset: () => {
        const s = get();
        set({
          running: false,
          endsAt: null,
          remainingMs: phaseDurationMs(s, s.phase),
        });
      },
      skip: () => {
        const s = get();
        const next = nextPhase(s, s.phase);
        const completed = s.phase === "work" ? s.completedWorkCycles + 1 : s.completedWorkCycles;
        set({
          phase: next,
          completedWorkCycles: completed,
          running: false,
          endsAt: null,
          remainingMs: phaseDurationMs({ ...s, phase: next }, next),
        });
        s.onPhaseComplete?.(s.phase, next);
      },
      tick: () => {
        const s = get();
        if (!s.running || s.endsAt == null) return;
        if (Date.now() >= s.endsAt) {
          const finished = s.phase;
          const next = nextPhase(s, finished);
          const completed = finished === "work" ? s.completedWorkCycles + 1 : s.completedWorkCycles;
          set({
            phase: next,
            completedWorkCycles: completed,
            running: false,
            endsAt: null,
            remainingMs: phaseDurationMs({ ...s, phase: next }, next),
          });
          s.onPhaseComplete?.(finished, next);
        }
      },
      setSettings: (patch) => {
        const s = get();
        const nextState = { ...s, ...patch };
        set({
          ...patch,
          remainingMs: s.running ? s.remainingMs : phaseDurationMs(nextState, s.phase),
        });
      },
      setOnPhaseComplete: (cb) => set({ onPhaseComplete: cb }),
    }),
    {
      name: "pomodoro-state",
      partialize: (s) => ({
        workMin: s.workMin,
        shortBreakMin: s.shortBreakMin,
        longBreakMin: s.longBreakMin,
        longEvery: s.longEvery,
        phase: s.phase,
        completedWorkCycles: s.completedWorkCycles,
        // don't persist running/endsAt — always resume paused after reload
      }),
    },
  ),
);

export function displayRemaining(state: PomodoroState): number {
  if (state.running && state.endsAt != null) {
    return Math.max(0, state.endsAt - Date.now());
  }
  return state.remainingMs;
}

export function fmtMs(ms: number) {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
}
