"use client";

import { useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { getDecoderForFile } from "@/lib/webcodecs/VideoDecoder";
import { Clip } from "@/types/editor";

const SUPPORTED_FORMATS = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"];

export function useVideoImport() {
  const addClip = useEditorStore((s) => s.addClip);
  const removeClip = useEditorStore((s) => s.removeClip);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const clearStrokes = useEditorStore((s) => s.clearStrokes);
  const clearOverlays = useEditorStore((s) => s.clearOverlays);
  const resetExport = useEditorStore((s) => s.resetExport);

  const importFile = useCallback(async (file: File) => {
    if (!SUPPORTED_FORMATS.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|mkv)$/i)) {
      console.warn("Unsupported file type:", file.type);
      return;
    }

    try {
      const decoder = getDecoderForFile(file);
      const metadata = await decoder.getMetadata(file);

      // Capture first frame immediately (video is loaded at this point)
      const initialThumbnails: string[] = [];
      try {
        const seekTo = Math.min(0.1, metadata.duration * 0.05);
        const frame = await decoder.requestFrame(file, seekTo);
        if (frame) {
          const thumbW = 320;
          const thumbH = Math.round(thumbW * (metadata.height / metadata.width));
          const canvas = document.createElement("canvas");
          canvas.width = thumbW;
          canvas.height = thumbH;
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.drawImage(frame, 0, 0, thumbW, thumbH);
          frame.close();
          initialThumbnails.push(canvas.toDataURL("image/jpeg", 0.75));
        }
      } catch {
        // non-fatal — filmstrip will generate thumbs separately
      }

      // Place new clip after all existing video clips (multi-clip support)
      const existingEnd = useEditorStore.getState().duration;
      const clip: Omit<Clip, "id"> = {
        trackId: "track-video",
        name: file.name.replace(/\.[^.]+$/, ""),
        file,
        startTime: existingEnd,
        duration: metadata.duration,
        trimIn: 0,
        trimOut: metadata.duration,
        sourceDuration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        fps: metadata.fps,
        thumbnails: initialThumbnails,
      };

      addClip(clip);
    } catch (err) {
      console.error("Failed to import video:", err);
    }
  }, [addClip]);

  const importFiles = useCallback(
    (files: FileList | File[]) => {
      Array.from(files).forEach(importFile);
    },
    [importFile]
  );

  /** Remove all existing clips/state and import the new files as a fresh start. */
  const replaceImport = useCallback(
    (files: FileList | File[]) => {
      // Remove all existing clips
      const { clips } = useEditorStore.getState();
      clips.forEach((c) => removeClip(c.id));
      setCurrentTime(0);
      clearStrokes();
      clearOverlays();
      resetExport();
      // Import new files
      Array.from(files).forEach(importFile);
    },
    [importFile, removeClip, setCurrentTime, clearStrokes, clearOverlays, resetExport]
  );

  return { importFile, importFiles, replaceImport };
}
