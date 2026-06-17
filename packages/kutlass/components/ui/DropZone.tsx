"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVideoImport } from "@/hooks/useVideoImport";

export function DropZone({ children }: { children: React.ReactNode }) {
  const [isDragging, setIsDragging] = useState(false);
  const { importFiles } = useVideoImport();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("video/")
      );
      if (files.length > 0) {
        importFiles(files);
      }
    },
    [importFiles]
  );

  return (
    <div
      className="relative w-full h-full"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm border-2 border-dashed rounded-lg pointer-events-none"
            style={{ background: "var(--kt-bg-overlay)", borderColor: "var(--kt-accent)" }}
          >
            <div className="text-4xl mb-3">🎬</div>
            <p className="font-semibold text-lg" style={{ color: "var(--kt-text-primary)" }}>Drop video to import</p>
            <p className="text-sm mt-1" style={{ color: "var(--kt-text-muted)" }}>MP4, WebM, MOV, MKV</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
