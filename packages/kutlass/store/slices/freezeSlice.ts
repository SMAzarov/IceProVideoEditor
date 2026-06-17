import { nanoid } from "nanoid";
import { FreezeSegment } from "@/types/editor";

export interface FreezeState {
  freezes: FreezeSegment[];
}

export interface FreezeActions {
  addFreeze: (startTime: number, endTime: number) => string;
  removeFreeze: (id: string) => void;
  clearFreezes: () => void;
}

export const createFreezeSlice = (
  set: (fn: (state: FreezeState & FreezeActions) => Partial<FreezeState & FreezeActions>) => void
): FreezeState & FreezeActions => ({
  freezes: [],

  addFreeze: (startTime, endTime) => {
    const id = nanoid();
    set((state) => ({
      freezes: [...state.freezes, { id, startTime, endTime }],
    }));
    return id;
  },

  removeFreeze: (id) =>
    set((state) => ({
      freezes: state.freezes.filter((f) => f.id !== id),
    })),

  clearFreezes: () => set(() => ({ freezes: [] })),
});
