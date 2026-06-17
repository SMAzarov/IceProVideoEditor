import { FreezeSegment } from "@/types/editor";
export interface FreezeState {
    freezes: FreezeSegment[];
}
export interface FreezeActions {
    addFreeze: (startTime: number, endTime: number) => string;
    removeFreeze: (id: string) => void;
    clearFreezes: () => void;
}
export declare const createFreezeSlice: (set: (fn: (state: FreezeState & FreezeActions) => Partial<FreezeState & FreezeActions>) => void) => FreezeState & FreezeActions;
//# sourceMappingURL=freezeSlice.d.ts.map