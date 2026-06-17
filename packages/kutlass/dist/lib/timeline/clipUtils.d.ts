import { Clip } from "@/types/editor";
/** Check if two clips overlap on the same track */
export declare function clipsOverlap(a: Clip, b: Clip): boolean;
/** Find clips at a given time on a given track */
export declare function getClipsAtTime(clips: Clip[], time: number, trackId?: string): Clip[];
/** Get the active clip at a given time (first match) */
export declare function getActiveClip(clips: Clip[], time: number): Clip | null;
/** Snap a time value to the nearest clip edge or second boundary */
export declare function snapTime(time: number, clips: Clip[], snapRadius: number, excludeId?: string): number;
//# sourceMappingURL=clipUtils.d.ts.map