"use client";

import { useEditorStore } from "@/store/editorStore";
import { DrawingTool } from "@/store/slices/drawingSlice";
import { ShapeType } from "@/types/editor";

const COLORS = ["#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00cfff", "#ffffff", "#000000"];
const WIDTHS = [2, 4, 8, 16];

const DRAWING_TOOLS: { key: DrawingTool; label: string }[] = [
  { key: "pen", label: "Pen" },
  { key: "eraser", label: "Eraser" },
  { key: "straight", label: "Line" },
  { key: "arrow", label: "Arrow" },
  { key: "curved", label: "Curve" },
];

const SHAPE_TOOLS: { key: ShapeType; label: string }[] = [
  { key: "rectangle", label: "□ Rect" },
  { key: "circle", label: "○ Circle" },
  { key: "text", label: "T Text" },
];

export function AnnotatePanel() {
  const drawingTool = useEditorStore((s) => s.drawingTool);
  const drawingColor = useEditorStore((s) => s.drawingColor);
  const drawingWidth = useEditorStore((s) => s.drawingWidth);
  const annotationDuration = useEditorStore((s) => s.annotationDuration);
  const setDrawingTool = useEditorStore((s) => s.setDrawingTool);
  const setDrawingColor = useEditorStore((s) => s.setDrawingColor);
  const setDrawingWidth = useEditorStore((s) => s.setDrawingWidth);
  const setAnnotationDuration = useEditorStore((s) => s.setAnnotationDuration);
  const undoStroke = useEditorStore((s) => s.undoStroke);
  const clearStrokes = useEditorStore((s) => s.clearStrokes);
  const strokes = useEditorStore((s) => s.strokes);

  // Shape state
  const shapeTool = useEditorStore((s) => s.shapeTool);
  const shapeColor = useEditorStore((s) => s.shapeColor);
  const shapeFillColor = useEditorStore((s) => s.shapeFillColor);
  const shapeStrokeWidth = useEditorStore((s) => s.shapeStrokeWidth);
  const shapeText = useEditorStore((s) => s.shapeText);
  const shapeFontSize = useEditorStore((s) => s.shapeFontSize);
  const shapeDuration = useEditorStore((s) => s.shapeDuration);
  const shapes = useEditorStore((s) => s.shapes);
  const selectedShapeId = useEditorStore((s) => s.selectedShapeId);
  const setShapeTool = useEditorStore((s) => s.setShapeTool);
  const setShapeColor = useEditorStore((s) => s.setShapeColor);
  const setShapeFillColor = useEditorStore((s) => s.setShapeFillColor);
  const setShapeStrokeWidth = useEditorStore((s) => s.setShapeStrokeWidth);
  const setShapeText = useEditorStore((s) => s.setShapeText);
  const setShapeFontSize = useEditorStore((s) => s.setShapeFontSize);
  const setShapeDuration = useEditorStore((s) => s.setShapeDuration);
  const addShape = useEditorStore((s) => s.addShape);
  const removeShape = useEditorStore((s) => s.removeShape);
  const clearShapes = useEditorStore((s) => s.clearShapes);
  const annotateMode = useEditorStore((s) => s.annotateMode);
  const setAnnotateMode = useEditorStore((s) => s.setAnnotateMode);

  return (
    <div className="shrink-0 border-t px-3 md:px-5 py-3" style={{ borderColor: "var(--kt-border)", background: "var(--kt-bg-panel)" }}>
      {/* Mode switcher */}
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setAnnotateMode("draw")}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            annotateMode === "draw" ? "kt-btn-accent" : "kt-btn-subtle"
          }`}
        >
          Draw
        </button>
        <button
          onClick={() => setAnnotateMode("shape")}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            annotateMode === "shape" ? "kt-btn-accent" : "kt-btn-subtle"
          }`}
        >
          Shapes
        </button>
      </div>

      {annotateMode === "draw" ? (
        <DrawTools
          drawingTool={drawingTool}
          drawingColor={drawingColor}
          drawingWidth={drawingWidth}
          annotationDuration={annotationDuration}
          setDrawingTool={setDrawingTool}
          setDrawingColor={setDrawingColor}
          setDrawingWidth={setDrawingWidth}
          setAnnotationDuration={setAnnotationDuration}
          undoStroke={undoStroke}
          clearStrokes={clearStrokes}
          strokes={strokes}
        />
      ) : (
        <ShapeTools
          shapeTool={shapeTool}
          shapeColor={shapeColor}
          shapeFillColor={shapeFillColor}
          shapeStrokeWidth={shapeStrokeWidth}
          shapeText={shapeText}
          shapeFontSize={shapeFontSize}
          shapeDuration={shapeDuration}
          shapes={shapes}
          selectedShapeId={selectedShapeId}
          setShapeTool={setShapeTool}
          setShapeColor={setShapeColor}
          setShapeFillColor={setShapeFillColor}
          setShapeStrokeWidth={setShapeStrokeWidth}
          setShapeText={setShapeText}
          setShapeFontSize={setShapeFontSize}
          setShapeDuration={setShapeDuration}
          addShape={addShape}
          removeShape={removeShape}
          clearShapes={clearShapes}
        />
      )}
    </div>
  );
}

// ── Draw tools (existing) ─────────────────────────────────────────────────────

function DrawTools({
  drawingTool,
  drawingColor,
  drawingWidth,
  annotationDuration,
  setDrawingTool,
  setDrawingColor,
  setDrawingWidth,
  setAnnotationDuration,
  undoStroke,
  clearStrokes,
  strokes,
}: {
  drawingTool: DrawingTool;
  drawingColor: string;
  drawingWidth: number;
  annotationDuration: number;
  setDrawingTool: (t: DrawingTool) => void;
  setDrawingColor: (c: string) => void;
  setDrawingWidth: (w: number) => void;
  setAnnotationDuration: (d: number) => void;
  undoStroke: () => void;
  clearStrokes: () => void;
  strokes: unknown[];
}) {
  return (
    <div className="flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-6">
      {/* Tool selector */}
      <div className="flex flex-col gap-1">
        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--kt-text-muted)" }}>Tool</span>
        <div className="flex gap-1 flex-wrap">
          {DRAWING_TOOLS.map((t) => (
            <button
              key={t.key}
              onClick={() => setDrawingTool(t.key)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                drawingTool === t.key ? "kt-btn-accent" : "kt-btn-subtle"
              }`}
            >
              {t.label}
            </button>
          ))}
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

      {/* Duration control */}
      <div className="flex flex-col gap-1">
        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--kt-text-muted)" }}>
          Duration: {annotationDuration}s
        </span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0.5}
            max={10}
            step={0.5}
            value={annotationDuration}
            onChange={(e) => setAnnotationDuration(parseFloat(e.target.value))}
            className="w-20 h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: "var(--kt-slider-track)",
              accentColor: "var(--kt-accent)",
            }}
          />
          <span className="text-xs tabular-nums" style={{ color: "var(--kt-text-secondary)", minWidth: 28 }}>
            {annotationDuration.toFixed(1)}s
          </span>
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
  );
}

// ── Shape tools ───────────────────────────────────────────────────────────────

function ShapeTools({
  shapeTool,
  shapeColor,
  shapeFillColor,
  shapeStrokeWidth,
  shapeText,
  shapeFontSize,
  shapeDuration,
  shapes,
  selectedShapeId,
  setShapeTool,
  setShapeColor,
  setShapeFillColor,
  setShapeStrokeWidth,
  setShapeText,
  setShapeFontSize,
  setShapeDuration,
  addShape,
  removeShape,
  clearShapes,
}: {
  shapeTool: ShapeType;
  shapeColor: string;
  shapeFillColor: string;
  shapeStrokeWidth: number;
  shapeText: string;
  shapeFontSize: number;
  shapeDuration: number;
  shapes: { id: string; type: ShapeType; text: string }[];
  selectedShapeId: string | null;
  setShapeTool: (t: ShapeType) => void;
  setShapeColor: (c: string) => void;
  setShapeFillColor: (c: string) => void;
  setShapeStrokeWidth: (w: number) => void;
  setShapeText: (t: string) => void;
  setShapeFontSize: (s: number) => void;
  setShapeDuration: (d: number) => void;
  addShape: (s: any) => string;
  removeShape: (id: string) => void;
  clearShapes: () => void;
}) {
  const handleAddShape = () => {
    addShape({
      type: shapeTool,
      x: 0.5,
      y: 0.5,
      width: 0.3,
      height: shapeTool === "text" ? 0.15 : 0.2,
      text: shapeTool === "text" ? shapeText : "",
      color: shapeColor,
      fillColor: shapeFillColor,
      strokeWidth: shapeStrokeWidth,
      fontSize: shapeFontSize,
    });
  };

  return (
    <div className="flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-6">
      {/* Shape type selector */}
      <div className="flex flex-col gap-1">
        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--kt-text-muted)" }}>Shape</span>
        <div className="flex gap-1 flex-wrap">
          {SHAPE_TOOLS.map((t) => (
            <button
              key={t.key}
              onClick={() => setShapeTool(t.key)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                shapeTool === t.key ? "kt-btn-accent" : "kt-btn-subtle"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stroke color */}
      <div className="flex flex-col gap-1">
        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--kt-text-muted)" }}>Stroke</span>
        <div className="flex gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setShapeColor(c)}
              className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                background: c,
                borderColor: shapeColor === c ? "var(--kt-text-primary)" : "transparent",
                boxShadow: c === "#ffffff" ? "inset 0 0 0 1px var(--kt-border)" : undefined,
              }}
            />
          ))}
        </div>
      </div>

      {/* Fill color */}
      <div className="flex flex-col gap-1">
        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--kt-text-muted)" }}>Fill</span>
        <div className="flex gap-1.5 items-center">
          <button
            onClick={() => setShapeFillColor("transparent")}
            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
              shapeFillColor === "transparent" ? "kt-btn-accent" : "kt-btn-subtle"
            }`}
          >
            None
          </button>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setShapeFillColor(c)}
              className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                background: c,
                borderColor: shapeFillColor === c ? "var(--kt-text-primary)" : "transparent",
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
              onClick={() => setShapeStrokeWidth(w)}
              className={`flex items-center justify-center w-8 h-7 rounded transition-colors ${
                shapeStrokeWidth === w ? "" : "kt-btn-subtle"
              }`}
              style={shapeStrokeWidth === w ? { background: "var(--kt-accent-subtle-bg)", boxShadow: "inset 0 0 0 1px var(--kt-accent)" } : undefined}
            >
              <div
                className="rounded-full"
                style={{ background: "var(--kt-slider-thumb)", width: Math.min(w * 2, 20), height: Math.min(w / 2 + 2, 8) }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Text input (for text shapes) */}
      {shapeTool === "text" && (
        <>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--kt-text-muted)" }}>Text</span>
            <input
              type="text"
              value={shapeText}
              onChange={(e) => setShapeText(e.target.value)}
              className="px-2 py-1 rounded text-xs border"
              style={{
                background: "var(--kt-bg-surface)",
                borderColor: "var(--kt-border)",
                color: "var(--kt-text-primary)",
                minWidth: 100,
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--kt-text-muted)" }}>
              Font: {shapeFontSize}px
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={12}
                max={120}
                step={2}
                value={shapeFontSize}
                onChange={(e) => setShapeFontSize(parseInt(e.target.value, 10))}
                className="w-20 h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: "var(--kt-slider-track)",
                  accentColor: "var(--kt-accent)",
                }}
              />
              <span className="text-xs tabular-nums" style={{ color: "var(--kt-text-secondary)", minWidth: 28 }}>
                {shapeFontSize}px
              </span>
            </div>
          </div>
        </>
      )}

      {/* Duration */}
      <div className="flex flex-col gap-1">
        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--kt-text-muted)" }}>
          Duration: {shapeDuration}s
        </span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0.5}
            max={10}
            step={0.5}
            value={shapeDuration}
            onChange={(e) => setShapeDuration(parseFloat(e.target.value))}
            className="w-20 h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: "var(--kt-slider-track)",
              accentColor: "var(--kt-accent)",
            }}
          />
          <span className="text-xs tabular-nums" style={{ color: "var(--kt-text-secondary)", minWidth: 28 }}>
            {shapeDuration.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 md:ml-auto">
        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--kt-text-muted)" }}>Actions</span>
        <div className="flex gap-1">
          <button
            onClick={handleAddShape}
            className="px-3 py-1.5 rounded text-xs font-medium kt-btn-accent transition-colors"
          >
            + Add
          </button>
          {selectedShapeId && (
            <button
              onClick={() => removeShape(selectedShapeId)}
              className="px-3 py-1.5 rounded text-xs font-medium kt-btn-subtle transition-colors"
              style={{ color: "var(--kt-danger)" }}
            >
              Delete
            </button>
          )}
          <button
            onClick={clearShapes}
            disabled={shapes.length === 0}
            className="px-3 py-1.5 rounded text-xs font-medium kt-btn-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            style={{ color: "var(--kt-danger)" }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
