import { Clip, EffectParams, Overlay } from "@/types/editor";

interface HistorySnapshot {
  clips: Clip[];
  duration: number;
  clipEffects: Record<string, EffectParams>;
  overlays: Overlay[];
}

export interface HistoryState {
  past: HistorySnapshot[];
  future: HistorySnapshot[];
}

export interface HistoryActions {
  captureHistory: () => void;
  undo: () => void;
  redo: () => void;
}

type SliceContext = HistoryState &
  HistoryActions &
  HistorySnapshot;

export const createHistorySlice = (
  set: (fn: (state: SliceContext) => Partial<SliceContext>) => void,
  get: () => SliceContext
): HistoryState & HistoryActions => ({
  past: [],
  future: [],

  captureHistory: () => {
    const s = get();
    const snapshot: HistorySnapshot = {
      clips: s.clips,
      duration: s.duration,
      clipEffects: s.clipEffects,
      overlays: s.overlays,
    };
    set(() => ({ past: [...s.past.slice(-49), snapshot], future: [] }));
  },

  undo: () =>
    set((state) => {
      if (state.past.length === 0) return {};
      const entry = state.past[state.past.length - 1];
      const current: HistorySnapshot = {
        clips: state.clips,
        duration: state.duration,
        clipEffects: state.clipEffects,
        overlays: state.overlays,
      };
      return {
        past: state.past.slice(0, -1),
        future: [current, ...state.future],
        ...entry,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return {};
      const entry = state.future[0];
      const current: HistorySnapshot = {
        clips: state.clips,
        duration: state.duration,
        clipEffects: state.clipEffects,
        overlays: state.overlays,
      };
      return {
        past: [...state.past, current],
        future: state.future.slice(1),
        ...entry,
      };
    }),
});
