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
type SliceContext = HistoryState & HistoryActions & HistorySnapshot;
export declare const createHistorySlice: (set: (fn: (state: SliceContext) => Partial<SliceContext>) => void, get: () => SliceContext) => HistoryState & HistoryActions;
export {};
//# sourceMappingURL=historySlice.d.ts.map