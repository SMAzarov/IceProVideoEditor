"use client";

import { useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { runExport } from "@/lib/ffmpeg/exportPipeline";

// Module-level so all useExport() consumers share the same controller
let activeController: AbortController | null = null;

export function useExport() {
  const clips = useEditorStore((s) => s.clips);
  const settings = useEditorStore((s) => s.settings);
  const clipEffects = useEditorStore((s) => s.clipEffects);
  const strokes = useEditorStore((s) => s.strokes);
  const overlays = useEditorStore((s) => s.overlays);
  const setExportStatus = useEditorStore((s) => s.setExportStatus);
  const setExportProgress = useEditorStore((s) => s.setExportProgress);
  const setOutputUrl = useEditorStore((s) => s.setOutputUrl);
  const setExportError = useEditorStore((s) => s.setExportError);
  const resetExport = useEditorStore((s) => s.resetExport);

  const startExport = useCallback(async () => {
    const videoClips = clips.filter((c) => c.trackId === "track-video");
    if (videoClips.length === 0) return;

    // Abort any in-flight export
    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;

    resetExport();
    setExportStatus("preparing");

    try {
      const data = await runExport({
        clips: videoClips,
        settings,
        effectsMap: clipEffects,
        strokes,
        overlays,
        signal: controller.signal,
        onProgress: (p) => {
          if (controller.signal.aborted) return;
          setExportProgress(p);
          if (p > 10) setExportStatus("encoding");
        },
      });

      if (controller.signal.aborted) return;

      const mimeType = settings.format === "mp4" ? "video/mp4" : "video/webm";
      const blob = new Blob([data.buffer as ArrayBuffer], { type: mimeType });
      const url = URL.createObjectURL(blob);

      setOutputUrl(url);
      setExportStatus("done");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // User cancelled — already reset by cancelExport
        return;
      }
      console.error("Export failed:", err);
      setExportError(err instanceof Error ? err.message : "Export failed");
      setExportStatus("error");
    }
  }, [clips, settings, clipEffects, strokes, overlays, resetExport, setExportStatus, setExportProgress, setOutputUrl, setExportError]);

  const cancelExport = useCallback(() => {
    activeController?.abort();
    activeController = null;
    resetExport();
  }, [resetExport]);

  const downloadExport = useCallback(
    (url: string) => {
      const a = document.createElement("a");
      a.href = url;
      a.download = `kutlass-export.${settings.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    [settings.format]
  );

  return { startExport, downloadExport, cancelExport };
}
