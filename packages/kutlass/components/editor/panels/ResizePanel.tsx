"use client";

import { useEditorStore } from "@/store/editorStore";
import { ExportSettings } from "@/types/editor";

const RESOLUTIONS: { label: string; value: ExportSettings["resolution"]; desc: string }[] = [
  { label: "Original", value: "original", desc: "Keep source resolution" },
  { label: "1080p", value: "1080p", desc: "1920 × 1080" },
  { label: "720p", value: "720p", desc: "1280 × 720" },
  { label: "480p", value: "480p", desc: "854 × 480" },
];

const FPS_OPTIONS: { label: string; value: ExportSettings["fps"] }[] = [
  { label: "24 fps", value: 24 },
  { label: "30 fps", value: 30 },
  { label: "60 fps", value: 60 },
];

export function ResizePanel() {
  const settings = useEditorStore((s) => s.settings);
  const updateSettings = useEditorStore((s) => s.updateExportSettings);

  return (
    <div className="shrink-0 border-t px-3 md:px-5 py-3 max-h-[160px] overflow-y-auto" style={{ borderColor: "var(--kt-border)", background: "var(--kt-bg-panel)" }}>
      <div className="flex flex-col md:flex-row gap-3 md:gap-8">
        {/* Resolution */}
        <div className="flex-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--kt-text-muted)" }}>Resolution</span>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {RESOLUTIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => updateSettings({ resolution: r.value })}
                title={r.desc}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${settings.resolution === r.value ? "kt-chip-active" : "kt-chip"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* FPS */}
        <div className="flex-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--kt-text-muted)" }}>Frame Rate</span>
          <div className="flex gap-1.5 mt-2">
            {FPS_OPTIONS.map((f) => (
              <button
                key={f.value}
                onClick={() => updateSettings({ fps: f.value })}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${settings.fps === f.value ? "kt-chip-active" : "kt-chip"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div className="flex-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--kt-text-muted)" }}>Format</span>
          <div className="flex gap-1.5 mt-2">
            {(["mp4", "webm"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => updateSettings({ format: fmt })}
                className={`px-2.5 py-1 rounded text-xs font-medium uppercase transition-colors ${settings.format === fmt ? "kt-chip-active" : "kt-chip"}`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
