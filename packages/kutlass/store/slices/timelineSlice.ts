import { nanoid } from "nanoid";
import { Clip, Track } from "@/types/editor";

export interface TimelineState {
  clips: Clip[];
  tracks: Track[];
  currentTime: number;
  duration: number;
  zoom: number; // pixels per second
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

const DEFAULT_TRACKS: Track[] = [
  { id: "track-video", type: "video", name: "Video", muted: false, locked: false },
  { id: "track-audio", type: "audio", name: "Audio", muted: false, locked: false },
  { id: "track-text", type: "text", name: "Text", muted: false, locked: false },
  { id: "track-effects", type: "effects", name: "Effects", muted: false, locked: false },
];

export const createTimelineSlice = (
  set: (fn: (state: TimelineState & TimelineActions) => Partial<TimelineState & TimelineActions>) => void,
  get: () => TimelineState & TimelineActions
): TimelineState & TimelineActions => ({
  clips: [],
  tracks: DEFAULT_TRACKS,
  currentTime: 0,
  duration: 0,
  zoom: 80,
  selectedClipId: null,

  addClip: (clip) =>
    set((state) => {
      const newClip: Clip = { ...clip, id: nanoid() };
      const newClips = [...state.clips, newClip];
      const duration = Math.max(...newClips.map((c) => c.startTime + c.duration), 0);
      return { clips: newClips, duration };
    }),

  removeClip: (id) =>
    set((state) => {
      const newClips = state.clips.filter((c) => c.id !== id);
      const duration = newClips.length > 0
        ? Math.max(...newClips.map((c) => c.startTime + c.duration))
        : 0;
      return { clips: newClips, duration, selectedClipId: state.selectedClipId === id ? null : state.selectedClipId };
    }),

  updateClip: (id, updates) =>
    set((state) => ({
      clips: state.clips.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  moveClip: (id, startTime) =>
    set((state) => {
      const newClips = state.clips.map((c) =>
        c.id === id ? { ...c, startTime: Math.max(0, startTime) } : c
      );
      const duration = Math.max(...newClips.map((c) => c.startTime + c.duration));
      return { clips: newClips, duration };
    }),

  trimClipStart: (id, newTrimIn, newStartTime, newDuration) =>
    set((state) => {
      const newClips = state.clips.map((c) =>
        c.id === id ? { ...c, trimIn: newTrimIn, startTime: newStartTime, duration: newDuration } : c
      );
      // Keep currentTime inside the updated clip range so playback stays valid
      const clip = newClips.find((c) => c.id === id);
      const currentTime = clip
        ? Math.max(clip.startTime, Math.min(state.currentTime, clip.startTime + clip.duration))
        : state.currentTime;
      return { clips: newClips, currentTime };
    }),

  trimClipEnd: (id, newTrimOut, newDuration) =>
    set((state) => {
      const newClips = state.clips.map((c) =>
        c.id === id ? { ...c, trimOut: newTrimOut, duration: newDuration } : c
      );
      const duration = Math.max(...newClips.map((c) => c.startTime + c.duration));
      // Keep currentTime inside the updated clip range
      const clip = newClips.find((c) => c.id === id);
      const currentTime = clip
        ? Math.max(clip.startTime, Math.min(state.currentTime, clip.startTime + clip.duration))
        : state.currentTime;
      return { clips: newClips, duration, currentTime };
    }),

  splitClipAt: (id, time) =>
    set((state) => {
      const clip = state.clips.find((c) => c.id === id);
      if (!clip) return {};
      const localTime = time - clip.startTime;
      if (localTime <= 0 || localTime >= clip.duration) return {};

      const firstHalf: Clip = {
        ...clip,
        duration: localTime,
        trimOut: clip.trimIn + localTime,
      };
      const secondHalf: Clip = {
        ...clip,
        id: nanoid(),
        startTime: time,
        duration: clip.duration - localTime,
        trimIn: clip.trimIn + localTime,
      };

      return {
        clips: state.clips.map((c) => (c.id === id ? firstHalf : c)).concat(secondHalf),
      };
    }),

  setCurrentTime: (time) =>
    set((state) => ({ currentTime: Math.max(0, Math.min(time, state.duration)) })),

  setZoom: (zoom) => set(() => ({ zoom: Math.max(20, Math.min(300, zoom)) })),

  setSelectedClip: (id) => set(() => ({ selectedClipId: id })),

  recomputeDuration: () =>
    set((state) => {
      const duration = state.clips.length > 0
        ? Math.max(...state.clips.map((c) => c.startTime + c.duration))
        : 0;
      return { duration };
    }),
});
