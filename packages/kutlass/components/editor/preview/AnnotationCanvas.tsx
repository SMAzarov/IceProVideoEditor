"use client";

import dynamic from "next/dynamic";

const Tldraw = dynamic(
  () => import("@tldraw/tldraw").then((m) => m.Tldraw),
  { ssr: false, loading: () => null }
);

interface AnnotationCanvasProps {
  isActive: boolean;
}

export function AnnotationCanvas({ isActive }: AnnotationCanvasProps) {
  if (!isActive) return null; // don't even mount tldraw when inactive — keeps the DOM clean

  return (
    <div
      className="absolute inset-0"
      style={{ zIndex: 18 }}
    >
      <Tldraw
        hideUi={false}
        components={{ Background: () => null }}
      />
    </div>
  );
}
