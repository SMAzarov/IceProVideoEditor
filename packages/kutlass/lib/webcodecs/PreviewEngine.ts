"use client";

import { Clip, EffectParams, DEFAULT_EFFECTS, ShapeAnnotation } from "@/types/editor";
import { getDecoderForFile } from "./VideoDecoder";
import { FrameRenderer } from "./FrameRenderer";

const renderer = new FrameRenderer();

export { renderer };

/** Draw shape annotations onto a canvas context */
export function drawShapesOnCtx(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  shapes: ShapeAnnotation[],
  w: number,
  h: number
) {
  for (const shape of shapes) {
    ctx.save();

    const cx = shape.x * w;
    const cy = shape.y * h;
    const sw = shape.width * w;
    const sh = shape.height * h;
    const halfW = sw / 2;
    const halfH = sh / 2;

    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.strokeWidth;
    ctx.fillStyle = shape.fillColor;

    if (shape.type === "rectangle") {
      ctx.beginPath();
      ctx.rect(cx - halfW, cy - halfH, sw, sh);
      if (shape.fillColor !== "transparent") ctx.fill();
      ctx.stroke();
    } else if (shape.type === "circle") {
      ctx.beginPath();
      ctx.ellipse(cx, cy, halfW, halfH, 0, 0, Math.PI * 2);
      if (shape.fillColor !== "transparent") ctx.fill();
      ctx.stroke();
    } else if (shape.type === "text") {
      const size = Math.round(shape.fontSize * (h / 720));
      ctx.font = `bold ${size}px sans-serif`;
      ctx.fillStyle = shape.color;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      // Bounding box for text wrapping
      const maxW = sw > 10 ? sw : w * 0.3;
      const maxH = sh > 10 ? sh : h * 0.15;
      const tx = cx - maxW / 2;
      const ty = cy - maxH / 2;

      // Word-wrap the text into lines
      const words = shape.text.split(" ");
      const lines: string[] = [];
      let currentLine = "";
      for (const word of words) {
        const testLine = currentLine ? currentLine + " " + word : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxW && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      // Draw lines, clipped to bounding box
      const lineHeight = size * 1.3;
      const maxLines = Math.floor(maxH / lineHeight);
      ctx.save();
      ctx.beginPath();
      ctx.rect(tx, ty, maxW, maxH);
      ctx.clip();
      for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
        ctx.fillText(lines[i], tx, ty + i * lineHeight);
      }
      ctx.restore();
    }

    ctx.restore();
  }
}

export async function renderPreview(
  canvas: HTMLCanvasElement,
  clips: Clip[],
  currentTime: number,
  effectsMap: Record<string, EffectParams>,
  skipCrop = false,
  shapes: ShapeAnnotation[] = []
): Promise<void> {
  const activeClip = clips.find(
    (c) =>
      c.trackId === "track-video" &&
      c.startTime <= currentTime &&
      c.startTime + c.duration > currentTime
  );

  if (!activeClip) {
    renderer.clear(canvas);
    return;
  }

  const localTime = currentTime - activeClip.startTime + activeClip.trimIn;
  const decoder = getDecoderForFile(activeClip.file);
  const frame = await decoder.requestFrame(activeClip.file, localTime);
  if (!frame) return;

  const base = effectsMap[activeClip.id] ?? DEFAULT_EFFECTS;
  // When the crop tool is active we render the full frame so handles are
  // positioned in source-frame space, not cropped-frame space.
  const effects = skipCrop
    ? { ...base, cropX: 0, cropY: 0, cropW: 1, cropH: 1 }
    : base;
  renderer.renderFrame(frame, canvas, effects);
  frame.close();

  // Draw shape annotations on top
  const visibleShapes = shapes.filter(
    (s) => s.startTime <= currentTime && currentTime < s.endTime
  );
  if (visibleShapes.length > 0) {
    const ctx = canvas.getContext("2d");
    if (ctx) drawShapesOnCtx(ctx, visibleShapes, canvas.width, canvas.height);
  }
}
