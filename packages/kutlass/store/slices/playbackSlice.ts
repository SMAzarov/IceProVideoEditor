export interface TrimScrub {
  clipId: string;
  sourceTime: number; // 0..sourceDuration — position in the raw source file
}

export interface PlaybackState {
  isPlaying: boolean;
  fps: number;
  playbackRate: number;
  muted: boolean;
  trimScrub: TrimScrub | null; // set by TrimPanel while scrubbing; null = use normal currentTime
}

export interface PlaybackActions {
  setPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  setFps: (fps: number) => void;
  setPlaybackRate: (rate: number) => void;
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
  setTrimScrub: (scrub: TrimScrub | null) => void;
}

export const createPlaybackSlice = (
  set: (fn: (state: PlaybackState & PlaybackActions) => Partial<PlaybackState & PlaybackActions>) => void
): PlaybackState & PlaybackActions => ({
  isPlaying: false,
  fps: 30,
  playbackRate: 1,
  muted: true,
  trimScrub: null,

  setPlaying: (playing) => set(() => ({ isPlaying: playing })),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setFps: (fps) => set(() => ({ fps })),
  setPlaybackRate: (rate) => set(() => ({ playbackRate: rate })),
  setMuted: (muted) => set(() => ({ muted })),
  toggleMuted: () => set((state) => ({ muted: !state.muted })),
  setTrimScrub: (scrub) => set(() => ({ trimScrub: scrub })),
});
