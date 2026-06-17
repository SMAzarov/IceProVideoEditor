import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "@/store/editorStore";
import type { Clip } from "@/types/editor";

function makeClip(overrides: Partial<Clip> = {}): Omit<Clip, "id"> {
  return {
    trackId: "track-video",
    name: "test-clip",
    file: null as unknown as File,
    startTime: 0,
    duration: 10,
    trimIn: 0,
    trimOut: 10,
    sourceDuration: 10,
    width: 1920,
    height: 1080,
    fps: 30,
    thumbnails: [],
    ...overrides,
  };
}

describe("editorStore", () => {
  beforeEach(() => {
    // Reset the store between tests
    useEditorStore.setState({
      clips: [],
      currentTime: 0,
      duration: 0,
      zoom: 80,
      selectedClipId: null,
      isPlaying: false,
      clipEffects: {},
      overlays: [],
      selectedOverlayId: null,
      strokes: [],
      drawingTool: "pen",
      drawingColor: "#ff0000",
      drawingWidth: 4,
      past: [],
      future: [],
      status: "idle",
      progress: 0,
      outputUrl: null,
      error: null,
    });
  });

  it("initializes with empty state", () => {
    const state = useEditorStore.getState();
    expect(state.clips).toEqual([]);
    expect(state.duration).toBe(0);
    expect(state.currentTime).toBe(0);
  });

  // Timeline
  describe("timeline", () => {
    it("adds a clip and updates duration", () => {
      useEditorStore.getState().addClip(makeClip({ startTime: 0, duration: 5 }));
      const state = useEditorStore.getState();
      expect(state.clips).toHaveLength(1);
      expect(state.duration).toBe(5);
    });

    it("removes a clip and updates duration", () => {
      useEditorStore.getState().addClip(makeClip({ startTime: 0, duration: 5 }));
      useEditorStore.getState().addClip(makeClip({ startTime: 5, duration: 3 }));
      const id = useEditorStore.getState().clips[0].id;
      useEditorStore.getState().removeClip(id);
      const state = useEditorStore.getState();
      expect(state.clips).toHaveLength(1);
      expect(state.duration).toBe(8);
    });

    it("removes a clip and clears selection if it was selected", () => {
      useEditorStore.getState().addClip(makeClip());
      const id = useEditorStore.getState().clips[0].id;
      useEditorStore.getState().setSelectedClip(id);
      useEditorStore.getState().removeClip(id);
      expect(useEditorStore.getState().selectedClipId).toBeNull();
    });

    it("moves a clip", () => {
      useEditorStore.getState().addClip(makeClip({ startTime: 0, duration: 5 }));
      const id = useEditorStore.getState().clips[0].id;
      useEditorStore.getState().moveClip(id, 3);
      expect(useEditorStore.getState().clips[0].startTime).toBe(3);
      expect(useEditorStore.getState().duration).toBe(8);
    });

    it("clamps moveClip to 0", () => {
      useEditorStore.getState().addClip(makeClip({ startTime: 5, duration: 5 }));
      const id = useEditorStore.getState().clips[0].id;
      useEditorStore.getState().moveClip(id, -3);
      expect(useEditorStore.getState().clips[0].startTime).toBe(0);
    });

    it("updates a clip", () => {
      useEditorStore.getState().addClip(makeClip());
      const id = useEditorStore.getState().clips[0].id;
      useEditorStore.getState().updateClip(id, { name: "renamed" });
      expect(useEditorStore.getState().clips[0].name).toBe("renamed");
    });

    it("trims clip start", () => {
      useEditorStore.getState().addClip(makeClip({ startTime: 0, duration: 10, trimIn: 0 }));
      const id = useEditorStore.getState().clips[0].id;
      useEditorStore.getState().trimClipStart(id, 2, 2, 8);
      const clip = useEditorStore.getState().clips[0];
      expect(clip.trimIn).toBe(2);
      expect(clip.startTime).toBe(2);
      expect(clip.duration).toBe(8);
    });

    it("trims clip end", () => {
      useEditorStore.getState().addClip(makeClip({ startTime: 0, duration: 10, trimOut: 10 }));
      const id = useEditorStore.getState().clips[0].id;
      useEditorStore.getState().trimClipEnd(id, 7, 7);
      const clip = useEditorStore.getState().clips[0];
      expect(clip.trimOut).toBe(7);
      expect(clip.duration).toBe(7);
    });

    it("splits a clip at a time", () => {
      useEditorStore.getState().addClip(makeClip({ startTime: 0, duration: 10, trimIn: 0, trimOut: 10 }));
      const id = useEditorStore.getState().clips[0].id;
      useEditorStore.getState().splitClipAt(id, 4);
      const clips = useEditorStore.getState().clips;
      expect(clips).toHaveLength(2);
      expect(clips[0].duration).toBe(4);
      expect(clips[1].startTime).toBe(4);
      expect(clips[1].duration).toBe(6);
    });

    it("does nothing when splitting at invalid time", () => {
      useEditorStore.getState().addClip(makeClip({ startTime: 0, duration: 10 }));
      const id = useEditorStore.getState().clips[0].id;
      useEditorStore.getState().splitClipAt(id, 0);
      expect(useEditorStore.getState().clips).toHaveLength(1);
      useEditorStore.getState().splitClipAt(id, 10);
      expect(useEditorStore.getState().clips).toHaveLength(1);
    });

    it("does nothing when splitting non-existent clip", () => {
      useEditorStore.getState().splitClipAt("nope", 5);
      expect(useEditorStore.getState().clips).toHaveLength(0);
    });

    it("sets current time clamped to duration", () => {
      useEditorStore.getState().addClip(makeClip({ startTime: 0, duration: 5 }));
      useEditorStore.getState().setCurrentTime(100);
      expect(useEditorStore.getState().currentTime).toBe(5);
      useEditorStore.getState().setCurrentTime(-5);
      expect(useEditorStore.getState().currentTime).toBe(0);
    });

    it("sets zoom clamped to range", () => {
      useEditorStore.getState().setZoom(5);
      expect(useEditorStore.getState().zoom).toBe(20);
      useEditorStore.getState().setZoom(500);
      expect(useEditorStore.getState().zoom).toBe(300);
    });

    it("recomputes duration", () => {
      useEditorStore.getState().addClip(makeClip({ startTime: 0, duration: 5 }));
      useEditorStore.getState().addClip(makeClip({ startTime: 3, duration: 10 }));
      useEditorStore.getState().recomputeDuration();
      expect(useEditorStore.getState().duration).toBe(13);
    });

    it("recomputes duration to 0 when no clips", () => {
      useEditorStore.getState().recomputeDuration();
      expect(useEditorStore.getState().duration).toBe(0);
    });

    it("trimClipStart clamps currentTime into clip range", () => {
      useEditorStore.getState().addClip(makeClip({ startTime: 0, duration: 10 }));
      const id = useEditorStore.getState().clips[0].id;
      useEditorStore.getState().setCurrentTime(1);
      // Trim start to 5, so clip now starts at 5 — currentTime 1 should clamp to 5
      useEditorStore.getState().trimClipStart(id, 5, 5, 5);
      expect(useEditorStore.getState().currentTime).toBe(5);
    });

    it("trimClipEnd clamps currentTime into clip range", () => {
      useEditorStore.getState().addClip(makeClip({ startTime: 0, duration: 10 }));
      const id = useEditorStore.getState().clips[0].id;
      useEditorStore.getState().setCurrentTime(8);
      // Trim end to 5, so clip duration is now 5 — currentTime 8 should clamp to 5
      useEditorStore.getState().trimClipEnd(id, 5, 5);
      expect(useEditorStore.getState().currentTime).toBe(5);
    });

    it("removeClip sets duration to 0 when last clip removed", () => {
      useEditorStore.getState().addClip(makeClip({ startTime: 0, duration: 5 }));
      const id = useEditorStore.getState().clips[0].id;
      useEditorStore.getState().removeClip(id);
      expect(useEditorStore.getState().duration).toBe(0);
    });

    it("removeClip preserves selection if different clip removed", () => {
      useEditorStore.getState().addClip(makeClip({ startTime: 0, duration: 5 }));
      useEditorStore.getState().addClip(makeClip({ startTime: 5, duration: 5 }));
      const clips = useEditorStore.getState().clips;
      useEditorStore.getState().setSelectedClip(clips[1].id);
      useEditorStore.getState().removeClip(clips[0].id);
      expect(useEditorStore.getState().selectedClipId).toBe(clips[1].id);
    });

    it("trimClipStart on nonexistent clip keeps currentTime", () => {
      useEditorStore.getState().addClip(makeClip({ startTime: 0, duration: 10 }));
      useEditorStore.getState().setCurrentTime(3);
      useEditorStore.getState().trimClipStart("nope", 5, 5, 5);
      expect(useEditorStore.getState().currentTime).toBe(3);
    });

    it("trimClipEnd on nonexistent clip keeps currentTime", () => {
      useEditorStore.getState().addClip(makeClip({ startTime: 0, duration: 10 }));
      useEditorStore.getState().setCurrentTime(3);
      useEditorStore.getState().trimClipEnd("nope", 5, 5);
      expect(useEditorStore.getState().currentTime).toBe(3);
    });
  });

  // Playback
  describe("playback", () => {
    it("toggles playing", () => {
      useEditorStore.getState().togglePlay();
      expect(useEditorStore.getState().isPlaying).toBe(true);
      useEditorStore.getState().togglePlay();
      expect(useEditorStore.getState().isPlaying).toBe(false);
    });

    it("sets playing", () => {
      useEditorStore.getState().setPlaying(true);
      expect(useEditorStore.getState().isPlaying).toBe(true);
    });

    it("sets fps", () => {
      useEditorStore.getState().setFps(60);
      expect(useEditorStore.getState().fps).toBe(60);
    });

    it("sets playback rate", () => {
      useEditorStore.getState().setPlaybackRate(2);
      expect(useEditorStore.getState().playbackRate).toBe(2);
    });

    it("sets trim scrub", () => {
      useEditorStore.getState().setTrimScrub({ clipId: "c1", sourceTime: 3 });
      expect(useEditorStore.getState().trimScrub).toEqual({ clipId: "c1", sourceTime: 3 });
      useEditorStore.getState().setTrimScrub(null);
      expect(useEditorStore.getState().trimScrub).toBeNull();
    });
  });

  // Effects
  describe("effects", () => {
    it("sets a single clip effect", () => {
      useEditorStore.getState().setClipEffect("c1", "brightness", 50);
      expect(useEditorStore.getState().clipEffects["c1"].brightness).toBe(50);
    });

    it("sets multiple clip effects", () => {
      useEditorStore.getState().setClipEffects("c1", { brightness: 20, contrast: 30 });
      const effects = useEditorStore.getState().clipEffects["c1"];
      expect(effects.brightness).toBe(20);
      expect(effects.contrast).toBe(30);
    });

    it("resets clip effects", () => {
      useEditorStore.getState().setClipEffect("c1", "brightness", 50);
      useEditorStore.getState().resetClipEffects("c1");
      expect(useEditorStore.getState().clipEffects["c1"]).toBeUndefined();
    });

    it("gets clip effects with defaults", () => {
      const effects = useEditorStore.getState().getClipEffects("nonexistent");
      expect(effects.brightness).toBe(0);
      expect(effects.opacity).toBe(1);
    });

    it("sets crop tool active", () => {
      useEditorStore.getState().setCropToolActive(true);
      expect(useEditorStore.getState().cropToolActive).toBe(true);
    });
  });

  // Export
  describe("export", () => {
    it("sets export status", () => {
      useEditorStore.getState().setExportStatus("encoding");
      expect(useEditorStore.getState().status).toBe("encoding");
    });

    it("sets export progress", () => {
      useEditorStore.getState().setExportProgress(50);
      expect(useEditorStore.getState().progress).toBe(50);
    });

    it("sets output url", () => {
      useEditorStore.getState().setOutputUrl("blob:test");
      expect(useEditorStore.getState().outputUrl).toBe("blob:test");
    });

    it("sets export error", () => {
      useEditorStore.getState().setExportError("failed");
      expect(useEditorStore.getState().error).toBe("failed");
    });

    it("updates export settings", () => {
      useEditorStore.getState().updateExportSettings({ format: "webm", fps: 60 });
      expect(useEditorStore.getState().settings.format).toBe("webm");
      expect(useEditorStore.getState().settings.fps).toBe(60);
    });

    it("resets export state", () => {
      useEditorStore.getState().setExportStatus("done");
      useEditorStore.getState().setExportProgress(100);
      useEditorStore.getState().setOutputUrl("blob:test");
      useEditorStore.getState().resetExport();
      const state = useEditorStore.getState();
      expect(state.status).toBe("idle");
      expect(state.progress).toBe(0);
      expect(state.outputUrl).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  // Overlays
  describe("overlays", () => {
    it("adds a text overlay", () => {
      const id = useEditorStore.getState().addTextOverlay({
        text: "Hello",
        x: 0.5,
        y: 0.5,
        fontSize: 24,
        color: "#ffffff",
        fontFamily: "sans-serif",
        bold: false,
      });
      expect(typeof id).toBe("string");
      expect(useEditorStore.getState().overlays).toHaveLength(1);
      expect(useEditorStore.getState().overlays[0].type).toBe("text");
      expect(useEditorStore.getState().selectedOverlayId).toBe(id);
    });

    it("adds a sticker overlay", () => {
      const id = useEditorStore.getState().addStickerOverlay({
        emoji: "😀",
        x: 0.5,
        y: 0.5,
        scale: 1,
      });
      expect(useEditorStore.getState().overlays).toHaveLength(1);
      expect(useEditorStore.getState().overlays[0].type).toBe("sticker");
      expect(useEditorStore.getState().selectedOverlayId).toBe(id);
    });

    it("updates an overlay", () => {
      const id = useEditorStore.getState().addTextOverlay({
        text: "Hello",
        x: 0.5,
        y: 0.5,
        fontSize: 24,
        color: "#ffffff",
        fontFamily: "sans-serif",
        bold: false,
      });
      useEditorStore.getState().updateOverlay(id, { x: 0.8 });
      expect((useEditorStore.getState().overlays[0] as { x: number }).x).toBe(0.8);
    });

    it("removes an overlay and clears selection", () => {
      const id = useEditorStore.getState().addTextOverlay({
        text: "Hello",
        x: 0.5,
        y: 0.5,
        fontSize: 24,
        color: "#ffffff",
        fontFamily: "sans-serif",
        bold: false,
      });
      useEditorStore.getState().removeOverlay(id);
      expect(useEditorStore.getState().overlays).toHaveLength(0);
      expect(useEditorStore.getState().selectedOverlayId).toBeNull();
    });

    it("selects an overlay", () => {
      useEditorStore.getState().selectOverlay("abc");
      expect(useEditorStore.getState().selectedOverlayId).toBe("abc");
    });

    it("clears all overlays", () => {
      useEditorStore.getState().addTextOverlay({ text: "A", x: 0, y: 0, fontSize: 12, color: "#fff", fontFamily: "sans", bold: false });
      useEditorStore.getState().addStickerOverlay({ emoji: "😀", x: 0, y: 0, scale: 1 });
      useEditorStore.getState().clearOverlays();
      expect(useEditorStore.getState().overlays).toHaveLength(0);
      expect(useEditorStore.getState().selectedOverlayId).toBeNull();
    });

    it("removeOverlay preserves selection when different overlay removed", () => {
      const id1 = useEditorStore.getState().addTextOverlay({ text: "A", x: 0, y: 0, fontSize: 12, color: "#fff", fontFamily: "sans", bold: false });
      const id2 = useEditorStore.getState().addTextOverlay({ text: "B", x: 0, y: 0, fontSize: 12, color: "#fff", fontFamily: "sans", bold: false });
      // id2 is now selected (last added)
      useEditorStore.getState().selectOverlay(id2);
      useEditorStore.getState().removeOverlay(id1);
      expect(useEditorStore.getState().selectedOverlayId).toBe(id2);
    });

    it("updateOverlay does not affect other overlays", () => {
      const id1 = useEditorStore.getState().addTextOverlay({ text: "A", x: 0, y: 0, fontSize: 12, color: "#fff", fontFamily: "sans", bold: false });
      useEditorStore.getState().addTextOverlay({ text: "B", x: 0.5, y: 0.5, fontSize: 12, color: "#fff", fontFamily: "sans", bold: false });
      useEditorStore.getState().updateOverlay(id1, { x: 0.9 });
      expect((useEditorStore.getState().overlays[1] as { x: number }).x).toBe(0.5);
    });
  });

  // Drawing
  describe("drawing", () => {
    it("adds a stroke", () => {
      useEditorStore.getState().addStroke({
        id: "s1",
        tool: "pen",
        color: "#ff0000",
        width: 4,
        points: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
      });
      expect(useEditorStore.getState().strokes).toHaveLength(1);
    });

    it("undoes a stroke", () => {
      useEditorStore.getState().addStroke({ id: "s1", tool: "pen", color: "#ff0000", width: 4, points: [] });
      useEditorStore.getState().addStroke({ id: "s2", tool: "pen", color: "#ff0000", width: 4, points: [] });
      useEditorStore.getState().undoStroke();
      expect(useEditorStore.getState().strokes).toHaveLength(1);
      expect(useEditorStore.getState().strokes[0].id).toBe("s1");
    });

    it("clears all strokes", () => {
      useEditorStore.getState().addStroke({ id: "s1", tool: "pen", color: "#ff0000", width: 4, points: [] });
      useEditorStore.getState().clearStrokes();
      expect(useEditorStore.getState().strokes).toHaveLength(0);
    });

    it("sets drawing tool", () => {
      useEditorStore.getState().setDrawingTool("eraser");
      expect(useEditorStore.getState().drawingTool).toBe("eraser");
    });

    it("sets drawing color", () => {
      useEditorStore.getState().setDrawingColor("#00ff00");
      expect(useEditorStore.getState().drawingColor).toBe("#00ff00");
    });

    it("sets drawing width", () => {
      useEditorStore.getState().setDrawingWidth(8);
      expect(useEditorStore.getState().drawingWidth).toBe(8);
    });
  });

  // History
  describe("history", () => {
    it("captures and undoes history", () => {
      useEditorStore.getState().addClip(makeClip({ startTime: 0, duration: 5 }));
      useEditorStore.getState().captureHistory();
      useEditorStore.getState().addClip(makeClip({ startTime: 5, duration: 3 }));
      expect(useEditorStore.getState().clips).toHaveLength(2);

      useEditorStore.getState().undo();
      expect(useEditorStore.getState().clips).toHaveLength(1);
    });

    it("redoes after undo", () => {
      useEditorStore.getState().addClip(makeClip({ startTime: 0, duration: 5 }));
      useEditorStore.getState().captureHistory();
      useEditorStore.getState().addClip(makeClip({ startTime: 5, duration: 3 }));

      useEditorStore.getState().undo();
      expect(useEditorStore.getState().clips).toHaveLength(1);

      useEditorStore.getState().redo();
      expect(useEditorStore.getState().clips).toHaveLength(2);
    });

    it("clears future on new capture", () => {
      useEditorStore.getState().addClip(makeClip({ startTime: 0, duration: 5 }));
      useEditorStore.getState().captureHistory();
      useEditorStore.getState().addClip(makeClip({ startTime: 5, duration: 3 }));
      useEditorStore.getState().undo();

      useEditorStore.getState().captureHistory();
      expect(useEditorStore.getState().future).toHaveLength(0);
    });

    it("undo does nothing with empty past", () => {
      useEditorStore.getState().undo();
      expect(useEditorStore.getState().clips).toHaveLength(0);
    });

    it("redo does nothing with empty future", () => {
      useEditorStore.getState().redo();
      expect(useEditorStore.getState().clips).toHaveLength(0);
    });

    it("limits history to 50 entries", () => {
      for (let i = 0; i < 55; i++) {
        useEditorStore.getState().captureHistory();
      }
      expect(useEditorStore.getState().past.length).toBeLessThanOrEqual(50);
    });
  });
});
