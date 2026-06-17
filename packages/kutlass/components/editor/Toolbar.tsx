"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditorStore } from "@/store/editorStore";
import { useVideoImport } from "@/hooks/useVideoImport";
import { useExport } from "@/hooks/useExport";
import { Button } from "@/components/ui/Button";

export function Toolbar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importFiles } = useVideoImport();
  const { startExport, downloadExport } = useExport();

  const exportStatus = useEditorStore((s) => s.status);
  const exportProgress = useEditorStore((s) => s.progress);
  const outputUrl = useEditorStore((s) => s.outputUrl);
  const resetExport = useEditorStore((s) => s.resetExport);
  const clips = useEditorStore((s) => s.clips);
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const splitClipAt = useEditorStore((s) => s.splitClipAt);
  const currentTime = useEditorStore((s) => s.currentTime);
  const removeClip = useEditorStore((s) => s.removeClip);

  const isExporting = exportStatus === "preparing" || exportStatus === "encoding";
  const hasClips = clips.length > 0;

  return (
    <header className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-6 h-6 bg-violet-600 rounded flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        </div>
        <span className="text-white font-semibold text-sm tracking-tight">kutlass</span>
      </div>

      {/* Import */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        icon={
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        }
      >
        Import
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && importFiles(e.target.files)}
      />

      {/* Divider */}
      <div className="w-px h-5 bg-zinc-700 mx-1" />

      {/* Edit tools */}
      <Button
        variant="ghost"
        size="sm"
        disabled={!selectedClipId}
        onClick={() => selectedClipId && splitClipAt(selectedClipId, currentTime)}
        title="Split clip at playhead (S)"
        icon={
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        }
      >
        Split
      </Button>

      <Button
        variant="ghost"
        size="sm"
        disabled={!selectedClipId}
        onClick={() => selectedClipId && removeClip(selectedClipId)}
        title="Delete selected clip (Delete)"
        icon={
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        }
      >
        Delete
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Keyboard shortcuts hint */}
      <span className="text-xs text-zinc-600 hidden md:block">
        Space to play · S to split · ⌘+/- to zoom
      </span>

      <div className="w-px h-5 bg-zinc-700 mx-1" />

      {/* Export */}
      <AnimatePresence mode="wait">
        {exportStatus === "done" && outputUrl ? (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <Button
              variant="primary"
              size="sm"
              onClick={() => downloadExport(outputUrl)}
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              }
            >
              Download
            </Button>
            <button
              onClick={resetExport}
              className="text-zinc-500 hover:text-zinc-300 text-xs"
            >
              ✕
            </button>
          </motion.div>
        ) : isExporting ? (
          <motion.div
            key="progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-24 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-violet-500 rounded-full"
                animate={{ width: `${exportProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-xs text-zinc-400">{exportProgress}%</span>
          </motion.div>
        ) : (
          <Button
            key="export"
            variant="primary"
            size="sm"
            disabled={!hasClips}
            onClick={startExport}
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          >
            Export
          </Button>
        )}
      </AnimatePresence>
    </header>
  );
}
