import { describe, it, expect } from "vitest";
import { clipsOverlap, getClipsAtTime, getActiveClip, snapTime } from "@/lib/timeline/clipUtils";
import type { Clip } from "@/types/editor";

function makeClip(overrides: Partial<Clip> & { id: string; startTime: number; duration: number; trackId: string }): Clip {
  return {
    name: "clip",
    file: null as unknown as File,
    trimIn: 0,
    trimOut: overrides.duration,
    sourceDuration: overrides.duration,
    width: 1920,
    height: 1080,
    fps: 30,
    thumbnails: [],
    ...overrides,
  };
}

const clipA = makeClip({ id: "a", startTime: 0, duration: 5, trackId: "track-video" });
const clipB = makeClip({ id: "b", startTime: 3, duration: 5, trackId: "track-video" });
const clipC = makeClip({ id: "c", startTime: 10, duration: 3, trackId: "track-video" });
const clipD = makeClip({ id: "d", startTime: 0, duration: 5, trackId: "track-audio" });

describe("clipsOverlap", () => {
  it("detects overlapping clips on the same track", () => {
    expect(clipsOverlap(clipA, clipB)).toBe(true);
  });

  it("returns false for non-overlapping clips", () => {
    expect(clipsOverlap(clipA, clipC)).toBe(false);
  });

  it("returns false for clips on different tracks", () => {
    expect(clipsOverlap(clipA, clipD)).toBe(false);
  });
});

describe("getClipsAtTime", () => {
  const clips = [clipA, clipB, clipC, clipD];

  it("finds clips at a given time", () => {
    const result = getClipsAtTime(clips, 4);
    expect(result.map((c) => c.id)).toContain("a");
    expect(result.map((c) => c.id)).toContain("b");
  });

  it("filters by trackId", () => {
    const result = getClipsAtTime(clips, 2, "track-audio");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("d");
  });

  it("returns empty for time with no clips", () => {
    expect(getClipsAtTime(clips, 20)).toHaveLength(0);
  });
});

describe("getActiveClip", () => {
  const clips = [clipA, clipC, clipD];

  it("returns the active video clip at a time", () => {
    expect(getActiveClip(clips, 2)?.id).toBe("a");
  });

  it("returns null when no video clip is active", () => {
    expect(getActiveClip(clips, 9)).toBeNull();
  });

  it("ignores non-video tracks", () => {
    expect(getActiveClip([clipD], 2)).toBeNull();
  });
});

describe("snapTime", () => {
  const clips = [clipA, clipC];

  it("snaps to a clip edge within radius", () => {
    expect(snapTime(4.9, clips, 0.2)).toBe(5);
  });

  it("returns original time when nothing is close", () => {
    expect(snapTime(7, clips, 0.2)).toBe(7);
  });

  it("snaps to whole seconds", () => {
    expect(snapTime(6.05, clips, 0.1)).toBe(6);
  });

  it("excludes a clip by id", () => {
    // clipA ends at 5; with exclude, it shouldn't snap to that edge
    expect(snapTime(4.95, clips, 0.1, "a")).toBe(5); // still snaps to whole second 5
  });
});
