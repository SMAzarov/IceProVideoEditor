"use client";

import { useEditorStore } from "@/store/editorStore";
import { useShallow } from "zustand/react/shallow";
import { Track } from "@/types/editor";
import { ClipBlock } from "./ClipBlock";

interface TrackRowProps {
  track: Track;
  totalWidth: number;
}

const TRACK_ICONS: Record<string, string> = {
  video: "🎬",
  audio: "🎵",
  text: "T",
  effects: "✨",
};

export function TrackRow({ track, totalWidth }: TrackRowProps) {
  const clips = useEditorStore(useShallow((s) => s.clips.filter((c) => c.trackId === track.id)));

  return (
    <div className="flex h-12 border-b" style={{ borderColor: "var(--kt-border)" }}>
      {/* Track label */}
      <div className="w-24 shrink-0 flex items-center gap-2 px-3 border-r" style={{ borderColor: "var(--kt-border-strong)", background: "var(--kt-bg-surface)" }}>
        <span className="text-sm">{TRACK_ICONS[track.type] ?? "?"}</span>
        <span className="text-xs truncate" style={{ color: "var(--kt-text-tertiary)" }}>{track.name}</span>
      </div>

      {/* Clip area */}
      <div className="relative flex-1 overflow-hidden" style={{ width: totalWidth, background: "var(--kt-bg-deep)" }}>
        {clips.map((clip) => (
          <ClipBlock key={clip.id} clip={clip} />
        ))}
      </div>
    </div>
  );
}
