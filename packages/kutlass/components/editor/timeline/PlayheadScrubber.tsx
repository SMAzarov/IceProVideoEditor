"use client";

import { useEditorStore } from "@/store/editorStore";
import { timeToPixels } from "@/lib/timeline/timeUtils";

interface PlayheadScrubberProps {
  totalHeight: number;
}

export function PlayheadScrubber({ totalHeight }: PlayheadScrubberProps) {
  const currentTime = useEditorStore((s) => s.currentTime);
  const zoom = useEditorStore((s) => s.zoom);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const duration = useEditorStore((s) => s.duration);

  const left = timeToPixels(currentTime, zoom);

  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!(e.buttons & 1)) return;
    const rulerEl = (e.currentTarget as HTMLElement).parentElement;
    if (!rulerEl) return;
    const rect = rulerEl.getBoundingClientRect();
    const scrollLeft = rulerEl.closest("[data-timeline]")?.scrollLeft ?? 0;
    const x = e.clientX - rect.left + scrollLeft;
    setCurrentTime(Math.max(0, Math.min(x / zoom, duration)));
  };

  return (
    <div
      className="absolute top-0 z-20 flex flex-col items-center pointer-events-auto cursor-col-resize"
      style={{ left, transform: "translateX(-50%)" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    >
      {/* Diamond head */}
      <div className="w-2.5 h-2.5 rotate-45 mt-0.5 shrink-0" style={{ background: "var(--kt-danger-btn)" }} />
      {/* Stem */}
      <div
        className="w-px"
        style={{ background: "var(--kt-danger-btn)", opacity: 0.7, height: totalHeight }}
      />
    </div>
  );
}
