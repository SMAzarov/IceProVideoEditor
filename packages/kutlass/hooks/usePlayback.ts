"use client";

import { useEffect, useRef, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { renderPreview, renderer, drawShapesOnCtx } from "@/lib/webcodecs/PreviewEngine";
import { getDecoderForFile } from "@/lib/webcodecs/VideoDecoder";
import { DEFAULT_EFFECTS } from "@/types/editor";

function getActiveClipNow(time: number) {
  const { clips } = useEditorStore.getState();
  const clip = clips.find(
    (c) =>
      c.trackId === "track-video" &&
      c.startTime <= time &&
      c.startTime + c.duration > time
  );
  return clip ? { clip, decoder: getDecoderForFile(clip.file) } : null;
}

export function usePlayback(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  onFirstFrame?: () => void
) {
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const clipsLength = useEditorStore((s) => s.clips.filter((c) => c.trackId === "track-video").length);
  const rafRef = useRef<number | null>(null);
  const renderingRef = useRef(false);
  const firstFrameFiredRef = useRef(false);

  // Reset so the spinner shows again if all clips are removed and new ones imported
  useEffect(() => {
    if (clipsLength === 0) firstFrameFiredRef.current = false;
  }, [clipsLength]);

  // ── renderFrame — seeks and renders at a timeline time ───────────────────────
  const renderFrame = useCallback(
    async (time: number) => {
      if (!canvasRef.current || renderingRef.current) return;
      renderingRef.current = true;
      try {
        const { clips, clipEffects, cropToolActive, shapes } = useEditorStore.getState();
        await renderPreview(canvasRef.current, clips, time, clipEffects, cropToolActive, shapes);
        if (!firstFrameFiredRef.current) {
          firstFrameFiredRef.current = true;
          onFirstFrame?.();
        }
      } finally {
        renderingRef.current = false;
      }
    },
    [canvasRef, onFirstFrame]
  );

  // ── renderSourceFrame — renders a clip at an arbitrary source time ────────────
  // Used by TrimPanel scrubbing so the preview can show frames outside the trim selection.
  const renderSourceFrame = useCallback(
    async (clipId: string, sourceTime: number) => {
      if (!canvasRef.current || renderingRef.current) return;
      renderingRef.current = true;
      try {
        const { clips, clipEffects } = useEditorStore.getState();
        const clip = clips.find((c) => c.id === clipId);
        if (!clip) return;
        const decoder = getDecoderForFile(clip.file);
        const frame = await decoder.requestFrame(clip.file, sourceTime);
        if (!frame) return;
        const effects = clipEffects[clip.id] ?? DEFAULT_EFFECTS;
        renderer.renderFrame(frame, canvasRef.current!, effects);
        frame.close();
      } finally {
        renderingRef.current = false;
      }
    },
    [canvasRef]
  );

  const renderFrameRef = useRef(renderFrame);
  renderFrameRef.current = renderFrame;
  const renderSourceFrameRef = useRef(renderSourceFrame);
  renderSourceFrameRef.current = renderSourceFrame;

  // ── Subscription: render when paused and time / effects / trimScrub change ───
  useEffect(() => {
    let lastTime = useEditorStore.getState().currentTime;
    let lastEffects = useEditorStore.getState().clipEffects;
    let lastTrimScrub = useEditorStore.getState().trimScrub;
    let lastCropToolActive = useEditorStore.getState().cropToolActive;
    let lastShapes = useEditorStore.getState().shapes;

    return useEditorStore.subscribe((state) => {
      if (state.isPlaying) return;

      // TrimPanel is scrubbing at an arbitrary source position
      const scrubChanged = state.trimScrub !== lastTrimScrub;
      if (scrubChanged) {
        lastTrimScrub = state.trimScrub;
        if (state.trimScrub) {
          renderSourceFrameRef.current(state.trimScrub.clipId, state.trimScrub.sourceTime);
          return;
        }
      }

      // Skip normal rendering while TrimPanel scrub is active (avoids racing)
      if (state.trimScrub) return;

      const timeChanged = state.currentTime !== lastTime;
      const effectsChanged = state.clipEffects !== lastEffects;
      const cropChanged = state.cropToolActive !== lastCropToolActive;
      const shapesChanged = state.shapes !== lastShapes;

      if (timeChanged || effectsChanged || cropChanged || shapesChanged) {
        lastTime = state.currentTime;
        lastEffects = state.clipEffects;
        lastCropToolActive = state.cropToolActive;
        lastShapes = state.shapes;
        renderFrameRef.current(state.currentTime);
      }
    });
  }, []); // ← intentionally empty

  // ── Initial render when the first clip appears ───────────────────────────────
  useEffect(() => {
    if (clipsLength === 0) return;
    const timer = setTimeout(() => {
      renderFrameRef.current(useEditorStore.getState().currentTime);
    }, 100);
    return () => clearTimeout(timer);
  }, [clipsLength]);

  // ── RAF loop — live playback with variable speed ────────────────────────────
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    let lastTime = performance.now();
    let accumulated = 0;

    const loop = (now: number) => {
      const { duration, playbackRate } = useEditorStore.getState();

      // If playbackRate is 0, treat as paused — don't advance time
      if (playbackRate === 0) {
        lastTime = now;
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      // Accumulate real elapsed time, scaled by playbackRate
      const delta = (now - lastTime) / 1000; // seconds
      lastTime = now;
      accumulated += delta * playbackRate;

      // Only advance when we've accumulated at least one frame's worth of time
      const frameDuration = 1 / 30; // ~33ms, roughly one frame
      if (accumulated < frameDuration) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      // How many frames to advance
      const steps = Math.floor(accumulated / frameDuration);
      accumulated -= steps * frameDuration;

      const currentTime = useEditorStore.getState().currentTime;
      const active = getActiveClipNow(currentTime);

      if (active) {
        const videoTime = active.decoder.getVideoCurrentTime();
        const timelineTime = active.clip.startTime + videoTime - active.clip.trimIn;

        if (timelineTime >= duration) {
          useEditorStore.getState().setPlaying(false);
          active.decoder.stopPlayback();
          useEditorStore.getState().setCurrentTime(0);
          return;
        }

        useEditorStore.getState().setCurrentTime(Math.min(timelineTime, duration));

          if (canvasRef.current && !renderingRef.current) {
            const frame = active.decoder.captureCurrentFrame();
            if (frame) {
              const { clipEffects, cropToolActive, shapes } = useEditorStore.getState();
              const base = clipEffects[active.clip.id] ?? DEFAULT_EFFECTS;
              const effects = cropToolActive
                ? { ...base, cropX: 0, cropY: 0, cropW: 1, cropH: 1 }
                : base;
              renderer.renderFrame(frame, canvasRef.current, effects);
              frame.close();

              // Draw shape annotations on top
              const visibleShapes = shapes.filter(
                (s) => s.startTime <= currentTime && currentTime < s.endTime
              );
              if (visibleShapes.length > 0) {
                const ctx = canvasRef.current.getContext("2d");
                if (ctx) drawShapesOnCtx(ctx, visibleShapes, canvasRef.current.width, canvasRef.current.height);
              }
            }
          }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, canvasRef]);
}
