"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { ShapeAnnotation } from "@/types/editor";
import { drawShapesOnCtx } from "@/lib/webcodecs/PreviewEngine";

interface ShapeOverlayProps {
  isActive: boolean;
}

type Corner = "tl" | "tr" | "bl" | "br";

const HANDLE_SIZE = 8; // px
const HANDLE_HALF = HANDLE_SIZE / 2;

/** Check if a point (normalized 0-1) hits a shape */
function hitTest(px: number, py: number, shape: ShapeAnnotation): boolean {
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
    const dx = (px - shape.x) / hw;
    const dy = (py - shape.y) / hh;
    return dx * dx + dy * dy <= 1;
  }

  return false;
}

/** Get the bounding box of a shape in normalized coords */
function getShapeBounds(shape: ShapeAnnotation) {
  const w = shape.width > 0 ? shape.width : 0.2;
  const h = shape.height > 0 ? shape.height : 0.1;
  return {
    left: shape.x - w / 2,
    right: shape.x + w / 2,
    top: shape.y - h / 2,
    bottom: shape.y + h / 2,
    w,
    h,
  };
}

/** Detect which corner handle the pointer is on (normalized coords, canvas-aware) */
function hitCorner(
  px: number,
  py: number,
  shape: ShapeAnnotation,
  canvasW: number,
  canvasH: number
): Corner | null {
  const b = getShapeBounds(shape);
  const corners: { key: Corner; nx: number; ny: number }[] = [
    { key: "tl", nx: b.left, ny: b.top },
    { key: "tr", nx: b.right, ny: b.top },
    { key: "bl", nx: b.left, ny: b.bottom },
    { key: "br", nx: b.right, ny: b.bottom },
  ];
  const threshold = HANDLE_SIZE / Math.min(canvasW, canvasH);
  for (const c of corners) {
    if (Math.abs(px - c.nx) < threshold && Math.abs(py - c.ny) < threshold) {
      return c.key;
    }
  }
  return null;
}

export function ShapeOverlay({ isActive }: ShapeOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCorner, setHoveredCorner] = useState<Corner | null>(null);

  const draggingRef = useRef<{
    shapeId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const resizeRef = useRef<{
    shapeId: string;
    corner: Corner;
    startPx: number;
    startPy: number;
    origBounds: ReturnType<typeof getShapeBounds>;
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

      // Highlight selected shape + corner handles
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

        // Corner handles
        ctx.fillStyle = "#00aaff";
        const corners: [number, number][] = [
          [cx - halfW - 4, cy - halfH - 4],
          [cx + halfW + 4, cy - halfH - 4],
          [cx - halfW - 4, cy + halfH + 4],
          [cx + halfW + 4, cy + halfH + 4],
        ];
        corners.forEach(([hx, hy]) => {
          ctx.fillRect(hx - HANDLE_HALF, hy - HANDLE_HALF, HANDLE_SIZE, HANDLE_SIZE);
        });
        ctx.restore();
      }
    };

    render();

    const unsub = useEditorStore.subscribe(() => {
      if (!draggingRef.current && !resizeRef.current) render();
    });

    return unsub;
  }, [selectedShapeId]);

  // ── Pointer helpers ──────────────────────────────────────────────────────
  const getRelative = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  const getCanvasSize = useCallback(() => {
    const canvas = canvasRef.current!;
    return { cw: canvas.width, ch: canvas.height };
  }, []);

  // ── Pointer down ─────────────────────────────────────────────────────────
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isShapeMode) return;
      const pt = getRelative(e);
      const { cw, ch } = getCanvasSize();
      const { shapes, currentTime } = useEditorStore.getState();
      const visible = shapes.filter(
        (s) => s.startTime <= currentTime && currentTime < s.endTime
      );

      // Check if we hit a corner handle of the selected shape first
      const selected = visible.find((s) => s.id === selectedShapeId);
      if (selected) {
        const corner = hitCorner(pt.x, pt.y, selected, cw, ch);
        if (corner) {
          e.currentTarget.setPointerCapture(e.pointerId);
          resizeRef.current = {
            shapeId: selected.id,
            corner,
            startPx: pt.x,
            startPy: pt.y,
            origBounds: getShapeBounds(selected),
          };
          return;
        }
      }

      // Find topmost shape under cursor
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
    [isShapeMode, getRelative, getCanvasSize, selectedShapeId, selectShape]
  );

  // ── Pointer move ─────────────────────────────────────────────────────────
  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const pt = getRelative(e);
      const { cw, ch } = getCanvasSize();

      // Resize mode
      if (resizeRef.current) {
        const r = resizeRef.current;
        const dx = pt.x - r.startPx;
        const dy = pt.y - r.startPy;

        let newLeft = r.origBounds.left;
        let newRight = r.origBounds.right;
        let newTop = r.origBounds.top;
        let newBottom = r.origBounds.bottom;

        switch (r.corner) {
          case "tl":
            newLeft = r.origBounds.left + dx;
            newTop = r.origBounds.top + dy;
            break;
          case "tr":
            newRight = r.origBounds.right + dx;
            newTop = r.origBounds.top + dy;
            break;
          case "bl":
            newLeft = r.origBounds.left + dx;
            newBottom = r.origBounds.bottom + dy;
            break;
          case "br":
            newRight = r.origBounds.right + dx;
            newBottom = r.origBounds.bottom + dy;
            break;
        }

        // Clamp to 0-1 and enforce minimum size
        const MIN_SIZE = 0.02;
        let left = Math.max(0, Math.min(newLeft, newRight - MIN_SIZE));
        let right = Math.min(1, Math.max(newRight, left + MIN_SIZE));
        let top = Math.max(0, Math.min(newTop, newBottom - MIN_SIZE));
        let bottom = Math.min(1, Math.max(newBottom, top + MIN_SIZE));

        const newW = right - left;
        const newH = bottom - top;
        const newX = left + newW / 2;
        const newY = top + newH / 2;

        updateShape(r.shapeId, { x: newX, y: newY, width: newW, height: newH });

        // Re-render
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

        // Re-highlight
        const sel = visible.find((s) => s.id === r.shapeId);
        if (sel) {
          const cx = sel.x * canvas.width;
          const cy = sel.y * canvas.height;
          const sw = sel.width * canvas.width;
          const sh = sel.height * canvas.height;
          const halfW = sw / 2;
          const halfH = sh / 2;
          ctx.save();
          ctx.strokeStyle = "#00aaff";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(cx - halfW - 4, cy - halfH - 4, sw + 8, sh + 8);
          ctx.fillStyle = "#00aaff";
          const corners: [number, number][] = [
            [cx - halfW - 4, cy - halfH - 4],
            [cx + halfW + 4, cy - halfH - 4],
            [cx - halfW - 4, cy + halfH + 4],
            [cx + halfW + 4, cy + halfH + 4],
          ];
          corners.forEach(([hx, hy]) => {
            ctx.fillRect(hx - HANDLE_HALF, hy - HANDLE_HALF, HANDLE_SIZE, HANDLE_SIZE);
          });
          ctx.restore();
        }
        return;
      }

      // Drag mode
      if (draggingRef.current) {
        const dx = pt.x - draggingRef.current.startX;
        const dy = pt.y - draggingRef.current.startY;

        const newX = Math.max(0, Math.min(1, draggingRef.current.origX + dx));
        const newY = Math.max(0, Math.min(1, draggingRef.current.origY + dy));

        updateShape(draggingRef.current.shapeId, { x: newX, y: newY });

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

        const sel = visible.find((s) => s.id === draggingRef.current!.shapeId);
        if (sel) {
          const cx = sel.x * canvas.width;
          const cy = sel.y * canvas.height;
          const sw = sel.width * canvas.width;
          const sh = sel.height * canvas.height;
          const halfW = sw / 2;
          const halfH = sh / 2;
          ctx.save();
          ctx.strokeStyle = "#00aaff";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(cx - halfW - 4, cy - halfH - 4, sw + 8, sh + 8);
          ctx.restore();
        }
        return;
      }

      // Hover — detect corner for cursor
      if (isShapeMode && selectedShapeId) {
        const { shapes, currentTime } = useEditorStore.getState();
        const sel = shapes.find(
          (s) => s.id === selectedShapeId && s.startTime <= currentTime && currentTime < s.endTime
        );
        if (sel) {
          const corner = hitCorner(pt.x, pt.y, sel, cw, ch);
          setHoveredCorner(corner);
        } else {
          setHoveredCorner(null);
        }
      } else {
        setHoveredCorner(null);
      }
    },
    [getRelative, getCanvasSize, isShapeMode, selectedShapeId, updateShape]
  );

  // ── Pointer up ───────────────────────────────────────────────────────────
  const onPointerUp = useCallback(() => {
    if (draggingRef.current || resizeRef.current) {
      useEditorStore.getState().setCurrentTime(useEditorStore.getState().currentTime);
    }
    draggingRef.current = null;
    resizeRef.current = null;
  }, []);

  // ── Cursor ───────────────────────────────────────────────────────────────
  let cursor = "default";
  if (isShapeMode) {
    if (hoveredCorner === "tl" || hoveredCorner === "br") cursor = "nwse-resize";
    else if (hoveredCorner === "tr" || hoveredCorner === "bl") cursor = "nesw-resize";
    else if (selectedShapeId) cursor = "move";
    else cursor = "pointer";
  }

  return (
    <canvas
      ref={canvasRef}
      width={1280}
      height={720}
      className="absolute inset-0 w-full h-full"
      style={{
        zIndex: 17,
        cursor,
        pointerEvents: isShapeMode ? "auto" : "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    />
  );
}
