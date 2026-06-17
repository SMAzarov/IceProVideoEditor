import { DEFAULT_EFFECTS, EffectParams } from "@/types/editor";

export interface EffectsState {
  clipEffects: Record<string, EffectParams>;
  // true while the crop tool is active — preview renders the full frame so
  // handles are positioned in source-frame space, not cropped-frame space.
  cropToolActive: boolean;
}

export interface EffectsActions {
  setClipEffect: (clipId: string, key: keyof EffectParams, value: number) => void;
  setClipEffects: (clipId: string, effects: Partial<EffectParams>) => void;
  resetClipEffects: (clipId: string) => void;
  getClipEffects: (clipId: string) => EffectParams;
  setCropToolActive: (active: boolean) => void;
}

export const createEffectsSlice = (
  set: (fn: (state: EffectsState & EffectsActions) => Partial<EffectsState & EffectsActions>) => void,
  get: () => EffectsState & EffectsActions
): EffectsState & EffectsActions => ({
  clipEffects: {},
  cropToolActive: false,

  setClipEffect: (clipId, key, value) =>
    set((state) => ({
      clipEffects: {
        ...state.clipEffects,
        [clipId]: {
          ...(state.clipEffects[clipId] ?? DEFAULT_EFFECTS),
          [key]: value,
        },
      },
    })),

  setClipEffects: (clipId, effects) =>
    set((state) => ({
      clipEffects: {
        ...state.clipEffects,
        [clipId]: {
          ...(state.clipEffects[clipId] ?? DEFAULT_EFFECTS),
          ...effects,
        },
      },
    })),

  resetClipEffects: (clipId) =>
    set((state) => {
      const next = { ...state.clipEffects };
      delete next[clipId];
      return { clipEffects: next };
    }),

  getClipEffects: (clipId) => {
    const state = get();
    return state.clipEffects[clipId] ?? DEFAULT_EFFECTS;
  },

  setCropToolActive: (active) => set(() => ({ cropToolActive: active })),
});
