export interface TrimScrub {
    clipId: string;
    sourceTime: number;
}
export interface PlaybackState {
    isPlaying: boolean;
    fps: number;
    playbackRate: number;
    trimScrub: TrimScrub | null;
}
export interface PlaybackActions {
    setPlaying: (playing: boolean) => void;
    togglePlay: () => void;
    setFps: (fps: number) => void;
    setPlaybackRate: (rate: number) => void;
    setTrimScrub: (scrub: TrimScrub | null) => void;
}
export declare const createPlaybackSlice: (set: (fn: (state: PlaybackState & PlaybackActions) => Partial<PlaybackState & PlaybackActions>) => void) => PlaybackState & PlaybackActions;
//# sourceMappingURL=playbackSlice.d.ts.map