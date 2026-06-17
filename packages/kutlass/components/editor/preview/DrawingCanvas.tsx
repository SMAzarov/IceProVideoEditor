"use client";

import { useRef, useEffect, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { Stroke } from "@/store/slices/drawingSlice";

interface DrawingCanvasProps {
  isActive: boolean;
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
    if (stroke.tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = stroke.color;
    }
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x * w, stroke.points[0].y * h);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x * w, stroke.points[i].y * h);
    }
    ctx.stroke();
    ctx.restore();
  }
}

export function DrawingCanvas({ isActive }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeStrokeRef = useRef<{ x: number; y: number }[]>([]);
  const isDrawingRef = useRef(false);

  const strokes = useEditorStore((s) => s.strokes);
  const drawingTool = useEditorStore((s) => s.drawingTool);
  const drawingColor = useEditorStore((s) => s.drawingColor);
  const drawingWidth = useEditorStore((s) => s.drawingWidth);
  const addStroke = useEditorStore((s) => s.addStroke);

  // Re-render stored strokes whenever they change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderStrokes(ctx, strokes, canvas.width, canvas.height);
  }, [strokes]);

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
      e.currentTarget.setPointerCapture(e.pointerId);
      isDrawingRef.current = true;
      const pt = getRelative(e);
      activeStrokeRef.current = [pt];
    },
    [isActive, getRelative]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawingRef.current || !isActive) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const pt = getRelative(e);
      activeStrokeRef.current.push(pt);

      // Live preview: re-render stored strokes + current in-progress stroke
      renderStrokes(ctx, strokes, canvas.width, canvas.height);

      const pts = activeStrokeRef.current;
      if (pts.length < 2) return;
      ctx.save();
      if (drawingTool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = drawingColor;
      }
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
    },
    [isActive, strokes, drawingTool, drawingColor, drawingWidth, getRelative]
  );

  const onPointerUp = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const pts = activeStrokeRef.current;
    if (pts.length >= 2) {
      addStroke({
        id: crypto.randomUUID(),
        tool: drawingTool,
        color: drawingColor,
        width: drawingWidth,
        points: pts,
      });
    }
    activeStrokeRef.current = [];
  }, [addStroke, drawingTool, drawingColor, drawingWidth]);

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
