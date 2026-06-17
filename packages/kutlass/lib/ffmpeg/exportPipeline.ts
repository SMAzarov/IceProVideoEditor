"use client";

import {
  Clip,
  ExportSettings,
  EffectParams,
  DEFAULT_EFFECTS,
  Overlay,
  TextOverlay,
  StickerOverlay,
  VoiceOverlay,
  FreezeSegment,
} from "@/types/editor";
import { Stroke } from "@/store/slices/drawingSlice";
import { getDecoderForFile } from "@/lib/webcodecs/VideoDecoder";
import { FrameRenderer } from "@/lib/webcodecs/FrameRenderer";
import { blobToWav, padWavWithSilence, trimWavEnd, mergeWavBuffers, padWavEnd } from "@/lib/audioUtils";
import { getFFmpeg } from "./ffmpegClient";

export interface ExportJob {
  clips: Clip[];
  settings: ExportSettings;
  effectsMap: Record<string, EffectParams>;
  strokes: Stroke[];
  overlays: Overlay[];
  freezes: FreezeSegment[];
  onProgress: (progress: number) => void;
  signal?: AbortSignal;
}

// ── Canvas compositing helpers ────────────────────────────────────────────────

/** Draw a triangular arrowhead at the end of a line segment. */
function drawArrowhead(
  ctx: OffscreenCanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  headLength: number
) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.save();
  ctx.translate(toX, toY);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-headLength, -headLength * 0.4);
  ctx.lineTo(-headLength, headLength * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawStrokes(
  ctx: OffscreenCanvasRenderingContext2D,
  strokes: Stroke[],
  w: number,
  h: number
) {
  for (const stroke of strokes) {
    if (stroke.points.length < 2) continue;
    ctx.save();

    const isEraser = stroke.tool === "eraser";
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.strokeStyle = isEraser ? "rgba(0,0,0,1)" : stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const p0 = stroke.points[0];
    const p1 = stroke.points[stroke.points.length - 1];
    const x0 = p0.x * w;
    const y0 = p0.y * h;
    const x1 = p1.x * w;
    const y1 = p1.y * h;

    if (stroke.tool === "arrow" || stroke.tool === "straight") {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      if (stroke.tool === "arrow") {
        ctx.fillStyle = isEraser ? "rgba(0,0,0,1)" : stroke.color;
        drawArrowhead(ctx, x0, y0, x1, y1, Math.max(12, stroke.width * 3));
      }
    } else if (stroke.tool === "curved") {
      if (stroke.points.length >= 3) {
        const cp = stroke.points[1];
        const cx = cp.x * w;
        const cy = cp.y * h;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(cx, cy, x1, y1);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
    } else {
      // pen / eraser — polyline through all points
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x * w, stroke.points[i].y * h);
      }
      ctx.stroke();
    }

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
    if (overlay.type === "voice") continue;

    const o = overlay as TextOverlay | StickerOverlay;
    const px = o.x * w;
    const py = o.y * h;

    if (o.type === "text") {
      const t = o as TextOverlay;
      const size = Math.round((t.fontSize / 720) * h);
      ctx.save();
      ctx.font = `${t.bold ? "bold " : ""}${size}px ${t.fontFamily ?? "sans-serif"}`;
      ctx.fillStyle = t.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(t.text, px, py);
      ctx.restore();
    } else {
      const s = o as StickerOverlay;
      const baseSize = Math.round(80 * s.scale * (h / 720));

      if (s.imageUrl) {
        try {
          const resp = await fetch(s.imageUrl);
          const blob = await resp.blob();
          const bmp = await createImageBitmap(blob);
          ctx.save();
          ctx.drawImage(bmp, px - baseSize / 2, py - baseSize / 2, baseSize, baseSize);
          bmp.close();
          ctx.restore();
        } catch {
          // skip unloadable images
        }
      } else if (s.emoji) {
        const size = Math.round(60 * s.scale * (h / 720));
        ctx.save();
        ctx.font = `${size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(s.emoji, px, py);
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
  const { clips, settings, effectsMap, strokes, overlays, freezes, onProgress, signal } = job;
  const ffmpeg = await getFFmpeg();

  const renderer = new FrameRenderer();
  const fps = settings.fps;

  // Use first clip's dimensions as the reference for output size
  const firstClip   = clips[0];
  const firstEffects = effectsMap[firstClip.id] ?? DEFAULT_EFFECTS;
  const { w: outW, h: outH } = getOutputSize(firstClip, firstEffects, settings.resolution);

  onProgress(2);

  // ── Render every frame to JPEG and write into FFmpeg FS ──────────────────
  let globalFrameIdx = 0;
  // Total frames accounting for speed and freeze segments
  const totalFrames = clips.reduce((sum, c) => {
    const effects = effectsMap[c.id] ?? DEFAULT_EFFECTS;
    const speed = effects.speed ?? 1;
    const base = Math.ceil((c.duration * fps) / speed);
    // Add extra frames for freeze segments overlapping this clip
    const clipStart = c.startTime;
    const clipEnd = c.startTime + c.duration;
    let extra = 0;
    for (const f of freezes) {
      const overlapStart = Math.max(f.startTime, clipStart);
      const overlapEnd = Math.min(f.endTime, clipEnd);
      if (overlapEnd > overlapStart) {
        extra += Math.ceil((overlapEnd - overlapStart) * fps);
      }
    }
    return sum + base + extra;
  }, 0);

  // Cache for freeze frames — when we hit a freeze segment we repeat the last rendered frame
  let lastFrameCanvas: OffscreenCanvas | null = null;

  // ── Helper: render a single frame (decode + composite) ──────────────────
  async function renderFrame(
    clip: Clip,
    outIdx: number,
    normalFrames: number,
    sourceFrameCount: number,
    decoder: ReturnType<typeof getDecoderForFile>,
    effects: EffectParams,
    speed: number,
    isFrozen: boolean
  ): Promise<OffscreenCanvas> {
    if (isFrozen && lastFrameCanvas) {
      const canvas = new OffscreenCanvas(outW, outH);
      const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
      ctx.drawImage(lastFrameCanvas, 0, 0);
      return canvas;
    }

    const srcIdx = Math.min(Math.floor(normalFrames * speed), sourceFrameCount - 1);
    const sourceTime = clip.trimIn + srcIdx / fps;

    const frame = await decoder.requestFrame(
      clip.file,
      Math.min(sourceTime, clip.trimOut - 0.001)
    );

    const canvas = new OffscreenCanvas(outW, outH);

    if (frame) {
      const tmp = new OffscreenCanvas(1, 1);
      renderer.renderFrame(frame, tmp, effects);
      frame.close();

      const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
      ctx.drawImage(tmp, 0, 0, outW, outH);
    }

    lastFrameCanvas = canvas;
    return canvas;
  }

  // ── Helper: composite overlays + convert to blob ────────────────────────
  async function compositeAndWrite(
    canvas: OffscreenCanvas,
    frameTime: number,
    globalIdx: number
  ): Promise<void> {
    const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;

    // Composite annotation strokes
    const visibleStrokes = strokes.filter(
      (s) => s.startTime <= frameTime && frameTime < s.endTime
    );
    if (visibleStrokes.length > 0) drawStrokes(ctx, visibleStrokes, outW, outH);

    // Composite sticker / text overlays
    const visibleOverlays = overlays.filter(
      (o) => o.startTime <= frameTime && frameTime < o.endTime
    );
    if (visibleOverlays.length > 0) await drawOverlays(ctx, visibleOverlays, outW, outH);

    // Convert to WebP blob and write to FFmpeg FS
    // WebP encodes ~2x faster than JPEG in browsers and produces smaller files.
    // FFmpeg WASM supports WebP decoding (--enable-libwebp).
    const blob = await canvas.convertToBlob({ type: "image/webp", quality: 0.8 });
    const frameName = `frame_${String(globalIdx).padStart(6, "0")}.webp`;
    await ffmpeg.writeFile(frameName, new Uint8Array(await blob.arrayBuffer()));
  }

  for (const clip of clips) {
    const effects = effectsMap[clip.id] ?? DEFAULT_EFFECTS;
    const speed = effects.speed ?? 1;
    const decoder  = getDecoderForFile(clip.file);
    // Number of source frames to decode (based on clip duration at normal speed)
    const sourceFrameCount = Math.ceil(clip.duration * fps);
    // Number of output frames to write (adjusted for speed)
    const outputFrameCount = Math.ceil((clip.duration * fps) / speed);

    // Calculate extra frames needed for freeze segments that overlap this clip
    const clipStart = clip.startTime;
    const clipEnd = clip.startTime + clip.duration;
    let extraFreezeFrames = 0;
    for (const f of freezes) {
      // Freeze segment overlapping this clip
      const overlapStart = Math.max(f.startTime, clipStart);
      const overlapEnd = Math.min(f.endTime, clipEnd);
      if (overlapEnd > overlapStart) {
        extraFreezeFrames += Math.ceil((overlapEnd - overlapStart) * fps);
      }
    }
    const totalOutputFrames = outputFrameCount + extraFreezeFrames;

    // normalFrames tracks how many non-frozen frames we've output.
    // It is used to calculate sourceIdx so the video doesn't jump ahead
    // during freeze — the source frame stays locked while we repeat it.
    let normalFrames = 0;

    // Process frames in batches for parallelism
    const BATCH_SIZE = 8;
    for (let batchStart = 0; batchStart < totalOutputFrames; batchStart += BATCH_SIZE) {
      if (signal?.aborted) throw new DOMException("Export cancelled", "AbortError");

      const batchEnd = Math.min(batchStart + BATCH_SIZE, totalOutputFrames);
      const batchSize = batchEnd - batchStart;

      // First pass: determine freeze status and compute frameTime for each frame in batch
      const frameInfos: Array<{
        outIdx: number;
        frameTime: number;
        isFrozen: boolean;
        normalFramesAtStart: number;
      }> = [];

      let localNormalFrames = normalFrames;
      for (let i = batchStart; i < batchEnd; i++) {
        const frameTime = clip.startTime + i / fps * speed;
        const isFrozen = freezes.some(
          (f) => frameTime >= f.startTime && frameTime < f.endTime
        );
        frameInfos.push({
          outIdx: i,
          frameTime,
          isFrozen,
          normalFramesAtStart: localNormalFrames,
        });
        if (!isFrozen) localNormalFrames++;
      }

      // Second pass: render all frames in the batch in parallel
      const renderPromises = frameInfos.map((info) =>
        renderFrame(
          clip,
          info.outIdx,
          info.normalFramesAtStart,
          sourceFrameCount,
          decoder,
          effects,
          speed,
          info.isFrozen
        )
      );

      const canvases = await Promise.all(renderPromises);

      // Third pass: composite overlays and write to FS sequentially
      for (let j = 0; j < batchSize; j++) {
        const info = frameInfos[j];
        const canvas = canvases[j];

        await compositeAndWrite(canvas, info.frameTime, globalFrameIdx);

        if (!info.isFrozen) normalFrames++;
        globalFrameIdx++;
        onProgress(2 + Math.round((globalFrameIdx / totalFrames) * 68)); // 2–70%
      }
    }
  }

  onProgress(70);

  // ── Prepare voice overlay audio ──────────────────────────────────────────
  // We use WAV (PCM) format because FFmpeg WASM may not have codecs for
  // webm/opus. WAV is universally supported by FFmpeg.
  // IMPORTANT: We avoid -itsoffset and FFmpeg concat entirely because they
  // can fail in FFmpeg WASM. Instead we:
  //   1. Convert each voice blob to WAV PCM via Web Audio API
  //   2. Pad each WAV with silence at the browser level to match timeline position
  //   3. Merge all WAV PCM data in JavaScript (keep first header, append PCM data)
  //   4. Write the single merged WAV directly to FFmpeg FS
  const voiceOverlays = overlays.filter((o): o is VoiceOverlay => o.type === "voice");
  let hasAudioInput = false;

  if (voiceOverlays.length > 0) {
    // Collect all padded WAV buffers
    const wavBuffers: ArrayBuffer[] = [];

    for (let vi = 0; vi < voiceOverlays.length; vi++) {
      if (signal?.aborted) throw new DOMException("Export cancelled", "AbortError");

      const voice = voiceOverlays[vi];

      try {
        const resp = await fetch(voice.audioUrl);
        if (!resp.ok) {
          console.warn(`Voice overlay ${vi}: fetch failed with status ${resp.status}`);
          continue;
        }
        const audioBlob = await resp.blob();

        // Convert the blob (webm/opus) to WAV PCM using Web Audio API.
        const wavBlob = await blobToWav(audioBlob);
        const wavBuf = await wavBlob.arrayBuffer();

        // Pad the WAV with silence at the beginning to match the timeline position.
        const paddedWav = await padWavWithSilence(wavBuf, voice.startTime);

        // Trim the WAV to end at the specified endTime.
        // The padded WAV now starts at voice.startTime, so its total duration
        // should be voice.endTime - voice.startTime of actual audio content.
        const voiceDuration = voice.endTime - voice.startTime;
        const trimmedWav = trimWavEnd(paddedWav, voice.endTime);

        wavBuffers.push(trimmedWav);
      } catch (err) {
        console.warn(`Voice overlay ${vi}: conversion failed, skipping`, err);
      }
    }

    // Merge all WAV buffers into one (keep first header, append only PCM data from rest)
    if (wavBuffers.length > 0) {
      try {
        const mergedWav = mergeWavBuffers(wavBuffers);
        // Pad the merged audio with silence at the end to match the full video
        // duration (including freeze frames), otherwise -shortest will cut the
        // video short.
        const videoDuration = totalFrames / fps;
        const paddedWav = padWavEnd(mergedWav, videoDuration);
        await ffmpeg.writeFile("voice_mixed.wav", new Uint8Array(paddedWav));
        hasAudioInput = true;
      } catch (err) {
        console.warn("Voice merge failed, exporting without audio:", err);
      }
    }
  }

  // ── Encode with FFmpeg ────────────────────────────────────────────────────
  // IMPORTANT: All -i inputs must come first, then output options.
  // FFmpeg is strict about option ordering — output options before all inputs
  // will be misinterpreted as input options.
  const outputName = `output.${settings.format}`;

  // Input options + inputs
  const args: string[] = [
    "-framerate", String(fps),
    "-i", "frame_%06d.webp",
  ];

  // Add audio input if we have voice overlays (must come after video input)
  if (hasAudioInput) {
    args.push("-i", "voice_mixed.wav");
  }

  // Output options (all after inputs)
  args.push("-r", String(fps));
  args.push("-b:v", `${settings.bitrate}k`);
  args.push("-c:v", settings.format === "mp4" ? "libx264" : "libvpx-vp9");

  if (hasAudioInput) {
    args.push("-c:a", "aac");
    args.push("-shortest");
  }

  if (settings.format === "mp4") {
    args.push("-pix_fmt", "yuv420p"); // required for H.264 compatibility
    args.push("-preset", "ultrafast");
    args.push("-movflags", "+faststart");
  }

  args.push("-y", outputName);

  const onFFmpegProgress = ({ progress }: { progress: number }) => {
    onProgress(70 + Math.round(progress * 25)); // 70–95%
  };
  ffmpeg.on("progress", onFFmpegProgress);

  try {
    await ffmpeg.exec(args);
  } catch (err) {
    console.error("[FFmpeg encode] Failed:", err);
    throw err;
  } finally {
    ffmpeg.off("progress", onFFmpegProgress);
  }

  onProgress(96);

  // Cleanup voice audio files
  if (hasAudioInput) {
    await ffmpeg.deleteFile("voice_mixed.wav").catch(() => {});
  }

  const data = await ffmpeg.readFile(outputName);
  const result =
    data instanceof Uint8Array
      ? data
      : new TextEncoder().encode(data as string);

  // Cleanup all frame files + output
  for (let i = 0; i < globalFrameIdx; i++) {
    const name = `frame_${String(i).padStart(6, "0")}.webp`;
    await ffmpeg.deleteFile(name).catch(() => {});
  }
  await ffmpeg.deleteFile(outputName).catch(() => {});

  onProgress(100);
  return result;
}
