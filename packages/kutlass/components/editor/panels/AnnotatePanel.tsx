"use client";

import { useEditorStore } from "@/store/editorStore";

const COLORS = ["#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00cfff", "#ffffff", "#000000"];
const WIDTHS = [2, 4, 8, 16];

export function AnnotatePanel() {
  const drawingTool = useEditorStore((s) => s.drawingTool);
  const drawingColor = useEditorStore((s) => s.drawingColor);
  const drawingWidth = useEditorStore((s) => s.drawingWidth);
  const setDrawingTool = useEditorStore((s) => s.setDrawingTool);
  const setDrawingColor = useEditorStore((s) => s.setDrawingColor);
  const setDrawingWidth = useEditorStore((s) => s.setDrawingWidth);
  const undoStroke = useEditorStore((s) => s.undoStroke);
  const clearStrokes = useEditorStore((s) => s.clearStrokes);
  const strokes = useEditorStore((s) => s.strokes);

  return (
    <div className="shrink-0 border-t px-3 md:px-5 py-3" style={{ borderColor: "var(--kt-border)", background: "var(--kt-bg-panel)" }}>
      <div className="flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-6">

        {/* Tool selector */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--kt-text-muted)" }}>Tool</span>
          <div className="flex gap-1">
            <button
              onClick={() => setDrawingTool("pen")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                drawingTool === "pen"
                  ? "kt-btn-accent"
                  : "kt-btn-subtle"
              }`}
            >
              Pen
            </button>
            <button
              onClick={() => setDrawingTool("eraser")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                drawingTool === "eraser"
                  ? "kt-btn-accent"
                  : "kt-btn-subtle"
              }`}
            >
              Eraser
            </button>
          </div>
        </div>

        {/* Color swatches */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--kt-text-muted)" }}>Color</span>
          <div className="flex gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setDrawingColor(c)}
                className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  background: c,
                  borderColor: drawingColor === c ? "var(--kt-text-primary)" : "transparent",
                  boxShadow: c === "#ffffff" ? "inset 0 0 0 1px var(--kt-border)" : undefined,
                }}
              />
            ))}
          </div>
        </div>

        {/* Stroke width */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--kt-text-muted)" }}>Width</span>
          <div className="flex gap-1 items-center">
            {WIDTHS.map((w) => (
              <button
                key={w}
                onClick={() => setDrawingWidth(w)}
                className={`flex items-center justify-center w-8 h-7 rounded transition-colors ${
                  drawingWidth === w ? "" : "kt-btn-subtle"
                }`}
                style={drawingWidth === w ? { background: "var(--kt-accent-subtle-bg)", boxShadow: "inset 0 0 0 1px var(--kt-accent)" } : undefined}
              >
                <div
                  className="rounded-full"
                  style={{ background: "var(--kt-slider-thumb)", width: Math.min(w * 2, 20), height: Math.min(w / 2 + 2, 8) }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 md:ml-auto">
          <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--kt-text-muted)" }}>Actions</span>
          <div className="flex gap-1">
            <button
              onClick={undoStroke}
              disabled={strokes.length === 0}
              className="px-3 py-1.5 rounded text-xs font-medium kt-btn-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Undo
            </button>
            <button
              onClick={clearStrokes}
              disabled={strokes.length === 0}
              className="px-3 py-1.5 rounded text-xs font-medium kt-btn-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ color: "var(--kt-danger)" }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
