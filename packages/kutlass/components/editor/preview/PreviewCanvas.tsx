"use client";

import { forwardRef } from "react";

// Canvas fills its aspect-ratio wrapper; the wrapper controls the display size.
// FrameRenderer sets canvas.width/height to the actual video resolution so
// drawing is always at native resolution — CSS scales it proportionally.
export const PreviewCanvas = forwardRef<HTMLCanvasElement>(
  function PreviewCanvas(_props, ref) {
    return (
      <canvas
        ref={ref}
        className="w-full h-full"
      />
    );
  }
);
