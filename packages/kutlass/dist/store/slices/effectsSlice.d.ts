import { EffectParams } from "@/types/editor";
export interface EffectsState {
    clipEffects: Record<string, EffectParams>;
    cropToolActive: boolean;
}
export interface EffectsActions {
    setClipEffect: (clipId: string, key: keyof EffectParams, value: number) => void;
    setClipEffects: (clipId: string, effects: Partial<EffectParams>) => void;
    resetClipEffects: (clipId: string) => void;
    getClipEffects: (clipId: string) => EffectParams;
    setCropToolActive: (active: boolean) => void;
}
export declare const createEffectsSlice: (set: (fn: (state: EffectsState & EffectsActions) => Partial<EffectsState & EffectsActions>) => void, get: () => EffectsState & EffectsActions) => EffectsState & EffectsActions;
//# sourceMappingURL=effectsSlice.d.ts.map