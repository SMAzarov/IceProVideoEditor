"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEditorStore } from "@/store/editorStore";
import { Slider } from "@/components/ui/Slider";
import { DEFAULT_EFFECTS, EffectParams } from "@/types/editor";

export function EffectsPanel() {
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const clips = useEditorStore((s) => s.clips);
  const clipEffects = useEditorStore((s) => s.clipEffects);
  const setClipEffect = useEditorStore((s) => s.setClipEffect);
  const resetClipEffects = useEditorStore((s) => s.resetClipEffects);

  const selectedClip = clips.find((c) => c.id === selectedClipId);
  const effects: EffectParams = selectedClipId
    ? (clipEffects[selectedClipId] ?? DEFAULT_EFFECTS)
    : DEFAULT_EFFECTS;

  return (
    <AnimatePresence>
      {selectedClip && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 256, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="overflow-hidden border-l"
          style={{ borderColor: "var(--kt-border-strong)", background: "var(--kt-bg-surface)" }}
        >
          <div className="w-64 h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--kt-border-strong)" }}>
              <h3 className="text-sm font-semibold" style={{ color: "var(--kt-text-primary)" }}>Effects</h3>
              <button
                onClick={() => selectedClipId && resetClipEffects(selectedClipId)}
                className="text-xs kt-btn-ghost transition-colors"
              >
                Reset
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--kt-text-muted)" }}>
                  Adjustments
                </p>
                <div className="space-y-4">
                  <Slider
                    label="Brightness"
                    value={effects.brightness}
                    min={-100}
                    max={100}
                    onValueChange={(v) =>
                      selectedClipId && setClipEffect(selectedClipId, "brightness", v)
                    }
                  />
                  <Slider
                    label="Contrast"
                    value={effects.contrast}
                    min={-100}
                    max={100}
                    onValueChange={(v) =>
                      selectedClipId && setClipEffect(selectedClipId, "contrast", v)
                    }
                  />
                  <Slider
                    label="Saturation"
                    value={effects.saturation}
                    min={-100}
                    max={100}
                    onValueChange={(v) =>
                      selectedClipId && setClipEffect(selectedClipId, "saturation", v)
                    }
                  />
                  <Slider
                    label="Opacity"
                    value={Math.round(effects.opacity * 100)}
                    min={0}
                    max={100}
                    displayValue={`${Math.round(effects.opacity * 100)}%`}
                    onValueChange={(v) =>
                      selectedClipId && setClipEffect(selectedClipId, "opacity", v / 100)
                    }
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--kt-text-muted)" }}>
                  Transform
                </p>
                <div className="space-y-4">
                  <Slider
                    label="Rotation"
                    value={effects.rotation}
                    min={-180}
                    max={180}
                    displayValue={`${effects.rotation}°`}
                    onValueChange={(v) =>
                      selectedClipId && setClipEffect(selectedClipId, "rotation", v)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
