"use client";

import { useRef, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { Clip } from "@/types/editor";
import { pixelsToTime, snapToFrame } from "@/lib/timeline/timeUtils";
import { snapTime } from "@/lib/timeline/clipUtils";

interface ClipBlockProps {
  clip: Clip;
}

export function ClipBlock({ clip }: ClipBlockProps) {
  const zoom = useEditorStore((s) => s.zoom);
  const clips = useEditorStore((s) => s.clips);
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const setSelectedClip = useEditorStore((s) => s.setSelectedClip);
  const moveClip = useEditorStore((s) => s.moveClip);
  const trimClipStart = useEditorStore((s) => s.trimClipStart);
  const trimClipEnd = useEditorStore((s) => s.trimClipEnd);
  const fps = useEditorStore((s) => s.fps);

  const isSelected = selectedClipId === clip.id;
  const dragStartX = useRef(0);
  const dragStartTime = useRef(0);
  const dragging = useRef<"move" | "trim-start" | "trim-end" | null>(null);

  const left = clip.startTime * zoom;
  const width = clip.duration * zoom;

  const onPointerDown = useCallback(
    (e: React.PointerEvent, mode: "move" | "trim-start" | "trim-end") => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedClip(clip.id);

      dragging.current = mode;
      dragStartX.current = e.clientX;
      dragStartTime.current = clip.startTime;

      const el = e.currentTarget as HTMLElement;
      el.setPointerCapture(e.pointerId);
    },
    [clip, setSelectedClip]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - dragStartX.current;
      const dt = pixelsToTime(dx, zoom);

      if (dragging.current === "move") {
        const newStart = snapToFrame(
          Math.max(0, dragStartTime.current + dt),
          fps
        );
        const snapped = snapTime(newStart, clips, pixelsToTime(8, zoom), clip.id);
        moveClip(clip.id, snapped);
      } else if (dragging.current === "trim-start") {
        const newTrimIn = Math.max(0, clip.trimIn + dt);
        const maxTrimIn = clip.trimOut - 0.1;
        const clampedTrimIn = Math.min(newTrimIn, maxTrimIn);
        const diff = clampedTrimIn - clip.trimIn;
        trimClipStart(
          clip.id,
          clampedTrimIn,
          clip.startTime + diff,
          clip.duration - diff
        );
        dragStartX.current = e.clientX;
      } else if (dragging.current === "trim-end") {
        const newTrimOut = Math.min(
          clip.sourceDuration,
          clip.trimOut + dt
        );
        const minTrimOut = clip.trimIn + 0.1;
        const clampedTrimOut = Math.max(newTrimOut, minTrimOut);
        const newDuration = clampedTrimOut - clip.trimIn;
        trimClipEnd(clip.id, clampedTrimOut, newDuration);
        dragStartX.current = e.clientX;
      }
    },
    [clip, zoom, fps, clips, moveClip, trimClipStart, trimClipEnd]
  );

  const onPointerUp = useCallback(() => {
    dragging.current = null;
  }, []);

  return (
    <div
      className="absolute top-1 bottom-1 rounded cursor-grab active:cursor-grabbing group"
      style={{
        left,
        width: Math.max(width, 4),
        background: isSelected
          ? "linear-gradient(to bottom, var(--kt-accent-play), var(--kt-accent-play-hover))"
          : "linear-gradient(to bottom, var(--kt-accent-play-hover), var(--kt-bg-deep))",
        borderWidth: 1,
        borderColor: isSelected ? "var(--kt-accent-play-bar)" : "var(--kt-accent-play)",
        borderStyle: "solid",
      }}
      onPointerDown={(e) => onPointerDown(e, "move")}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Clip label */}
      <div className="absolute inset-x-2 top-1 pointer-events-none">
        <p className="text-[11px] truncate font-medium leading-tight" style={{ color: "var(--kt-text-primary)" }}>
          {clip.name}
        </p>
      </div>

      {/* Left trim handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        onPointerDown={(e) => onPointerDown(e, "trim-start")}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="w-0.5 h-4 rounded-full" style={{ background: "var(--kt-text-faint)" }} />
      </div>

      {/* Right trim handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        onPointerDown={(e) => onPointerDown(e, "trim-end")}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="w-0.5 h-4 rounded-full" style={{ background: "var(--kt-text-faint)" }} />
      </div>
    </div>
  );
}
