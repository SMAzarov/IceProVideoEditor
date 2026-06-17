"use client";

import { useRef, useEffect, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { Stroke } from "@/store/slices/drawingSlice";

interface DrawingCanvasProps {
  isActive: boolean;
}

/** Draw a triangular arrowhead at the end of a line segment. */
function drawArrowhead(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  headLength: number
) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.save();
  ctx.translate(toX, toY);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-headLength, -headLength * 0.4);
  ctx.lineTo(-headLength, headLength * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function renderStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[],
  w: number,
  h: number
) {
  ctx.clearRect(0, 0, w, h);
  for (const stroke of strokes) {
    if (stroke.points.length < 2) continue;
    ctx.save();

    const isEraser = stroke.tool === "eraser";
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.strokeStyle = isEraser ? "rgba(0,0,0,1)" : stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const p0 = stroke.points[0];
    const p1 = stroke.points[stroke.points.length - 1];
    const x0 = p0.x * w;
    const y0 = p0.y * h;
    const x1 = p1.x * w;
    const y1 = p1.y * h;

    if (stroke.tool === "arrow" || stroke.tool === "straight") {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      if (stroke.tool === "arrow") {
        ctx.fillStyle = isEraser ? "rgba(0,0,0,1)" : stroke.color;
        drawArrowhead(ctx, x0, y0, x1, y1, Math.max(12, stroke.width * 3));
      }
    } else if (stroke.tool === "curved") {
      if (stroke.points.length >= 3) {
        const cp = stroke.points[1];
        const cx = cp.x * w;
        const cy = cp.y * h;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(cx, cy, x1, y1);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
    } else {
      // pen / eraser — polyline through all points
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x * w, stroke.points[i].y * h);
      }
      ctx.stroke();
    }

    ctx.restore();
  }
}

export function DrawingCanvas({ isActive }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeStrokeRef = useRef<{ x: number; y: number }[]>([]);
  const isDrawingRef = useRef(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const freezeStartRef = useRef(0);

  const drawingTool = useEditorStore((s) => s.drawingTool);
  const drawingColor = useEditorStore((s) => s.drawingColor);
  const drawingWidth = useEditorStore((s) => s.drawingWidth);
  const addStroke = useEditorStore((s) => s.addStroke);
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const setPlaybackRate = useEditorStore((s) => s.setPlaybackRate);
  const addFreeze = useEditorStore((s) => s.addFreeze);

  // ── Subscribe to store changes for synced canvas updates ──────────────────
  // This runs synchronously whenever currentTime or strokes change,
  // ensuring the drawing canvas stays in sync with video playback.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initial render
    const { strokes, currentTime } = useEditorStore.getState();
    const visible = strokes.filter(
      (s) => s.startTime <= currentTime && currentTime < s.endTime
    );
    renderStrokes(ctx, visible, canvas.width, canvas.height);

    // Subscribe to store — runs synchronously on every state change
    const unsub = useEditorStore.subscribe(() => {
      const { strokes: s, currentTime: t } = useEditorStore.getState();
      const v = s.filter(
        (st) => st.startTime <= t && t < st.endTime
      );
      renderStrokes(ctx, v, canvas.width, canvas.height);
    });

    return unsub;
  }, []); // ← intentionally empty — runs once, subscription handles all updates

  const getRelative = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isActive) return;
      // Auto-pause video when starting to draw
      setPlaying(false);
      setPlaybackRate(0);
      // Save freeze start at current timeline position
      freezeStartRef.current = useEditorStore.getState().currentTime;
      e.currentTarget.setPointerCapture(e.pointerId);
      isDrawingRef.current = true;
      const pt = getRelative(e);
      startPointRef.current = pt;
      activeStrokeRef.current = [pt];
    },
    [isActive, getRelative, setPlaying, setPlaybackRate]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawingRef.current || !isActive) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const pt = getRelative(e);

      // Get current visible strokes from store for live preview
      const { strokes, currentTime } = useEditorStore.getState();
      const visibleStrokes = strokes.filter(
        (s) => s.startTime <= currentTime && currentTime < s.endTime
      );

      if (drawingTool === "pen" || drawingTool === "eraser") {
        activeStrokeRef.current.push(pt);
        renderStrokes(ctx, visibleStrokes, canvas.width, canvas.height);

        const pts = activeStrokeRef.current;
        if (pts.length < 2) return;
        ctx.save();
        const isEraser = drawingTool === "eraser";
        ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
        ctx.strokeStyle = isEraser ? "rgba(0,0,0,1)" : drawingColor;
        ctx.lineWidth = drawingWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(pts[0].x * canvas.width, pts[0].y * canvas.height);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x * canvas.width, pts[i].y * canvas.height);
        }
        ctx.stroke();
        ctx.restore();
      } else {
        activeStrokeRef.current = [startPointRef.current!, pt];
        renderStrokes(ctx, visibleStrokes, canvas.width, canvas.height);

        const p0 = startPointRef.current!;
        const x0 = p0.x * canvas.width;
        const y0 = p0.y * canvas.height;
        const x1 = pt.x * canvas.width;
        const y1 = pt.y * canvas.height;

        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = drawingColor;
        ctx.lineWidth = drawingWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (drawingTool === "curved") {
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();

          if (drawingTool === "arrow") {
            ctx.fillStyle = drawingColor;
            drawArrowhead(ctx, x0, y0, x1, y1, Math.max(12, drawingWidth * 3));
          }
        }
        ctx.restore();
      }
    },
    [isActive, drawingTool, drawingColor, drawingWidth, getRelative]
  );

  const onPointerUp = useCallback(
    () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      // Save freeze segment from start to current time
      const freezeEnd = useEditorStore.getState().currentTime;
      if (freezeEnd > freezeStartRef.current) {
        addFreeze(freezeStartRef.current, freezeEnd);
      }
      const pts = activeStrokeRef.current;

      if (drawingTool === "pen" || drawingTool === "eraser") {
        if (pts.length >= 2) {
          addStroke({
            id: crypto.randomUUID(),
            tool: drawingTool,
            color: drawingColor,
            width: drawingWidth,
            points: pts,
          });
        }
      } else if (drawingTool === "arrow" || drawingTool === "straight") {
        if (pts.length >= 2) {
          addStroke({
            id: crypto.randomUUID(),
            tool: drawingTool,
            color: drawingColor,
            width: drawingWidth,
            points: pts,
          });
        }
      } else if (drawingTool === "curved") {
        if (pts.length >= 2) {
          const start = pts[0];
          const end = pts[pts.length - 1];
          let control: { x: number; y: number };
          if (pts.length >= 3) {
            control = pts[Math.floor(pts.length / 2)];
          } else {
            const mx = (start.x + end.x) / 2;
            const my = (start.y + end.y) / 2;
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            control = { x: mx - dy / len * 0.15, y: my + dx / len * 0.15 };
          }
          addStroke({
            id: crypto.randomUUID(),
            tool: drawingTool,
            color: drawingColor,
            width: drawingWidth,
            points: [start, control, end],
          });
        }
      }

      activeStrokeRef.current = [];
      startPointRef.current = null;
    },
    [addStroke, drawingTool, drawingColor, drawingWidth, addFreeze]
  );

  return (
    <canvas
      ref={canvasRef}
      width={1280}
      height={720}
      className="absolute inset-0 w-full h-full"
      style={{
        zIndex: 18,
        cursor: isActive ? (drawingTool === "eraser" ? "cell" : "crosshair") : "none",
        pointerEvents: isActive ? "auto" : "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    />
  );
}
