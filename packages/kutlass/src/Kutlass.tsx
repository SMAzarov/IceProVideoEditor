"use client";

import { useEffect, useMemo } from "react";
import { Editor } from "@/components/editor/Editor";
import { useEditorStore } from "@/store/editorStore";
import { setFFmpegPaths, type FFmpegPaths } from "./ffmpegConfig";

import { deriveAccentVars } from "@/lib/colorUtils";
import type { ExportSettings } from "@/types/editor";
import type { Tool } from "@/components/editor/Sidebar";

/** Override any CSS variable used by the editor. Keys are variable names without the `--kt-` prefix. */
export type KutlassColors = Partial<Record<string, string>>;

export interface KutlassProps {
  /** CSS class name for the outer container */
  className?: string;
  /** Inline styles for the outer container */
  style?: React.CSSProperties;
  /** Color theme. Defaults to "dark". */
  theme?: "light" | "dark";
  /** Primary accent color (hex). Derives hover, subtle, and text variants automatically. */
  accent?: string;
  /** Override individual CSS variables. Keys are without the `--kt-` prefix, e.g. `{ "bg-panel": "#fff" }`. */
  colors?: KutlassColors;
  /** Which tools to show in the sidebar. Defaults to all. */
  tools?: Tool[];
  /** Default export settings (format, resolution, fps, bitrate) */
  exportSettings?: Partial<ExportSettings>;
  /** Paths to the FFmpeg WASM files served from your public directory */
  ffmpegPaths?: Partial<FFmpegPaths>;
  /**
   * Called when export finishes successfully.
   * Receives the exported video as a Blob.
   */
  onExportComplete?: (blob: Blob) => void;
}

export function Kutlass({
  className,
  style,
  theme = "dark",
  accent,
  colors,
  exportSettings,
  ffmpegPaths,
  onExportComplete,
}: KutlassProps) {
  const colorOverrides = useMemo(() => {
    const vars: Record<string, string> = {};
    if (accent) {
      const derived = deriveAccentVars(accent, theme === "dark");
      for (const [k, v] of Object.entries(derived)) vars[`--kt-${k}`] = v;
    }
    if (colors) {
      for (const [k, v] of Object.entries(colors)) {
        if (v) vars[`--kt-${k}`] = v;
      }
    }
    return vars;
  }, [accent, colors, theme]);
  // Configure FFmpeg WASM paths before any export runs
  useEffect(() => {
    if (ffmpegPaths) setFFmpegPaths(ffmpegPaths);
  }, [ffmpegPaths]);

  // Apply export settings overrides
  useEffect(() => {
    if (exportSettings) {
      useEditorStore.getState().updateExportSettings(exportSettings);
    }
  }, [exportSettings]);

  // Watch for export completion and forward the blob
  useEffect(() => {
    if (!onExportComplete) return;
    return useEditorStore.subscribe((state, prev) => {
      if (state.status === "done" && prev.status !== "done" && state.outputUrl) {
        fetch(state.outputUrl)
          .then((r) => r.blob())
          .then((blob) => onExportComplete(blob))
          .catch(console.error);
      }
    });
  }, [onExportComplete]);

  return (
    <div
      data-kt-theme={theme}
      className={`kutlass-editor ${className ?? ""}`}
      style={{ width: "100%", height: "100%", ...(colorOverrides as React.CSSProperties), ...style }}
    >
      <Editor />
    </div>
  );
}
