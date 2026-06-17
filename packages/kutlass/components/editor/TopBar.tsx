"use client";

import { useRef } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useExport } from "@/hooks/useExport";
import { useVideoImport } from "@/hooks/useVideoImport";

export function TopBar() {
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);
  const exportStatus = useEditorStore((s) => s.status);
  const clips = useEditorStore((s) => s.clips);
  const { startExport } = useExport();
  const { replaceImport } = useVideoImport();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isExporting = exportStatus === "preparing" || exportStatus === "encoding";
  const hasClips = clips.length > 0;
  const zoomPercent = Math.round((zoom / 80) * 100);

  return (
    <div className="flex items-center h-11 px-2 md:px-3 shrink-0 border-b" style={{ borderColor: "var(--kt-border)" }}>
      {/* History */}
      <div className="flex items-center gap-0.5 md:gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="kt-btn-ghost w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          title="Undo (⌘Z)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="kt-btn-ghost w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          title="Redo (⌘⇧Z)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
          </svg>
        </button>
      </div>

      {/* Zoom — hidden on mobile */}
      <div className="hidden md:flex items-center gap-1 mx-auto">
        <button
          onClick={() => setZoom(zoom / 1.25)}
          className="kt-btn-ghost w-7 h-7 flex items-center justify-center rounded-lg transition-colors text-base leading-none"
        >
          -
        </button>
        <span className="text-xs font-medium w-10 text-center tabular-nums" style={{ color: "var(--kt-text-secondary)" }}>
          {zoomPercent}%
        </span>
        <button
          onClick={() => setZoom(zoom * 1.25)}
          className="kt-btn-ghost w-7 h-7 flex items-center justify-center rounded-lg transition-colors text-base leading-none"
        >
          +
        </button>
      </div>

      {/* Upload & Done */}
      <div className="flex items-center gap-1.5 md:gap-2 ml-auto">
        {/* Hidden file input for upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("video/"));
            if (files.length > 0) replaceImport(files);
            e.target.value = "";
          }}
        />
        {hasClips && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="kt-btn-import px-2 md:px-3 h-8 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5"
              title="Import new video"
            >
              <span className="hidden md:inline">Import Video</span>
              <span className="md:hidden">Import</span>
            </button>
            <button
              disabled={isExporting}
              onClick={startExport}
              className="kt-btn-accent px-4 h-8 rounded-lg text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}
