"use client";

import { useEditorStore } from "@/store/editorStore";
import { formatTime } from "@/lib/timeline/timeUtils";
import { useCallback, useRef } from "react";

const SPEED_PRESETS = [0, 0.25, 0.5, 0.75, 1, 1.5, 2];

export function PlaybackControls() {
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const togglePlay = useEditorStore((s) => s.togglePlay);
  const currentTime = useEditorStore((s) => s.currentTime);
  const duration = useEditorStore((s) => s.duration);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const playbackRate = useEditorStore((s) => s.playbackRate);
  const setPlaybackRate = useEditorStore((s) => s.setPlaybackRate);
  const muted = useEditorStore((s) => s.muted);
  const toggleMuted = useEditorStore((s) => s.toggleMuted);

  const progressRef = useRef<HTMLDivElement>(null);

  const cycleSpeed = () => {
    const idx = SPEED_PRESETS.indexOf(playbackRate);
    const next = (idx + 1) % SPEED_PRESETS.length;
    setPlaybackRate(SPEED_PRESETS[next]);
  };

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (duration <= 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      setCurrentTime(Math.max(0, Math.min(duration, x * duration)));
    },
    [duration, setCurrentTime]
  );

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2 backdrop-blur-sm border-t" style={{ background: "var(--kt-bg-surface)", borderColor: "var(--kt-border-strong)" }}>
      {/* Rewind */}
      <button
        onClick={() => setCurrentTime(0)}
        className="kt-btn-ghost transition-colors"
        title="Go to start (Home)"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
        </svg>
      </button>

      {/* Play / Pause */}
      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg"
        style={{ background: "var(--kt-accent-play)", color: "var(--kt-text-primary)" }}
        title="Play/Pause (Space)"
        disabled={duration === 0}
      >
        {isPlaying ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Forward to end */}
      <button
        onClick={() => setCurrentTime(duration)}
        className="kt-btn-ghost transition-colors"
        title="Go to end (End)"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" />
        </svg>
      </button>

      {/* Mute / Unmute */}
      <button
        onClick={toggleMuted}
        className="kt-btn-ghost transition-colors"
        title={muted ? "Unmute (M)" : "Mute (M)"}
      >
        {muted ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Time display */}
      <div className="ml-1 md:ml-2 flex items-center gap-1 md:gap-1.5 font-mono text-xs md:text-sm">
        <span style={{ color: "var(--kt-text-primary)" }}>{formatTime(currentTime)}</span>
        <span style={{ color: "var(--kt-text-faint)" }}>/</span>
        <span style={{ color: "var(--kt-text-muted)" }}>{formatTime(duration)}</span>
      </div>

      {/* Progress bar with visible playhead */}
      <div
        ref={progressRef}
        className="flex-1 mx-1 md:mx-2 relative h-6 flex items-center cursor-pointer group"
        onClick={handleProgressClick}
      >
        <div className="absolute left-0 right-0 h-1.5 rounded-full" style={{ background: "var(--kt-slider-track)" }}>
          <div
            className="h-full rounded-full transition-none"
            style={{ width: `${pct}%`, background: "var(--kt-accent-play-bar)" }}
          />
        </div>
        {/* Visible playhead thumb */}
        <div
          className="absolute w-4 h-4 rounded-full shadow-md border-2 transition-transform group-hover:scale-125"
          style={{
            left: `calc(${pct}% - 8px)`,
            background: "var(--kt-accent-play)",
            borderColor: "var(--kt-text-primary)",
          }}
        />
        {/* Invisible wide range input for scrubbing */}
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.001}
          value={currentTime}
          onChange={(e) => setCurrentTime(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: 24 }}
        />
      </div>

      {/* Speed control */}
      <button
        onClick={cycleSpeed}
        className="kt-btn-ghost text-xs font-mono px-2 py-1 rounded transition-colors"
        style={{
          color: playbackRate !== 1 ? "var(--kt-accent)" : "var(--kt-text-muted)",
        }}
        title={`Speed: ${playbackRate}x (click to cycle, [ / ] to adjust)`}
      >
        {playbackRate === 0 ? "❚❚" : `${playbackRate}x`}
      </button>
    </div>
  );
}
