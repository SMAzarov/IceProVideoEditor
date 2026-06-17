"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TopBar } from "./TopBar";
import { Sidebar, Tool } from "./Sidebar";
import { PreviewPanel } from "./preview/PreviewPanel";
import { TrimPanel } from "./panels/TrimPanel";
import { FinetunePanel } from "./panels/FinetunePanel";
import { FilterPanel } from "./panels/FilterPanel";
import { CropPanel } from "./panels/CropPanel";
import { ResizePanel } from "./panels/ResizePanel";
import { AnnotatePanel } from "./panels/AnnotatePanel";
import { StickerPanel } from "./panels/StickerPanel";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useVideoImport } from "@/hooks/useVideoImport";
import { useExport } from "@/hooks/useExport";
import { useEditorStore } from "@/store/editorStore";
import { useShallow } from "zustand/react/shallow";

export function Editor() {
  const [activeTool, setActiveTool] = useState<Tool>("trim");
  const setCropToolActive = useEditorStore((s) => s.setCropToolActive);
  const { status: exportStatus, progress: exportProgress, outputUrl } = useEditorStore(
    useShallow((s) => ({ status: s.status, progress: s.progress, outputUrl: s.outputUrl }))
  );
  const resetExport = useEditorStore((s) => s.resetExport);
  const isExporting = exportStatus === "preparing" || exportStatus === "encoding";
  const isExportDone = exportStatus === "done" && !!outputUrl;
  const showOverlay = isExporting || isExportDone;
  const { importFiles } = useVideoImport();
  const { downloadExport, cancelExport } = useExport();
  useKeyboardShortcuts();

  const handleToolChange = useCallback((tool: Tool) => {
    setActiveTool(tool);
    setCropToolActive(tool === "crop");
  }, [setCropToolActive]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("video/"));
      if (files.length > 0) importFiles(files);
    },
    [importFiles]
  );

  return (
    <div
      className="relative flex flex-col w-full h-full overflow-hidden rounded-xl"
      style={{ background: "var(--kt-bg-base)" }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Export overlay — blocks interaction during export, shows download when done */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 backdrop-blur-sm rounded-xl"
            style={{ background: "var(--kt-bg-overlay)" }}
          >
            {isExportDone ? (
              <>
                <div className="w-10 h-10 flex items-center justify-center rounded-full" style={{ background: "var(--kt-success-bg)" }}>
                  <svg className="w-5 h-5" style={{ color: "var(--kt-success)" }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-semibold" style={{ color: "var(--kt-text-primary)" }}>Export complete</p>
                <div className="flex items-center gap-3 mt-1">
                  <button
                    onClick={() => { downloadExport(outputUrl!); resetExport(); }}
                    className="px-5 h-9 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                    style={{ background: "var(--kt-success-btn)", color: "var(--kt-text-primary)" }}
                  >
                    Download
                  </button>
                  <button
                    onClick={resetExport}
                    className="kt-btn-cancel px-5 h-9 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold" style={{ color: "var(--kt-text-primary)" }}>Exporting…</p>
                <div className="w-64 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--kt-slider-track)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "var(--kt-accent)" }}
                    animate={{ width: `${exportProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs tabular-nums" style={{ color: "var(--kt-text-tertiary)" }}>{exportProgress}%</p>
                <button
                  onClick={cancelExport}
                  className="kt-btn-cancel mt-1 px-5 h-9 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <TopBar />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden min-h-0 md:flex-row flex-col">
        {/* Left sidebar — hidden on mobile, shown on md+ */}
        <div className="hidden md:flex">
          <Sidebar activeTool={activeTool} onToolChange={handleToolChange} />
        </div>

        {/* Main area */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          {/* Video preview — receives activeTool for crop overlay */}
          <PreviewPanel activeTool={activeTool} />

          {/* Horizontal tool bar — shown on mobile only */}
          <div className="flex md:hidden">
            <Sidebar activeTool={activeTool} onToolChange={handleToolChange} horizontal />
          </div>

          {/* Bottom panel — swaps based on active tool */}
          <AnimatePresence mode="wait" initial={false}>
            {activeTool === "trim" && (
              <motion.div
                key="trim"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
              >
                <TrimPanel />
              </motion.div>
            )}

            {activeTool === "finetune" && (
              <motion.div
                key="finetune"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
              >
                <FinetunePanel />
              </motion.div>
            )}

            {activeTool === "filter" && (
              <motion.div
                key="filter"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
              >
                <FilterPanel />
              </motion.div>
            )}

            {activeTool === "crop" && (
              <motion.div
                key="crop"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
              >
                <CropPanel />
              </motion.div>
            )}

            {activeTool === "resize" && (
              <motion.div
                key="resize"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
              >
                <ResizePanel />
              </motion.div>
            )}

            {activeTool === "annotate" && (
              <motion.div
                key="annotate"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
              >
                <AnnotatePanel />
              </motion.div>
            )}

            {activeTool === "sticker" && (
              <motion.div
                key="sticker"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
              >
                <StickerPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
