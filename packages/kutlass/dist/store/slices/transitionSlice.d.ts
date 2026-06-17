import { Transition } from "@/types/editor";
export interface TransitionState {
    transitions: Transition[];
}
export interface TransitionActions {
    addTransition: (clipAId: string, clipBId: string, duration?: number) => string | null;
    removeTransition: (id: string) => void;
    updateTransitionDuration: (id: string, duration: number) => void;
}
export declare const createTransitionSlice: (set: (fn: (state: Record<string, unknown>) => Partial<Record<string, unknown>>) => void, get: () => Record<string, unknown>) => TransitionState & TransitionActions;
//# sourceMappingURL=transitionSlice.d.ts.map