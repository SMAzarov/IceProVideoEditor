"use client";

import { useRef, useState, useLayoutEffect, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { TimelineRuler } from "./TimelineRuler";
import { TrackRow } from "./TrackRow";
import { PlayheadScrubber } from "./PlayheadScrubber";
import { timeToPixels } from "@/lib/timeline/timeUtils";

const TRACK_HEIGHT = 48; // px, matches h-12

export function Timeline() {
  const tracks = useEditorStore((s) => s.tracks);
  const duration = useEditorStore((s) => s.duration);
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const setSelectedClip = useEditorStore((s) => s.setSelectedClip);

  const scrollRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [containerWidth, setContainerWidth] = useState(800);

  // Track label width offset
  const TRACK_LABEL_WIDTH = 96;

  const totalWidth = Math.max(timeToPixels(duration + 30, zoom), containerWidth);
  const totalTracksHeight = tracks.length * TRACK_HEIGHT;

  // Observe the outer (fixed-size) wrapper — not the inner scrollable div whose
  // width changes with content, which would cause an infinite ResizeObserver loop.
  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setContainerWidth((prev) => (prev === w ? prev : w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(e.currentTarget.scrollLeft);
  }, []);

  // Zoom on Ctrl+Wheel
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        setZoom(zoom * factor);
      }
    },
    [zoom, setZoom]
  );

  return (
    <div ref={outerRef} className="flex flex-col border-t select-none" style={{ minHeight: 160, background: "var(--kt-bg-deep)", borderColor: "var(--kt-border-strong)" }}>
      {/* Zoom controls */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b" style={{ borderColor: "var(--kt-border-strong)", background: "var(--kt-bg-surface)" }}>
        <span className="text-xs" style={{ color: "var(--kt-text-muted)" }}>Timeline</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs" style={{ color: "var(--kt-text-muted)" }}>{Math.round(zoom)}px/s</span>
          <button
            onClick={() => setZoom(zoom / 1.25)}
            className="w-5 h-5 flex items-center justify-center kt-btn-subtle rounded text-xs transition-colors"
          >
            -
          </button>
          <button
            onClick={() => setZoom(zoom * 1.25)}
            className="w-5 h-5 flex items-center justify-center kt-btn-subtle rounded text-xs transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Scrollable timeline area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-hidden"
        data-timeline
        onScroll={onScroll}
        onWheel={onWheel}
        onClick={() => setSelectedClip(null)}
      >
        <div className="flex" style={{ width: totalWidth + TRACK_LABEL_WIDTH }}>
          {/* Ruler + tracks column layout */}
          <div className="flex flex-col flex-1">
            {/* Ruler row */}
            <div className="flex h-7 border-b sticky top-0 z-10" style={{ borderColor: "var(--kt-border-strong)", background: "var(--kt-bg-deep)" }}>
              <div className="w-24 shrink-0 border-r" style={{ borderColor: "var(--kt-border-strong)" }} />
              <div className="relative flex-1 overflow-hidden">
                <TimelineRuler scrollLeft={scrollLeft} containerWidth={containerWidth - TRACK_LABEL_WIDTH} />
                <PlayheadScrubber totalHeight={totalTracksHeight + 28} />
              </div>
            </div>

            {/* Track rows */}
            {tracks.map((track) => (
              <TrackRow key={track.id} track={track} totalWidth={totalWidth} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
