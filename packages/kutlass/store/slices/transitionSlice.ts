import { nanoid } from "nanoid";
import { Transition } from "@/types/editor";

export interface TransitionState {
  transitions: Transition[];
}

export interface TransitionActions {
  addTransition: (clipAId: string, clipBId: string, duration?: number) => string | null;
  removeTransition: (id: string) => void;
  updateTransitionDuration: (id: string, duration: number) => void;
}

export const createTransitionSlice = (
  set: (fn: (state: Record<string, unknown>) => Partial<Record<string, unknown>>) => void,
  get: () => Record<string, unknown>
): TransitionState & TransitionActions => ({
  transitions: [],

  addTransition: (clipAId, clipBId, duration = 0.3) => {
    const state = get();
    const transitions = state.transitions as Transition[];
    const exists = transitions.some(
      (t) => t.clipAId === clipAId && t.clipBId === clipBId
    );
    if (exists) return null;

    const id = nanoid();
    set((state) => ({
      transitions: [
        ...((state.transitions as Transition[]) ?? []),
        { id, type: "crossfade" as const, duration, clipAId, clipBId },
      ],
    }));
    return id;
  },

  removeTransition: (id) =>
    set((state) => ({
      transitions: ((state.transitions as Transition[]) ?? []).filter((t) => t.id !== id),
    })),

  updateTransitionDuration: (id, duration) =>
    set((state) => ({
      transitions: ((state.transitions as Transition[]) ?? []).map((t) =>
        t.id === id ? { ...t, duration: Math.max(0.05, Math.min(1, duration)) } : t
      ),
    })),
});
