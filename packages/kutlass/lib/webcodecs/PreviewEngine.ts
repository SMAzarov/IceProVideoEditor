"use client";

import { Clip, EffectParams, DEFAULT_EFFECTS } from "@/types/editor";
import { getDecoderForFile } from "./VideoDecoder";
import { FrameRenderer } from "./FrameRenderer";

const renderer = new FrameRenderer();

export { renderer };

export async function renderPreview(
  canvas: HTMLCanvasElement,
  clips: Clip[],
  currentTime: number,
  effectsMap: Record<string, EffectParams>,
  skipCrop = false
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
}
