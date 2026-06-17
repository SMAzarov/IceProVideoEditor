import { Clip } from "@/types/editor";

/** Check if two clips overlap on the same track */
export function clipsOverlap(a: Clip, b: Clip): boolean {
  if (a.trackId !== b.trackId) return false;
  return a.startTime < b.startTime + b.duration && a.startTime + a.duration > b.startTime;
}

/** Find clips at a given time on a given track */
export function getClipsAtTime(clips: Clip[], time: number, trackId?: string): Clip[] {
  return clips.filter((c) => {
    if (trackId && c.trackId !== trackId) return false;
    return c.startTime <= time && c.startTime + c.duration > time;
  });
}

/** Get the active clip at a given time (first match) */
export function getActiveClip(clips: Clip[], time: number): Clip | null {
  const videoClips = clips.filter((c) => c.trackId === "track-video");
  return (
    videoClips.find((c) => c.startTime <= time && c.startTime + c.duration > time) ?? null
  );
}

/** Snap a time value to the nearest clip edge or second boundary */
export function snapTime(
  time: number,
  clips: Clip[],
  snapRadius: number,
  excludeId?: string
): number {
  const edges: number[] = [];

  for (const clip of clips) {
    if (clip.id === excludeId) continue;
    edges.push(clip.startTime);
    edges.push(clip.startTime + clip.duration);
  }

  // Also snap to whole seconds
  const nearestSecond = Math.round(time);
  edges.push(nearestSecond);

  for (const edge of edges) {
    if (Math.abs(edge - time) < snapRadius) {
      return edge;
    }
  }

  return time;
}
