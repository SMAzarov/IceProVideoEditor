"use client";

import {
  Clip,
  ExportSettings,
  EffectParams,
  DEFAULT_EFFECTS,
  Overlay,
  TextOverlay,
  StickerOverlay,
} from "@/types/editor";
import { Stroke } from "@/store/slices/drawingSlice";
import { getDecoderForFile } from "@/lib/webcodecs/VideoDecoder";
import { FrameRenderer } from "@/lib/webcodecs/FrameRenderer";
import { getFFmpeg } from "./ffmpegClient";

export interface ExportJob {
  clips: Clip[];
  settings: ExportSettings;
  effectsMap: Record<string, EffectParams>;
  strokes: Stroke[];
  overlays: Overlay[];
  onProgress: (progress: number) => void;
  signal?: AbortSignal;
}

// ── Canvas compositing helpers ────────────────────────────────────────────────

function drawStrokes(
  ctx: OffscreenCanvasRenderingContext2D,
  strokes: Stroke[],
  w: number,
  h: number
) {
  for (const stroke of strokes) {
    if (stroke.points.length < 2) continue;
    ctx.save();
    ctx.globalCompositeOperation =
      stroke.tool === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = stroke.color;
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

async function drawOverlays(
  ctx: OffscreenCanvasRenderingContext2D,
  overlays: Overlay[],
  w: number,
  h: number
) {
  for (const overlay of overlays) {
    const px = overlay.x * w;
    const py = overlay.y * h;

    if (overlay.type === "text") {
      const o = overlay as TextOverlay;
      const size = Math.round((o.fontSize / 720) * h); // scale fontSize to output height
      ctx.save();
      ctx.font = `${o.bold ? "bold " : ""}${size}px ${o.fontFamily ?? "sans-serif"}`;
      ctx.fillStyle = o.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(o.text, px, py);
      ctx.restore();
    } else {
      const o = overlay as StickerOverlay;
      const baseSize = Math.round(80 * o.scale * (h / 720));

      if (o.imageUrl) {
        try {
          const resp = await fetch(o.imageUrl);
          const blob = await resp.blob();
          const bmp = await createImageBitmap(blob);
          ctx.save();
          ctx.drawImage(bmp, px - baseSize / 2, py - baseSize / 2, baseSize, baseSize);
          bmp.close();
          ctx.restore();
        } catch {
          // skip unloadable images
        }
      } else if (o.emoji) {
        const size = Math.round(60 * o.scale * (h / 720));
        ctx.save();
        ctx.font = `${size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(o.emoji, px, py);
        ctx.restore();
      }
    }
  }
}

// ── Output dimensions ─────────────────────────────────────────────────────────

function getOutputSize(
  clip: Clip,
  effects: EffectParams,
  resolution: ExportSettings["resolution"]
): { w: number; h: number } {
  // Crop reduces the effective source dimensions
  const cropW = Math.round(clip.width  * effects.cropW);
  const cropH = Math.round(clip.height * effects.cropH);

  if (resolution === "original") return { w: cropW, h: cropH };

  const targets: Record<string, { w: number; h: number }> = {
    "1080p": { w: 1920, h: 1080 },
    "720p":  { w: 1280, h: 720 },
    "480p":  { w: 854,  h: 480 },
  };
  const target = targets[resolution];
  if (!target) return { w: cropW, h: cropH };

  // Fit inside the target box maintaining the crop's aspect ratio
  const aspect = cropW / cropH;
  let w = target.w;
  let h = Math.round(w / aspect);
  if (h > target.h) { h = target.h; w = Math.round(h * aspect); }
  // Ensure even dimensions for codec compatibility
  return { w: w & ~1, h: h & ~1 };
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function runExport(job: ExportJob): Promise<Uint8Array> {
  const { clips, settings, effectsMap, strokes, overlays, onProgress, signal } = job;
  const ffmpeg = await getFFmpeg();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { fetchFile } = await import("@ffmpeg/util" as any);

  const renderer = new FrameRenderer();
  const fps = settings.fps;

  // Use first clip's dimensions as the reference for output size
  const firstClip   = clips[0];
  const firstEffects = effectsMap[firstClip.id] ?? DEFAULT_EFFECTS;
  const { w: outW, h: outH } = getOutputSize(firstClip, firstEffects, settings.resolution);

  onProgress(2);

  // ── Render every frame to JPEG and write into FFmpeg FS ──────────────────
  let globalFrameIdx = 0;
  const totalFrames = clips.reduce((sum, c) => sum + Math.ceil(c.duration * fps), 0);

  for (const clip of clips) {
    const effects = effectsMap[clip.id] ?? DEFAULT_EFFECTS;
    const decoder  = getDecoderForFile(clip.file);
    const frameCount = Math.ceil(clip.duration * fps);

    for (let i = 0; i < frameCount; i++) {
      if (signal?.aborted) throw new DOMException("Export cancelled", "AbortError");

      const sourceTime = clip.trimIn + i / fps;

      const frame = await decoder.requestFrame(
        clip.file,
        Math.min(sourceTime, clip.trimOut - 0.001)
      );

      // Render video frame + effects onto an OffscreenCanvas at output size
      const canvas = new OffscreenCanvas(outW, outH);

      if (frame) {
        // FrameRenderer sizes canvas to crop dimensions; we want outW×outH,
        // so we render to a temp canvas first then scale into our target.
        const tmp = new OffscreenCanvas(1, 1);
        renderer.renderFrame(frame, tmp, effects);
        frame.close();

        const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
        ctx.drawImage(tmp, 0, 0, outW, outH);
      }

      const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;

      // Composite annotation strokes
      if (strokes.length > 0) drawStrokes(ctx, strokes, outW, outH);

      // Composite sticker / text overlays
      if (overlays.length > 0) await drawOverlays(ctx, overlays, outW, outH);

      // Write JPEG frame to FFmpeg FS
      const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.92 });
      const frameName = `frame_${String(globalFrameIdx).padStart(6, "0")}.jpg`;
      await ffmpeg.writeFile(frameName, new Uint8Array(await blob.arrayBuffer()));

      globalFrameIdx++;
      onProgress(2 + Math.round((globalFrameIdx / totalFrames) * 68)); // 2–70%
    }
  }

  onProgress(70);

  // ── Encode with FFmpeg ────────────────────────────────────────────────────
  const outputName = `output.${settings.format}`;

  const args: string[] = [
    "-framerate", String(fps),
    "-i", "frame_%06d.jpg",
    "-r", String(fps),
    "-b:v", `${settings.bitrate}k`,
    "-c:v", settings.format === "mp4" ? "libx264" : "libvpx-vp9",
  ];

  if (settings.format === "mp4") {
    args.push("-pix_fmt", "yuv420p"); // required for H.264 compatibility
    args.push("-preset", "fast");
    args.push("-movflags", "+faststart");
  }

  args.push("-y", outputName);

  const onFFmpegProgress = ({ progress }: { progress: number }) => {
    onProgress(70 + Math.round(progress * 25)); // 70–95%
  };
  ffmpeg.on("progress", onFFmpegProgress);

  try {
    await ffmpeg.exec(args);
  } finally {
    ffmpeg.off("progress", onFFmpegProgress);
  }

  onProgress(96);

  const data = await ffmpeg.readFile(outputName);
  const result =
    data instanceof Uint8Array
      ? data
      : new TextEncoder().encode(data as string);

  // Cleanup all frame files + output
  for (let i = 0; i < globalFrameIdx; i++) {
    const name = `frame_${String(i).padStart(6, "0")}.jpg`;
    await ffmpeg.deleteFile(name).catch(() => {});
  }
  await ffmpeg.deleteFile(outputName).catch(() => {});

  onProgress(100);
  return result;
}
