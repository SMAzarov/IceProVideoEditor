"use client";

import { EffectParams } from "@/types/editor";

export class FrameRenderer {
  renderFrame(
    frame: VideoFrame,
    canvas: HTMLCanvasElement | OffscreenCanvas,
    effects: EffectParams
  ): void {
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    if (!ctx) return;

    // Crop in source-pixel space
    const srcX = effects.cropX * frame.displayWidth;
    const srcY = effects.cropY * frame.displayHeight;
    const srcW = effects.cropW * frame.displayWidth;
    const srcH = effects.cropH * frame.displayHeight;

    // Canvas is sized to the cropped region so drawImage never stretches
    const w = Math.max(1, Math.round(srcW));
    const h = Math.max(1, Math.round(srcH));
    canvas.width = w;
    canvas.height = h;

    ctx.save();
    ctx.globalAlpha = effects.opacity;

    const filters: string[] = [];
    if (effects.brightness !== 0) filters.push(`brightness(${1 + effects.brightness / 100})`);
    if (effects.contrast !== 0) filters.push(`contrast(${1 + effects.contrast / 100})`);
    if (effects.saturation !== 0) filters.push(`saturate(${1 + effects.saturation / 100})`);
    ctx.filter = filters.length > 0 ? filters.join(" ") : "none";

    if (effects.rotation !== 0) {
      ctx.translate(w / 2, h / 2);
      ctx.rotate((effects.rotation * Math.PI) / 180);
      ctx.translate(-w / 2, -h / 2);
    }

    ctx.drawImage(frame, srcX, srcY, srcW, srcH, 0, 0, w, h);
    ctx.restore();
  }

  clear(canvas: HTMLCanvasElement | OffscreenCanvas): void {
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | null;
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
