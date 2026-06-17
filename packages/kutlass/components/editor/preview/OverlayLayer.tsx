"use client";

import { useRef, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { Overlay, TextOverlay, StickerOverlay } from "@/types/editor";

/**
 * Renders text and sticker overlays as absolutely-positioned HTML elements
 * over the preview canvas. Each overlay is draggable.
 */
export function OverlayLayer() {
  const overlays = useEditorStore((s) => s.overlays);
  const selectedOverlayId = useEditorStore((s) => s.selectedOverlayId);
  const selectOverlay = useEditorStore((s) => s.selectOverlay);
  const updateOverlay = useEditorStore((s) => s.updateOverlay);
  const removeOverlay = useEditorStore((s) => s.removeOverlay);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    startOX: number;
    startOY: number;
  } | null>(null);

  const onPointerDown = useCallback(
    (overlay: Overlay) => (e: React.PointerEvent) => {
      e.stopPropagation();
      selectOverlay(overlay.id);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = {
        id: overlay.id,
        startX: e.clientX,
        startY: e.clientY,
        startOX: overlay.x,
        startOY: overlay.y,
      };
    },
    [selectOverlay]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = (e.clientX - dragRef.current.startX) / rect.width;
      const dy = (e.clientY - dragRef.current.startY) / rect.height;
      const x = Math.max(0, Math.min(1, dragRef.current.startOX + dx));
      const y = Math.max(0, Math.min(1, dragRef.current.startOY + dy));
      updateOverlay(dragRef.current.id, { x, y });
    },
    [updateOverlay]
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  if (overlays.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 15 }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {overlays.map((overlay) => {
        const isSelected = selectedOverlayId === overlay.id;

        if (overlay.type === "text") {
          const o = overlay as TextOverlay;
          return (
            <div
              key={o.id}
              className="absolute pointer-events-auto select-none"
              style={{
                left: `${o.x * 100}%`,
                top: `${o.y * 100}%`,
                transform: "translate(-50%, -50%)",
                cursor: "move",
                outline: isSelected ? "2px solid var(--kt-accent)" : "none",
                outlineOffset: 4,
                borderRadius: 2,
                padding: "2px 4px",
              }}
              onPointerDown={onPointerDown(o)}
            >
              <span
                style={{
                  fontFamily: o.fontFamily,
                  fontSize: o.fontSize,
                  color: o.color,
                  fontWeight: o.bold ? "bold" : "normal",
                  textShadow: "0 1px 4px rgba(0,0,0,0.7)",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                {o.text}
              </span>
              {isSelected && (
                <button
                  className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "var(--kt-danger-btn)", color: "var(--kt-text-primary)", fontSize: 10, pointerEvents: "auto" }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => removeOverlay(o.id)}
                >
                  ×
                </button>
              )}
            </div>
          );
        }

        if (overlay.type === "sticker") {
          const o = overlay as StickerOverlay;
          const emojiSize = 48 * o.scale;
          const imgSize = 80 * o.scale;
          return (
            <div
              key={o.id}
              className="absolute pointer-events-auto select-none"
              style={{
                left: `${o.x * 100}%`,
                top: `${o.y * 100}%`,
                transform: "translate(-50%, -50%)",
                cursor: "move",
                outline: isSelected ? "2px solid var(--kt-accent)" : "none",
                outlineOffset: 4,
                borderRadius: 4,
                lineHeight: 1,
              }}
              onPointerDown={onPointerDown(o)}
            >
              {o.imageUrl ? (
                <img
                  src={o.imageUrl}
                  alt=""
                  style={{
                    width: imgSize,
                    height: imgSize,
                    objectFit: "contain",
                    display: "block",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                    pointerEvents: "none",
                  }}
                  draggable={false}
                />
              ) : (
                <span
                  style={{
                    fontSize: emojiSize,
                    display: "block",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                  }}
                >
                  {o.emoji}
                </span>
              )}
              {isSelected && (
                <button
                  className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "var(--kt-danger-btn)", color: "var(--kt-text-primary)", fontSize: 10, pointerEvents: "auto" }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => removeOverlay(o.id)}
                >
                  ×
                </button>
              )}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
