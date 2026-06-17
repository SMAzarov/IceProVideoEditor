"use client";

import { useEditorStore } from "@/store/editorStore";
import { formatTime, getRulerTickInterval, timeToPixels } from "@/lib/timeline/timeUtils";

interface TimelineRulerProps {
  scrollLeft: number;
  containerWidth: number;
}

export function TimelineRuler({ scrollLeft, containerWidth }: TimelineRulerProps) {
  const zoom = useEditorStore((s) => s.zoom);
  const duration = useEditorStore((s) => s.duration);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);

  const totalWidth = Math.max(timeToPixels(duration + 10, zoom), containerWidth);
  const { major, minor } = getRulerTickInterval(zoom);

  const ticks: { time: number; isMajor: boolean }[] = [];
  const visibleStart = scrollLeft / zoom;
  const visibleEnd = (scrollLeft + containerWidth) / zoom;

  // Generate ticks only for visible range + small buffer
  const startTime = Math.floor(visibleStart / minor) * minor;
  const endTime = Math.ceil(visibleEnd / minor) * minor;

  for (let t = startTime; t <= endTime; t += minor) {
    if (t < 0) continue;
    ticks.push({ time: t, isMajor: Math.abs(t % major) < minor / 2 });
  }

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollLeft;
    setCurrentTime(x / zoom);
  };

  return (
    <div
      className="relative h-7 cursor-pointer select-none shrink-0"
      style={{ width: totalWidth }}
      onClick={handleClick}
    >
      {ticks.map(({ time, isMajor }) => (
        <div
          key={time}
          className="absolute top-0 flex flex-col items-start"
          style={{ left: timeToPixels(time, zoom) }}
        >
          <div
            className={`w-px ${isMajor ? "h-4" : "h-2"}`}
            style={{ background: isMajor ? "var(--kt-tick-major)" : "var(--kt-tick-minor)" }}
          />
          {isMajor && (
            <span className="text-[10px] ml-1 leading-none mt-0.5" style={{ color: "var(--kt-text-muted)" }}>
              {formatTime(time)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
