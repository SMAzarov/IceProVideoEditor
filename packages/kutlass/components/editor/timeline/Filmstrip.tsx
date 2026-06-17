"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useShallow } from "zustand/react/shallow";
import { formatTime } from "@/lib/timeline/timeUtils";
import { getDecoderForFile } from "@/lib/webcodecs/VideoDecoder";
import { Clip } from "@/types/editor";

const STRIP_HEIGHT = 52;
const WAVEFORM_H = 28;
const RULER_H = 20;
const TOTAL_H = RULER_H + STRIP_HEIGHT + WAVEFORM_H + 10;
const MIN_CLIP_DURATION = 0.1;


type DragState = {
  type: "scrub" | "trimStart" | "trimEnd" | "move";
  clipId: string | null;
  startX: number;
  startClipStartTime: number;
  startTrimIn: number;
  startTrimOut: number;
  startDuration: number;
  startSourceDuration: number;
};

async function extractWaveform(file: File, numSamples: number): Promise<Float32Array> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioCtx = new AudioContext();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    audioCtx.close();
    const channelData = audioBuffer.getChannelData(0);
    const blockSize = Math.max(1, Math.floor(channelData.length / numSamples));
    const peaks = new Float32Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
      let max = 0;
      const start = i * blockSize;
      for (let j = 0; j < blockSize; j++) {
        const abs = Math.abs(channelData[start + j] ?? 0);
        if (abs > max) max = abs;
      }
      peaks[i] = max;
    }
    return peaks;
  } catch {
    return new Float32Array(numSamples);
  }
}

function drawWaveform(canvas: HTMLCanvasElement, peaks: Float32Array, color?: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const h = canvas.height;
  const mid = h / 2;
  ctx.fillStyle = color ?? (getComputedStyle(canvas).getPropertyValue("--kt-accent").trim() || "rgba(251,191,36,0.55)");
  for (let i = 0; i < peaks.length; i++) {
    const amp = peaks[i] * mid;
    ctx.fillRect(i, mid - amp, 1, amp * 2 || 1);
  }
}

export function Filmstrip() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const dragRef = useRef<DragState | null>(null);

  const currentTime = useEditorStore((s) => s.currentTime);
  const duration = useEditorStore((s) => s.duration);
  const storeZoom = useEditorStore((s) => s.zoom);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const moveClip = useEditorStore((s) => s.moveClip);
  const trimClipStart = useEditorStore((s) => s.trimClipStart);
  const trimClipEnd = useEditorStore((s) => s.trimClipEnd);
  const captureHistory = useEditorStore((s) => s.captureHistory);
  const clips = useEditorStore(
    useShallow((s) => s.clips.filter((c) => c.trackId === "track-video"))
  );

  // Lock zoom during drag so trimClipEnd duration changes don't rescale the view
  const lockedZoomRef = useRef<number | null>(null);

  const [thumbnails, setThumbnails] = useState<Record<string, string[]>>({});
  const [waveforms, setWaveforms] = useState<Record<string, Float32Array>>({});
  const waveformCanvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth((prev) => {
        const w = entry.contentRect.width;
        return prev === w ? prev : w;
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Use lockedZoomRef during drag so trimClipEnd doesn't rescale the whole view
  const naturalZoom = duration > 0 && containerWidth > 0 ? containerWidth / duration : 80;
  const zoom = lockedZoomRef.current ?? naturalZoom;

  // Generate thumbnails
  useEffect(() => {
    if (containerWidth === 0) return;
    for (const clip of clips) {
      const thumbAspect = clip.width / clip.height;
      const thumbW = Math.round(STRIP_HEIGHT * thumbAspect);
      const clipPxWidth = clip.duration * zoom;
      const count = Math.max(2, Math.ceil(clipPxWidth / thumbW));
      if (thumbnails[clip.id]?.length === count) continue;

      const decoder = getDecoderForFile(clip.file);
      const promises = Array.from({ length: count }, (_, i) => {
        const t = clip.trimIn + (i / Math.max(count - 1, 1)) * (clip.trimOut - clip.trimIn);
        return decoder
          .requestFrame(clip.file, t)
          .then((frame) => {
            if (!frame) return null;
            const canvas = document.createElement("canvas");
            canvas.width = thumbW;
            canvas.height = STRIP_HEIGHT;
            const ctx = canvas.getContext("2d");
            if (ctx) ctx.drawImage(frame, 0, 0, thumbW, STRIP_HEIGHT);
            frame.close();
            return canvas.toDataURL("image/jpeg", 0.65);
          })
          .catch(() => null);
      });

      Promise.all(promises).then((results) => {
        const valid = results.filter(Boolean) as string[];
        if (valid.length > 0) {
          setThumbnails((prev) => ({ ...prev, [clip.id]: valid }));
        }
      });
    }
  }, [clips, containerWidth, zoom]);

  // Extract waveforms
  useEffect(() => {
    if (containerWidth === 0) return;
    for (const clip of clips) {
      if (waveforms[clip.id]) continue;
      const clipPxWidth = Math.round(clip.duration * zoom);
      extractWaveform(clip.file, Math.max(10, clipPxWidth)).then((peaks) => {
        setWaveforms((prev) => ({ ...prev, [clip.id]: peaks }));
      });
    }
  }, [clips, containerWidth, zoom]);

  // Draw waveforms onto canvas
  useEffect(() => {
    for (const [id, peaks] of Object.entries(waveforms)) {
      const canvas = waveformCanvasRefs.current[id];
      if (canvas) drawWaveform(canvas, peaks);
    }
  }, [waveforms]);

  // ─── Unified pointer-move / pointer-up on container ─────────────────────────
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const d = dragRef.current;
      if (!d || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      if (d.type === "scrub") {
        const x = e.clientX - rect.left;
        setCurrentTime(Math.max(0, Math.min(x / zoom, duration)));
        return;
      }

      if (!d.clipId) return;
      const dxSec = (e.clientX - d.startX) / zoom;

      if (d.type === "move") {
        moveClip(d.clipId, Math.max(0, d.startClipStartTime + dxSec));
      } else if (d.type === "trimStart") {
        const newTrimIn = Math.max(0, Math.min(d.startTrimIn + dxSec, d.startTrimOut - MIN_CLIP_DURATION));
        const delta = newTrimIn - d.startTrimIn;
        trimClipStart(d.clipId, newTrimIn, d.startClipStartTime + delta, d.startDuration - delta);
      } else if (d.type === "trimEnd") {
        const newTrimOut = Math.min(
          d.startSourceDuration,
          Math.max(d.startTrimOut + dxSec, d.startTrimIn + MIN_CLIP_DURATION)
        );
        const delta = newTrimOut - d.startTrimOut;
        trimClipEnd(d.clipId, newTrimOut, d.startDuration + delta);
      }
    },
    [containerWidth, duration, zoom, setCurrentTime, moveClip, trimClipStart, trimClipEnd]
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
    lockedZoomRef.current = null; // unlock — next render will use natural zoom
  }, []);

  /** Start a drag; capture pointer on the container and lock zoom for stability. */
  const beginDrag = useCallback(
    (e: React.PointerEvent, state: DragState) => {
      e.stopPropagation();
      containerRef.current?.setPointerCapture(e.pointerId);
      dragRef.current = state;
      // Freeze zoom so trimClipEnd duration changes don't rescale the view mid-drag
      if (lockedZoomRef.current === null) {
        const s = useEditorStore.getState();
        const dur = s.duration;
        const natZ = dur > 0 && containerWidth > 0 ? containerWidth / dur : 80;
        lockedZoomRef.current = natZ * (s.zoom / 80);
      }
    },
    [containerWidth]
  );

  const startScrub = useCallback(
    (e: React.PointerEvent) => {
      beginDrag(e, {
        type: "scrub",
        clipId: null,
        startX: e.clientX,
        startClipStartTime: 0,
        startTrimIn: 0,
        startTrimOut: 0,
        startDuration: 0,
        startSourceDuration: 0,
      });
      // Immediately seek on click
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        setCurrentTime(Math.max(0, Math.min(x / zoom, duration)));
      }
    },
    [beginDrag, containerWidth, duration, setCurrentTime]
  );

  const startTrimStart = useCallback(
    (e: React.PointerEvent, clip: Clip) => {
      captureHistory();
      beginDrag(e, {
        type: "trimStart",
        clipId: clip.id,
        startX: e.clientX,
        startClipStartTime: clip.startTime,
        startTrimIn: clip.trimIn,
        startTrimOut: clip.trimOut,
        startDuration: clip.duration,
        startSourceDuration: clip.sourceDuration,
      });
    },
    [beginDrag, captureHistory]
  );

  const startTrimEnd = useCallback(
    (e: React.PointerEvent, clip: Clip) => {
      captureHistory();
      beginDrag(e, {
        type: "trimEnd",
        clipId: clip.id,
        startX: e.clientX,
        startClipStartTime: clip.startTime,
        startTrimIn: clip.trimIn,
        startTrimOut: clip.trimOut,
        startDuration: clip.duration,
        startSourceDuration: clip.sourceDuration,
      });
    },
    [beginDrag, captureHistory]
  );

  const startMove = useCallback(
    (e: React.PointerEvent, clip: Clip) => {
      captureHistory();
      beginDrag(e, {
        type: "move",
        clipId: clip.id,
        startX: e.clientX,
        startClipStartTime: clip.startTime,
        startTrimIn: clip.trimIn,
        startTrimOut: clip.trimOut,
        startDuration: clip.duration,
        startSourceDuration: clip.sourceDuration,
      });
    },
    [beginDrag, captureHistory]
  );

  const pxOf = (sec: number) => (isFinite(zoom) && zoom > 0 ? sec * zoom : 0);

  // Ruler ticks
  const rulerTicks: { t: number; isMajor: boolean }[] = [];
  const totalSeconds = Math.ceil(duration);
  let majorInterval = 1;
  if (duration > 300) majorInterval = 60;
  else if (duration > 120) majorInterval = 30;
  else if (duration > 60) majorInterval = 10;
  else if (duration > 30) majorInterval = 5;
  const minorInterval = majorInterval / 5;
  for (let t = 0; t <= totalSeconds; t += minorInterval) {
    rulerTicks.push({ t, isMajor: Math.abs(t % majorInterval) < minorInterval / 2 });
  }

  return (
    <div
      ref={containerRef}
      className="shrink-0 relative border-t overflow-hidden select-none"
      style={{ borderColor: "var(--kt-border)", background: "var(--kt-bg-deep)", height: TOTAL_H }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {containerWidth > 0 && (
        <>
          {/* ── Ruler — click/drag to scrub ── */}
          <div
            className="absolute top-0 left-0 right-0 cursor-col-resize"
            style={{ height: RULER_H }}
            onPointerDown={startScrub}
          >
            {rulerTicks.map(({ t, isMajor }) => {
              const left = pxOf(t);
              return (
                <div key={t} className="absolute top-0 flex flex-col" style={{ left }}>
                  <div className={`w-px ${isMajor ? "h-2.5" : "h-1.5"}`} style={{ background: isMajor ? "var(--kt-tick-major)" : "var(--kt-tick-minor)" }} />
                  {isMajor && (
                    <span className="text-[9px] ml-1 leading-none tabular-nums" style={{ color: "var(--kt-text-muted)" }}>
                      {formatTime(t)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Thumbnail strips ── */}
          <div
            className="absolute left-0 right-0"
            style={{ top: RULER_H, height: STRIP_HEIGHT }}
          >
            {/* Click on empty area also scrubs */}
            <div
              className="absolute inset-0 cursor-col-resize"
              onPointerDown={startScrub}
            />

            {clips.map((clip) => {
              const left = pxOf(clip.startTime);
              const width = Math.max(pxOf(clip.duration), 4);
              const thumbs = thumbnails[clip.id] ?? [];
              // Show clip.thumbnails[0] as placeholder while filmstrip thumbs load
              const placeholder = clip.thumbnails[0] ?? null;

              return (
                <div
                  key={clip.id}
                  className="absolute top-0 overflow-hidden rounded"
                  style={{
                    left,
                    width,
                    height: STRIP_HEIGHT,
                    border: "2px solid var(--kt-accent-strong-border)",
                  }}
                >
                  {/* Thumbnail content */}
                  {thumbs.length > 0 ? (
                    <div className="flex h-full pointer-events-none">
                      {thumbs.map((src, i) => (
                        <img key={i} src={src} alt="" className="h-full flex-1 object-cover" draggable={false} />
                      ))}
                    </div>
                  ) : placeholder ? (
                    <img src={placeholder} alt="" className="w-full h-full object-cover pointer-events-none" draggable={false} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center pointer-events-none" style={{ background: "var(--kt-bg-surface)" }}>
                      <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "var(--kt-spinner-border)", borderTopColor: "var(--kt-spinner-top)" }} />
                    </div>
                  )}

                  {/* Clip name */}
                  <div className="absolute top-1 left-4 text-[9px] font-medium truncate max-w-[60%] pointer-events-none leading-none px-1 rounded" style={{ color: "var(--kt-text-secondary)", background: "var(--kt-bg-overlay)" }}>
                    {clip.name}
                  </div>

                  {/* ── Move handle — clip body (inside, above thumbnails) ── */}
                  <div
                    className="absolute"
                    style={{ top: 0, bottom: 0, left: 12, right: 12, cursor: "grab", zIndex: 2 }}
                    onPointerDown={(e) => startMove(e, clip)}
                  />

                  {/* ── Left trim handle ── */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-3 cursor-w-resize flex items-center justify-center"
                    style={{ zIndex: 3, background: "var(--kt-accent)" }}
                    onPointerDown={(e) => startTrimStart(e, clip)}
                  >
                    <div className="w-0.5 h-5 rounded-full pointer-events-none" style={{ background: "var(--kt-bg-overlay)" }} />
                  </div>

                  {/* ── Right trim handle ── */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-3 cursor-e-resize flex items-center justify-center"
                    style={{ zIndex: 3, background: "var(--kt-accent)" }}
                    onPointerDown={(e) => startTrimEnd(e, clip)}
                  >
                    <div className="w-0.5 h-5 rounded-full pointer-events-none" style={{ background: "var(--kt-bg-overlay)" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Waveform row ── */}
          <div
            className="absolute left-0 right-0 cursor-col-resize"
            style={{ top: RULER_H + STRIP_HEIGHT + 4, height: WAVEFORM_H }}
            onPointerDown={startScrub}
          >
            {clips.map((clip) => {
              const left = pxOf(clip.startTime);
              const width = Math.max(pxOf(clip.duration), 2);
              return (
                <div key={clip.id} className="absolute top-0 pointer-events-none" style={{ left, width, height: WAVEFORM_H, overflow: "hidden" }}>
                  <canvas
                    ref={(el) => { waveformCanvasRefs.current[clip.id] = el; }}
                    width={Math.round(width)}
                    height={WAVEFORM_H}
                    style={{ display: "block", width: "100%", height: "100%" }}
                  />
                  {!waveforms[clip.id] && (
                    <div className="absolute inset-0 flex items-center pointer-events-none">
                      <div className="w-full h-px" style={{ background: "var(--kt-border)" }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Playhead ── */}
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none"
            style={{ left: pxOf(currentTime) }}
          >
            {/* Time badge — the only scrub affordance in the playhead */}
            <div
              className="absolute -translate-x-1/2 border rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums pointer-events-auto cursor-col-resize"
              style={{ background: "var(--kt-time-badge-bg)", color: "var(--kt-text-primary)", borderColor: "var(--kt-time-badge-border)", top: 0 }}
              onPointerDown={startScrub}
            >
              {formatTime(currentTime)}
            </div>
            {/* Vertical line */}
            <div className="absolute w-px" style={{ background: "var(--kt-text-primary)", opacity: 0.8, top: 14, bottom: 0, left: 0, transform: "translateX(-50%)" }} />
            {/* Triangle head */}
            <div
              className="absolute -translate-x-1/2"
              style={{
                top: 13,
                width: 0, height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "6px solid var(--kt-text-primary)",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
