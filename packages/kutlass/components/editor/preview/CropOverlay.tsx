"use client";

import { useRef, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { DEFAULT_EFFECTS } from "@/types/editor";

/**
 * Interactive crop handles rendered absolutely on top of the preview canvas.
 * Shows a semi-transparent mask outside the crop region with draggable corner/edge handles.
 */
export function CropOverlay() {
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const clips = useEditorStore((s) => s.clips);
  const clipEffects = useEditorStore((s) => s.clipEffects);
  const setClipEffects = useEditorStore((s) => s.setClipEffects);
  const captureHistory = useEditorStore((s) => s.captureHistory);

  const targetId = selectedClipId ?? clips.find((c) => c.trackId === "track-video")?.id ?? null;
  const effects = targetId ? (clipEffects[targetId] ?? DEFAULT_EFFECTS) : DEFAULT_EFFECTS;

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    handle: string;
    startX: number;
    startY: number;
    startEffects: typeof effects;
  } | null>(null);

  const onPointerDown = useCallback(
    (handle: string) => (e: React.PointerEvent) => {
      if (!targetId) return;
      e.stopPropagation();
      captureHistory();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = {
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startEffects: { ...effects },
      };
    },
    [targetId, effects, captureHistory]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current || !containerRef.current || !targetId) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = (e.clientX - dragRef.current.startX) / rect.width;
      const dy = (e.clientY - dragRef.current.startY) / rect.height;

      const s = dragRef.current.startEffects;
      let { cropX, cropY, cropW, cropH } = s;

      const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
      const MIN_SIZE = 0.05;

      switch (dragRef.current.handle) {
        case "move": {
          cropX = clamp(s.cropX + dx, 0, 1 - s.cropW);
          cropY = clamp(s.cropY + dy, 0, 1 - s.cropH);
          break;
        }
        case "nw": {
          const newX = clamp(s.cropX + dx, 0, s.cropX + s.cropW - MIN_SIZE);
          const newY = clamp(s.cropY + dy, 0, s.cropY + s.cropH - MIN_SIZE);
          cropW = s.cropW - (newX - s.cropX);
          cropH = s.cropH - (newY - s.cropY);
          cropX = newX;
          cropY = newY;
          break;
        }
        case "ne": {
          const newY = clamp(s.cropY + dy, 0, s.cropY + s.cropH - MIN_SIZE);
          cropW = clamp(s.cropW + dx, MIN_SIZE, 1 - s.cropX);
          cropH = s.cropH - (newY - s.cropY);
          cropY = newY;
          break;
        }
        case "sw": {
          const newX = clamp(s.cropX + dx, 0, s.cropX + s.cropW - MIN_SIZE);
          cropW = s.cropW - (newX - s.cropX);
          cropH = clamp(s.cropH + dy, MIN_SIZE, 1 - s.cropY);
          cropX = newX;
          break;
        }
        case "se": {
          cropW = clamp(s.cropW + dx, MIN_SIZE, 1 - s.cropX);
          cropH = clamp(s.cropH + dy, MIN_SIZE, 1 - s.cropY);
          break;
        }
        case "n": {
          const newY = clamp(s.cropY + dy, 0, s.cropY + s.cropH - MIN_SIZE);
          cropH = s.cropH - (newY - s.cropY);
          cropY = newY;
          break;
        }
        case "s": {
          cropH = clamp(s.cropH + dy, MIN_SIZE, 1 - s.cropY);
          break;
        }
        case "w": {
          const newX = clamp(s.cropX + dx, 0, s.cropX + s.cropW - MIN_SIZE);
          cropW = s.cropW - (newX - s.cropX);
          cropX = newX;
          break;
        }
        case "e": {
          cropW = clamp(s.cropW + dx, MIN_SIZE, 1 - s.cropX);
          break;
        }
      }

      setClipEffects(targetId, { cropX, cropY, cropW, cropH });
    },
    [targetId, setClipEffects]
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const { cropX, cropY, cropW, cropH } = effects;

  // Convert 0-1 values to percentages
  const x = cropX * 100;
  const y = cropY * 100;
  const w = cropW * 100;
  const h = cropH * 100;

  const handleStyle = (cursor: string): React.CSSProperties => ({
    position: "absolute",
    width: 12,
    height: 12,
    background: "var(--kt-slider-thumb)",
    border: "2px solid var(--kt-accent-strong-border)",
    borderRadius: 2,
    cursor,
    transform: "translate(-50%, -50%)",
    zIndex: 30,
  });

  // Edge handles are 16px tall/wide and straddle the boundary (–8px offset)
  // so they are reachable even when the crop region touches the container edge.
  const EDGE_HIT = 16;
  const edgeStyle = (cursor: string, extra?: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    background: "transparent",
    cursor,
    zIndex: 30, // above mask divs
    ...extra,
  });

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ zIndex: 20 }}
    >
      {/* Dark mask — outside crop region (pointer-events-none so handles beneath are reachable) */}
      <div className="absolute pointer-events-none" style={{ top: 0, left: 0, right: 0, height: `${y}%`, background: "var(--kt-crop-mask)" }} />
      <div className="absolute pointer-events-none" style={{ bottom: 0, left: 0, right: 0, height: `${100 - y - h}%`, background: "var(--kt-crop-mask)" }} />
      <div className="absolute pointer-events-none" style={{ top: `${y}%`, left: 0, width: `${x}%`, height: `${h}%`, background: "var(--kt-crop-mask)" }} />
      <div className="absolute pointer-events-none" style={{ top: `${y}%`, right: 0, width: `${100 - x - w}%`, height: `${h}%`, background: "var(--kt-crop-mask)" }} />

      {/* Crop region border + move handle */}
      <div
        className="absolute"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: `${w}%`,
          height: `${h}%`,
          border: "2px solid var(--kt-accent-strong-border)",
          boxSizing: "border-box",
          cursor: "move",
          zIndex: 22,
        }}
        onPointerDown={onPointerDown("move")}
      >
        {/* Rule-of-thirds grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.3 }}>
          <div className="absolute" style={{ background: "var(--kt-border-input)", left: "33.3%", top: 0, bottom: 0, width: 1 }} />
          <div className="absolute" style={{ background: "var(--kt-border-input)", left: "66.6%", top: 0, bottom: 0, width: 1 }} />
          <div className="absolute" style={{ background: "var(--kt-border-input)", top: "33.3%", left: 0, right: 0, height: 1 }} />
          <div className="absolute" style={{ background: "var(--kt-border-input)", top: "66.6%", left: 0, right: 0, height: 1 }} />
        </div>
      </div>

      {/* Corner handles — centered on corners via transform(-50%,-50%) */}
      <div style={{ ...handleStyle("nw-resize"), left: `${x}%`, top: `${y}%` }} onPointerDown={onPointerDown("nw")} />
      <div style={{ ...handleStyle("ne-resize"), left: `${x + w}%`, top: `${y}%` }} onPointerDown={onPointerDown("ne")} />
      <div style={{ ...handleStyle("sw-resize"), left: `${x}%`, top: `${y + h}%` }} onPointerDown={onPointerDown("sw")} />
      <div style={{ ...handleStyle("se-resize"), left: `${x + w}%`, top: `${y + h}%` }} onPointerDown={onPointerDown("se")} />

      {/* Edge handles — straddle the boundary so they are always clickable */}
      {/* North */}
      <div
        style={edgeStyle("n-resize", { left: `${x}%`, top: `calc(${y}% - ${EDGE_HIT / 2}px)`, width: `${w}%`, height: EDGE_HIT })}
        onPointerDown={onPointerDown("n")}
      />
      {/* South */}
      <div
        style={edgeStyle("s-resize", { left: `${x}%`, top: `calc(${y + h}% - ${EDGE_HIT / 2}px)`, width: `${w}%`, height: EDGE_HIT })}
        onPointerDown={onPointerDown("s")}
      />
      {/* West */}
      <div
        style={edgeStyle("w-resize", { left: `calc(${x}% - ${EDGE_HIT / 2}px)`, top: `${y}%`, width: EDGE_HIT, height: `${h}%` })}
        onPointerDown={onPointerDown("w")}
      />
      {/* East */}
      <div
        style={edgeStyle("e-resize", { left: `calc(${x + w}% - ${EDGE_HIT / 2}px)`, top: `${y}%`, width: EDGE_HIT, height: `${h}%` })}
        onPointerDown={onPointerDown("e")}
      />
    </div>
  );
}
