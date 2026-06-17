"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useShallow } from "zustand/react/shallow";
import { formatTime } from "@/lib/timeline/timeUtils";
import { getDecoderForFile } from "@/lib/webcodecs/VideoDecoder";
import { pauseAction } from "@/lib/playbackActions";

const STRIP_HEIGHT = 56;
const RULER_H = 20;
const TOTAL_H = RULER_H + STRIP_HEIGHT + 16;
const MIN_CLIP_DURATION = 0.1;
const HANDLE_W = 14;

// Module-level cache: persists across TrimPanel mount/unmount cycles (tool switching)
const thumbCache = new Map<string, string[]>();

type DragType = "trimStart" | "trimEnd" | "scrub";

interface DragState {
  type: DragType;
  startX: number;
  startTrimIn: number;
  startTrimOut: number;
  startClipStartTime: number;
  startDuration: number;
}

export function TrimPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const dragRef = useRef<DragState | null>(null);

  const clips = useEditorStore(useShallow((s) => s.clips.filter((c) => c.trackId === "track-video")));
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const currentTime = useEditorStore((s) => s.currentTime);
  const duration = useEditorStore((s) => s.duration);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const trimClipStart = useEditorStore((s) => s.trimClipStart);
  const trimClipEnd = useEditorStore((s) => s.trimClipEnd);
  const setSelectedClip = useEditorStore((s) => s.setSelectedClip);
  const setTrimScrub = useEditorStore((s) => s.setTrimScrub);
  const captureHistory = useEditorStore((s) => s.captureHistory);

  const clip = clips.find((c) => c.id === selectedClipId) ?? clips[0] ?? null;

  // Auto-select first clip
  useEffect(() => {
    if (!selectedClipId && clips.length > 0) {
      setSelectedClip(clips[0].id);
    }
  }, [clips, selectedClipId, setSelectedClip]);

  // Measure container — always mounted (no early return before this)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Zoom based on source duration — constant; never changes when trimming
  const sourceDuration = clip?.sourceDuration ?? 1;
  const zoom = containerWidth > 0 && sourceDuration > 0 ? containerWidth / sourceDuration : 1;

  // Local scrub position in source-time space (0..sourceDuration).
  // Owned by this component so trim handle drags don't move the playhead.
  const [localSourceTime, setLocalSourceTime] = useState<number>(0);

  // Keep localSourceTime in sync with external currentTime changes
  // (e.g. user plays back, or seeks via other means) — but NOT during a drag.
  const isDraggingRef = useRef(false);
  const wasPlayingRef = useRef(false);
  useEffect(() => {
    if (isDraggingRef.current || !clip) return;
    const src = clip.trimIn + (currentTime - clip.startTime);
    setLocalSourceTime(Math.max(0, Math.min(src, clip.sourceDuration)));
  }, [currentTime, clip]);

  // Thumbnail strip — cached by clipId so switching tools doesn't reload thumbnails
  const [thumbs, setThumbs] = useState<string[]>(() => thumbCache.get("") ?? []);
  useEffect(() => {
    if (!clip || containerWidth === 0) return;

    // Serve from cache immediately — no spinner on return visits
    const cached = thumbCache.get(clip.id);
    if (cached) { setThumbs(cached); return; }

    setThumbs([]); // clear while loading

    const aspect = clip.width / clip.height;
    const thumbW = Math.round(STRIP_HEIGHT * aspect);
    const count = Math.max(2, Math.ceil(containerWidth / thumbW));
    const decoder = getDecoderForFile(clip.file);
    const promises = Array.from({ length: count }, (_, i) => {
      const t = (i / Math.max(count - 1, 1)) * clip.sourceDuration;
      return decoder
        .requestFrame(clip.file, t)
        .then((frame) => {
          if (!frame) return null;
          const c = document.createElement("canvas");
          c.width = thumbW;
          c.height = STRIP_HEIGHT;
          const ctx = c.getContext("2d");
          if (ctx) ctx.drawImage(frame, 0, 0, thumbW, STRIP_HEIGHT);
          frame.close();
          return c.toDataURL("image/jpeg", 0.65);
        })
        .catch(() => null);
    });
    Promise.all(promises).then((results) => {
      const valid = results.filter(Boolean) as string[];
      if (valid.length > 0) {
        thumbCache.set(clip.id, valid);
        setThumbs(valid);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clip?.id, containerWidth]);

  const toX = (sec: number) => sec * zoom;

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const d = dragRef.current;
      if (!d || !clip || !containerRef.current) return;

      if (d.type === "scrub") {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const t = Math.max(0, Math.min(x / zoom, clip.sourceDuration));
        setLocalSourceTime(t);
        // Drive the preview via trimScrub so usePlayback can render outside the clip range
        setTrimScrub({ clipId: clip.id, sourceTime: t });
        return;
      }

      const dxSec = (e.clientX - d.startX) / zoom;

      if (d.type === "trimStart") {
        const newTrimIn = Math.max(0, Math.min(d.startTrimIn + dxSec, d.startTrimOut - MIN_CLIP_DURATION));
        const delta = newTrimIn - d.startTrimIn;
        trimClipStart(clip.id, newTrimIn, d.startClipStartTime + delta, d.startDuration - delta);
      } else if (d.type === "trimEnd") {
        const newTrimOut = Math.min(
          clip.sourceDuration,
          Math.max(d.startTrimOut + dxSec, d.startTrimIn + MIN_CLIP_DURATION)
        );
        const delta = newTrimOut - d.startTrimOut;
        trimClipEnd(clip.id, newTrimOut, d.startDuration + delta);
      }
    },
    [clip, zoom, setTrimScrub, trimClipStart, trimClipEnd]
  );

  const handlePointerUp = useCallback(() => {
    if (!clip) return;
    const d = dragRef.current;
    dragRef.current = null;
    isDraggingRef.current = false;

    if (d?.type === "scrub") {
      setTrimScrub(null);
      const timelineT = clip.startTime + (localSourceTime - clip.trimIn);

      if (wasPlayingRef.current) {
        // Resume playback from the scrubbed position — seek the decoder and restart
        wasPlayingRef.current = false;
        const decoder = getDecoderForFile(clip.file);
        // startPlayback is fire-and-forget (called from pointer-up = user gesture)
        decoder.startPlayback(localSourceTime);
        useEditorStore.getState().setPlaying(true);
      } else {
        // Not playing — just commit the new time
        setCurrentTime(Math.max(0, Math.min(timelineT, duration)));
      }
    }
  }, [clip, localSourceTime, duration, setCurrentTime, setTrimScrub]);

  const beginDrag = useCallback(
    (e: React.PointerEvent, type: DragType) => {
      if (!clip) return;
      e.stopPropagation();
      containerRef.current?.setPointerCapture(e.pointerId);
      isDraggingRef.current = true;

      if (type === "scrub") {
        // Pause playback immediately so the RAF loop stops overwriting currentTime.
        // Record whether it was playing so we can resume on pointer-up.
        const isPlaying = useEditorStore.getState().isPlaying;
        wasPlayingRef.current = isPlaying;
        if (isPlaying) pauseAction();
      } else {
        // Trim handles — capture history before the first mutation
        captureHistory();
      }

      dragRef.current = {
        type,
        startX: e.clientX,
        startTrimIn: clip.trimIn,
        startTrimOut: clip.trimOut,
        startClipStartTime: clip.startTime,
        startDuration: clip.duration,
      };
    },
    [clip, captureHistory]
  );

  // Ruler ticks
  const rulerTicks: { t: number; isMajor: boolean }[] = [];
  let majorInterval = 1;
  if (sourceDuration > 300) majorInterval = 60;
  else if (sourceDuration > 120) majorInterval = 30;
  else if (sourceDuration > 60) majorInterval = 10;
  else if (sourceDuration > 30) majorInterval = 5;
  const minorInterval = majorInterval / 5;
  for (let t = 0; t <= Math.ceil(sourceDuration); t += minorInterval) {
    rulerTicks.push({ t, isMajor: Math.abs(t % majorInterval) < minorInterval / 2 });
  }

  // Always render the outer container — the ResizeObserver must always observe it.
  // Empty state is rendered inside, not as an early return.
  return (
    <div
      ref={containerRef}
      className="shrink-0 relative border-t overflow-hidden select-none"
      style={{ height: TOTAL_H, borderColor: "var(--kt-border)", background: "var(--kt-bg-panel)" }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Empty state — shown inside the container so containerRef is always attached */}
      {(!clip || containerWidth === 0) && (
        <div className="flex items-center justify-center" style={{ height: TOTAL_H }}>
          <p className="text-xs" style={{ color: "var(--kt-text-faint)" }}>
            {clips.length === 0 ? "Import a video to trim" : "Loading…"}
          </p>
        </div>
      )}

      {clip && containerWidth > 0 && (
        <>
          {/* ── Ruler ── */}
          <div
            className="absolute top-0 left-0 right-0 cursor-col-resize"
            style={{ height: RULER_H }}
            onPointerDown={(e) => beginDrag(e, "scrub")}
          >
            {rulerTicks.map(({ t, isMajor }) => (
              <div key={t} className="absolute top-0 flex flex-col" style={{ left: toX(t) }}>
                <div className={`w-px ${isMajor ? "h-2.5" : "h-1.5"}`} style={{ background: isMajor ? "var(--kt-tick-major)" : "var(--kt-tick-minor)" }} />
                {isMajor && (
                  <span className="text-[9px] ml-1 leading-none tabular-nums" style={{ color: "var(--kt-text-muted)" }}>
                    {formatTime(t)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* ── Full-source filmstrip ── */}
          <div
            className="absolute left-0 right-0 cursor-col-resize"
            style={{ top: RULER_H, height: STRIP_HEIGHT }}
            onPointerDown={(e) => beginDrag(e, "scrub")}
          >
            {/* Dimmed thumbnails across the full source duration */}
            {thumbs.length > 0 ? (
              <div className="flex h-full pointer-events-none">
                {thumbs.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="h-full flex-1 object-cover"
                    draggable={false}
                    style={{ filter: `brightness(var(--kt-dimmed-thumb))` }}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center pointer-events-none" style={{ background: "var(--kt-bg-surface)" }}>
                <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "var(--kt-spinner-border)", borderTopColor: "var(--kt-spinner-top)" }} />
              </div>
            )}

            {/* ── Selection window: bright clip over dimmed base ── */}
            {(() => {
              const selLeft = toX(clip.trimIn);
              const selWidth = Math.max(toX(clip.trimOut) - toX(clip.trimIn), HANDLE_W * 2 + 4);
              return (
                <>
                  {/* Bright selected region */}
                  <div
                    className="absolute top-0 overflow-hidden pointer-events-none"
                    style={{ left: selLeft, width: selWidth, height: STRIP_HEIGHT }}
                  >
                    {thumbs.length > 0 && (
                      <div className="flex h-full" style={{ width: containerWidth, marginLeft: -selLeft }}>
                        {thumbs.map((src, i) => (
                          <img key={i} src={src} alt="" className="h-full flex-1 object-cover" draggable={false} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selection border */}
                  <div
                    className="absolute top-0 pointer-events-none"
                    style={{
                      left: selLeft,
                      width: selWidth,
                      height: STRIP_HEIGHT,
                      border: "2px solid var(--kt-accent-strong-border)",
                      borderRadius: 2,
                    }}
                  />

                  {/* Left trim handle */}
                  <div
                    className="absolute top-0 bottom-0 flex items-center justify-center cursor-w-resize rounded-l"
                    style={{ left: selLeft, width: HANDLE_W, zIndex: 10, background: "var(--kt-accent)" }}
                    onPointerDown={(e) => beginDrag(e, "trimStart")}
                  >
                    <div className="flex gap-0.5 pointer-events-none">
                      <div className="w-0.5 h-5 bg-amber-900/60 rounded-full" />
                      <div className="w-0.5 h-5 bg-amber-900/60 rounded-full" />
                    </div>
                  </div>

                  {/* Right trim handle */}
                  <div
                    className="absolute top-0 bottom-0 flex items-center justify-center cursor-e-resize rounded-r"
                    style={{ left: selLeft + selWidth - HANDLE_W, width: HANDLE_W, zIndex: 10, background: "var(--kt-accent)" }}
                    onPointerDown={(e) => beginDrag(e, "trimEnd")}
                  >
                    <div className="flex gap-0.5 pointer-events-none">
                      <div className="w-0.5 h-5 bg-amber-900/60 rounded-full" />
                      <div className="w-0.5 h-5 bg-amber-900/60 rounded-full" />
                    </div>
                  </div>

                  {/* Trim time labels */}
                  <div
                    className="absolute pointer-events-none text-[9px] font-semibold tabular-nums px-1 rounded"
                    style={{ left: selLeft + HANDLE_W + 2, top: 2, color: "var(--kt-badge-text)", background: "var(--kt-badge-bg)" }}
                  >
                    {formatTime(clip.trimIn)}
                  </div>
                  <div
                    className="absolute pointer-events-none text-[9px] font-semibold tabular-nums px-1 rounded"
                    style={{ left: selLeft + selWidth - HANDLE_W - 36, top: 2, color: "var(--kt-badge-text)", background: "var(--kt-badge-bg)" }}
                  >
                    {formatTime(clip.trimOut)}
                  </div>
                </>
              );
            })()}
          </div>

          {/* ── Playhead — follows localSourceTime, not currentTime ── */}
          <div
            className="absolute top-0 z-20 pointer-events-none"
            style={{ left: toX(localSourceTime), bottom: 0 }}
          >
            <div
              className="absolute w-px"
              style={{ top: RULER_H - 2, bottom: 0, left: 0, transform: "translateX(-50%)", background: "var(--kt-text-primary)" }}
            />
            <div
              className="absolute -translate-x-1/2 border rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums cursor-col-resize pointer-events-auto"
              style={{ top: 0, background: "var(--kt-time-badge-bg)", color: "var(--kt-text-primary)", borderColor: "var(--kt-time-badge-border)" }}
              onPointerDown={(e) => beginDrag(e, "scrub")}
            >
              {formatTime(localSourceTime)}
            </div>
            <div
              className="absolute -translate-x-1/2"
              style={{
                top: RULER_H - 1,
                width: 0, height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "6px solid var(--kt-text-primary)",
              }}
            />
          </div>

          {/* Duration badge */}
          <div
            className="absolute right-3 pointer-events-none text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded"
            style={{ top: RULER_H + 2, color: "var(--kt-text-tertiary)", background: "var(--kt-badge-bg)" }}
          >
            {formatTime(clip.trimOut - clip.trimIn)} / {formatTime(clip.sourceDuration)}
          </div>
        </>
      )}
    </div>
  );
}
