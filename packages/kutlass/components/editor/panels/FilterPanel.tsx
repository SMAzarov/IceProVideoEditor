"use client";

import { useEditorStore } from "@/store/editorStore";
import { DEFAULT_EFFECTS, EffectParams } from "@/types/editor";

interface FilterPreset {
  id: string;
  label: string;
  effects: Partial<EffectParams>;
  // CSS filter string for thumbnail preview
  cssFilter: string;
}

const PRESETS: FilterPreset[] = [
  {
    id: "original",
    label: "Original",
    effects: { brightness: 0, contrast: 0, saturation: 0 },
    cssFilter: "none",
  },
  {
    id: "vivid",
    label: "Vivid",
    effects: { brightness: 10, contrast: 20, saturation: 40 },
    cssFilter: "brightness(1.1) contrast(1.2) saturate(1.4)",
  },
  {
    id: "warm",
    label: "Warm",
    effects: { brightness: 8, contrast: 5, saturation: 15 },
    cssFilter: "brightness(1.08) contrast(1.05) saturate(1.15) sepia(0.2)",
  },
  {
    id: "cool",
    label: "Cool",
    effects: { brightness: 5, contrast: 10, saturation: -10 },
    cssFilter: "brightness(1.05) contrast(1.1) saturate(0.9) hue-rotate(20deg)",
  },
  {
    id: "bw",
    label: "B&W",
    effects: { brightness: 5, contrast: 15, saturation: -100 },
    cssFilter: "grayscale(1) brightness(1.05) contrast(1.15)",
  },
  {
    id: "fade",
    label: "Fade",
    effects: { brightness: 20, contrast: -20, saturation: -20 },
    cssFilter: "brightness(1.2) contrast(0.8) saturate(0.8)",
  },
  {
    id: "dramatic",
    label: "Dramatic",
    effects: { brightness: -5, contrast: 40, saturation: 20 },
    cssFilter: "brightness(0.95) contrast(1.4) saturate(1.2)",
  },
  {
    id: "film",
    label: "Film",
    effects: { brightness: -5, contrast: 10, saturation: -15 },
    cssFilter: "brightness(0.95) contrast(1.1) saturate(0.85) sepia(0.1)",
  },
  {
    id: "matte",
    label: "Matte",
    effects: { brightness: 15, contrast: -10, saturation: -30 },
    cssFilter: "brightness(1.15) contrast(0.9) saturate(0.7)",
  },
];

export function FilterPanel() {
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const clips = useEditorStore((s) => s.clips);
  const clipEffects = useEditorStore((s) => s.clipEffects);
  const setClipEffects = useEditorStore((s) => s.setClipEffects);

  const captureHistory = useEditorStore((s) => s.captureHistory);
  const targetId = selectedClipId ?? clips.find((c) => c.trackId === "track-video")?.id ?? null;
  const effects = targetId ? (clipEffects[targetId] ?? DEFAULT_EFFECTS) : DEFAULT_EFFECTS;

  // Detect active preset by matching brightness/contrast/saturation
  const activePreset = PRESETS.find(
    (p) =>
      (p.effects.brightness ?? 0) === effects.brightness &&
      (p.effects.contrast ?? 0) === effects.contrast &&
      (p.effects.saturation ?? 0) === effects.saturation
  )?.id ?? null;

  const applyPreset = (preset: FilterPreset) => {
    if (!targetId) return;
    captureHistory();
    setClipEffects(targetId, preset.effects);
  };

  return (
    <div className="shrink-0 border-t px-3 md:px-4 py-3" style={{ borderColor: "var(--kt-border)", background: "var(--kt-bg-panel)" }}>
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--kt-text-secondary)" }}>Filters</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            className="shrink-0 flex flex-col items-center gap-1.5 group"
          >
            {/* Color swatch preview */}
            <div
              className="w-14 h-10 rounded-md overflow-hidden border-2 transition-colors"
              style={{
                borderColor: activePreset === preset.id ? "var(--kt-accent)" : "transparent",
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  background: "linear-gradient(135deg, #6b7280 0%, #374151 50%, #9ca3af 100%)",
                  filter: preset.cssFilter,
                }}
              />
            </div>
            <span
              className="text-[10px] leading-none transition-colors"
              style={{ color: activePreset === preset.id ? "var(--kt-accent)" : "var(--kt-text-muted)" }}
            >
              {preset.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
