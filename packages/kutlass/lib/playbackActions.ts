"use client";

/**
 * Synchronous play/pause actions that call the decoder directly.
 * These must be called from within a user-gesture handler (click, keydown)
 * so that the browser grants unmuted autoplay permission.
 */

import { useEditorStore } from "@/store/editorStore";
import { getDecoderForFile } from "@/lib/webcodecs/VideoDecoder";

function getActiveVideoClip(time: number) {
  const clips = useEditorStore.getState().clips;
  return clips.find(
    (c) =>
      c.trackId === "track-video" &&
      c.startTime <= time &&
      c.startTime + c.duration > time
  ) ?? null;
}

export function playAction() {
  const { currentTime, setPlaying } = useEditorStore.getState();
  const clip = getActiveVideoClip(currentTime);
  if (clip) {
    const localTime = currentTime - clip.startTime + clip.trimIn;
    // startPlayback is intentionally not awaited — fire-and-forget so the
    // function stays synchronous inside the user-gesture call stack.
    getDecoderForFile(clip.file).startPlayback(localTime);
  }
  setPlaying(true);
}

export function pauseAction() {
  const { currentTime, setPlaying } = useEditorStore.getState();
  const clip = getActiveVideoClip(currentTime);
  if (clip) {
    getDecoderForFile(clip.file).stopPlayback();
  }
  setPlaying(false);
}

export function togglePlayAction() {
  const { isPlaying } = useEditorStore.getState();
  if (isPlaying) pauseAction();
  else playAction();
}
