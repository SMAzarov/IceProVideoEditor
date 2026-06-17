"use client";

import { useRef, useEffect, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { ShapeAnnotation } from "@/types/editor";
import { drawShapesOnCtx } from "@/lib/webcodecs/PreviewEngine";

interface ShapeOverlayProps {
  isActive: boolean;
}

/** Check if a point (normalized 0-1) hits a shape */
function hitTest(px: number, py: number, shape: ShapeAnnotation): boolean {
  // For text shapes with zero dimensions, use a default hit area
  const w = shape.width > 0 ? shape.width : 0.2;
  const h = shape.height > 0 ? shape.height : 0.1;
  const hw = w / 2;
  const hh = h / 2;
  const left = shape.x - hw;
  const right = shape.x + hw;
  const top = shape.y - hh;
  const bottom = shape.y + hh;

  if (shape.type === "rectangle" || shape.type === "text") {
    return px >= left && px <= right && py >= top && py <= bottom;
  }

  if (shape.type === "circle") {
    // Ellipse hit test
    const dx = (px - shape.x) / hw;
    const dy = (py - shape.y) / hh;
    return dx * dx + dy * dy <= 1;
  }

  return false;
}

export function ShapeOverlay({ isActive }: ShapeOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draggingRef = useRef<{
    shapeId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const annotateMode = useEditorStore((s) => s.annotateMode);
  const selectedShapeId = useEditorStore((s) => s.selectedShapeId);
  const selectShape = useEditorStore((s) => s.selectShape);
  const updateShape = useEditorStore((s) => s.updateShape);

  const isShapeMode = isActive && annotateMode === "shape";

  // ── Render shapes on canvas ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const { shapes, currentTime } = useEditorStore.getState();
      const visible = shapes.filter(
        (s) => s.startTime <= currentTime && currentTime < s.endTime
      );

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawShapesOnCtx(ctx, visible, canvas.width, canvas.height);

      // Highlight selected shape
      const selected = visible.find((s) => s.id === selectedShapeId);
      if (selected) {
        const cx = selected.x * canvas.width;
        const cy = selected.y * canvas.height;
        const sw = selected.width * canvas.width;
        const sh = selected.height * canvas.height;
        const halfW = sw / 2;
        const halfH = sh / 2;

        ctx.save();
        ctx.strokeStyle = "#00aaff";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(cx - halfW - 4, cy - halfH - 4, sw + 8, sh + 8);
        ctx.restore();
      }
    };

    render();

    const unsub = useEditorStore.subscribe(() => {
      if (!draggingRef.current) render();
    });

    return unsub;
  }, [selectedShapeId]);

  // ── Pointer handlers for drag ────────────────────────────────────────────
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
      if (!isShapeMode) return;
      const pt = getRelative(e);
      const { shapes, currentTime } = useEditorStore.getState();
      const visible = shapes.filter(
        (s) => s.startTime <= currentTime && currentTime < s.endTime
      );

      // Find topmost shape under cursor (iterate in reverse for z-order)
      let hit: ShapeAnnotation | null = null;
      for (let i = visible.length - 1; i >= 0; i--) {
        if (hitTest(pt.x, pt.y, visible[i])) {
          hit = visible[i];
          break;
        }
      }

      if (hit) {
        selectShape(hit.id);
        e.currentTarget.setPointerCapture(e.pointerId);
        draggingRef.current = {
          shapeId: hit.id,
          startX: pt.x,
          startY: pt.y,
          origX: hit.x,
          origY: hit.y,
        };
      } else {
        selectShape(null);
      }
    },
    [isShapeMode, getRelative, selectShape]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      const pt = getRelative(e);
      const dx = pt.x - draggingRef.current.startX;
      const dy = pt.y - draggingRef.current.startY;

      const newX = Math.max(0, Math.min(1, draggingRef.current.origX + dx));
      const newY = Math.max(0, Math.min(1, draggingRef.current.origY + dy));

      updateShape(draggingRef.current.shapeId, { x: newX, y: newY });

      // Re-render shapes on this canvas
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { shapes, currentTime } = useEditorStore.getState();
      const visible = shapes.filter(
        (s) => s.startTime <= currentTime && currentTime < s.endTime
      );
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawShapesOnCtx(ctx, visible, canvas.width, canvas.height);

      // Re-highlight selected
      const selected = visible.find((s) => s.id === draggingRef.current!.shapeId);
      if (selected) {
        const cx = selected.x * canvas.width;
        const cy = selected.y * canvas.height;
        const sw = selected.width * canvas.width;
        const sh = selected.height * canvas.height;
        const halfW = sw / 2;
        const halfH = sh / 2;
        ctx.save();
        ctx.strokeStyle = "#00aaff";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(cx - halfW - 4, cy - halfH - 4, sw + 8, sh + 8);
        ctx.restore();
      }
    },
    [getRelative, updateShape]
  );

  const onPointerUp = useCallback(() => {
    if (draggingRef.current) {
      // Trigger a full render via usePlayback subscription
      useEditorStore.getState().setCurrentTime(useEditorStore.getState().currentTime);
    }
    draggingRef.current = null;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={1280}
      height={720}
      className="absolute inset-0 w-full h-full"
      style={{
        zIndex: 17,
        cursor: isShapeMode ? (selectedShapeId ? "move" : "pointer") : "none",
        pointerEvents: isShapeMode ? "auto" : "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    />
  );
}
