import { create } from "zustand";

type CountdownState = {
  totalMs: number;
  endsAt: number | null;
  remainingMs: number;
  running: boolean;
  finished: boolean;

  set: (minutes: number) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  onFinish?: () => void;
  setOnFinish: (cb: () => void) => void;
};

export const useCountdown = create<CountdownState>((set, get) => ({
  totalMs: 25 * 60 * 1000,
  endsAt: null,
  remainingMs: 25 * 60 * 1000,
  running: false,
  finished: false,

  set: (minutes) => {
    const ms = Math.max(1, minutes) * 60 * 1000;
    set({ totalMs: ms, remainingMs: ms, running: false, endsAt: null, finished: false });
  },
  start: () => {
    const s = get();
    if (s.running) return;
    const remaining = s.remainingMs > 0 ? s.remainingMs : s.totalMs;
    set({ running: true, endsAt: Date.now() + remaining, remainingMs: remaining, finished: false });
  },
  pause: () => {
    const s = get();
    if (!s.running || s.endsAt == null) return;
    set({ running: false, endsAt: null, remainingMs: Math.max(0, s.endsAt - Date.now()) });
  },
  reset: () => {
    const s = get();
    set({ running: false, endsAt: null, remainingMs: s.totalMs, finished: false });
  },
  tick: () => {
    const s = get();
    if (!s.running || s.endsAt == null) return;
    if (Date.now() >= s.endsAt) {
      set({ running: false, endsAt: null, remainingMs: 0, finished: true });
      s.onFinish?.();
    }
  },
  setOnFinish: (cb) => set({ onFinish: cb }),
}));
