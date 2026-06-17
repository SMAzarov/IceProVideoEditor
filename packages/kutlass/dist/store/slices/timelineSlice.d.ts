import { Clip, Track } from "@/types/editor";
export interface TimelineState {
    clips: Clip[];
    tracks: Track[];
    currentTime: number;
    duration: number;
    zoom: number;
    selectedClipId: string | null;
}
export interface TimelineActions {
    addClip: (clip: Omit<Clip, "id">) => void;
    removeClip: (id: string) => void;
    updateClip: (id: string, updates: Partial<Clip>) => void;
    moveClip: (id: string, startTime: number) => void;
    trimClipStart: (id: string, newTrimIn: number, newStartTime: number, newDuration: number) => void;
    trimClipEnd: (id: string, newTrimOut: number, newDuration: number) => void;
    splitClipAt: (id: string, time: number) => void;
    setCurrentTime: (time: number) => void;
    setZoom: (zoom: number) => void;
    setSelectedClip: (id: string | null) => void;
    recomputeDuration: () => void;
}
export declare const createTimelineSlice: (set: (fn: (state: TimelineState & TimelineActions) => Partial<TimelineState & TimelineActions>) => void, get: () => TimelineState & TimelineActions) => TimelineState & TimelineActions;
//# sourceMappingURL=timelineSlice.d.ts.map