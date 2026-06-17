"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PreviewCanvas } from "./PreviewCanvas";
import { CropOverlay } from "./CropOverlay";
import { OverlayLayer } from "./OverlayLayer";
import { DrawingCanvas } from "./DrawingCanvas";
import { usePlayback } from "@/hooks/usePlayback";
import { useEditorStore } from "@/store/editorStore";
import { useVideoImport } from "@/hooks/useVideoImport";
import { getDecoderForFile } from "@/lib/webcodecs/VideoDecoder";
import { togglePlayAction } from "@/lib/playbackActions";
import { useShallow } from "zustand/react/shallow";
import type { Tool } from "@/components/editor/Sidebar";

interface PreviewPanelProps {
  activeTool: Tool;
}

export function PreviewPanel({ activeTool }: PreviewPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const panDragRef = useRef<{ startX: number; startY: number; startPanX: number; startPanY: number } | null>(null);
  const [previewReady, setPreviewReady] = useState(false);

  const isPlaying = useEditorStore((s) => s.isPlaying);
  const duration = useEditorStore((s) => s.duration);
  const currentTime = useEditorStore((s) => s.currentTime);
  const clips = useEditorStore(useShallow((s) => s.clips.filter((c) => c.trackId === "track-video")));
  const clipEffects = useEditorStore((s) => s.clipEffects);
  const cropToolActive = useEditorStore((s) => s.cropToolActive);
  const storeZoom = useEditorStore((s) => s.zoom);
  // 80 = 100% (default fit); scale the preview wrapper accordingly
  const previewScale = storeZoom / 80;
  const { importFiles } = useVideoImport();
  usePlayback(canvasRef, useCallback(() => setPreviewReady(true), []));

  // Reset pan when zoomed back to fit or below
  useEffect(() => {
    if (previewScale <= 1) { setPanX(0); setPanY(0); }
  }, [previewScale]);

  // Reset preview-ready when all clips are removed
  useEffect(() => {
    if (clips.length === 0) setPreviewReady(false);
  }, [clips.length]);

  const handlePanDown = useCallback((e: React.PointerEvent) => {
    if (previewScale <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsPanning(true);
    panDragRef.current = { startX: e.clientX, startY: e.clientY, startPanX: panX, startPanY: panY };
  }, [previewScale, panX, panY]);

  const handlePanMove = useCallback((e: React.PointerEvent) => {
    if (!panDragRef.current) return;
    setPanX(panDragRef.current.startPanX + (e.clientX - panDragRef.current.startX));
    setPanY(panDragRef.current.startPanY + (e.clientY - panDragRef.current.startY));
  }, []);

  const handlePanUp = useCallback(() => {
    panDragRef.current = null;
    setIsPanning(false);
  }, []);

  // Derive aspect ratio from the active clip, adjusted for any crop applied
  const activeClip = clips.find(
    (c) => c.startTime <= currentTime && c.startTime + c.duration > currentTime
  ) ?? clips[0];
  const aspectRatio = (() => {
    if (!activeClip) return "16/9";
    // When crop tool is active we show the full frame, so use the native dimensions
    if (cropToolActive) return `${activeClip.width}/${activeClip.height}`;
    const effects = clipEffects[activeClip.id];
    const cropW = effects?.cropW ?? 1;
    const cropH = effects?.cropH ?? 1;
    // Crop dimensions in pixels — this is the true output aspect ratio
    return `${cropW * activeClip.width}/${cropH * activeClip.height}`;
  })();

  // Sync mute state to the decoder; poll audioBlocked after play starts
  useEffect(() => {
    if (!activeClip) return;
    const decoder = getDecoderForFile(activeClip.file);
    decoder.setMuted(isMuted);
  }, [isMuted, activeClip]);

  // Check if the browser blocked audio after playback starts
  useEffect(() => {
    if (!isPlaying || !activeClip) return;
    const timer = setTimeout(() => {
      const decoder = getDecoderForFile(activeClip.file);
      setAudioBlocked(decoder.audioBlocked);
    }, 300);
    return () => clearTimeout(timer);
  }, [isPlaying, activeClip]);

  const handleMuteToggle = () => {
    setIsMuted((m) => !m);
    if (audioBlocked && isMuted) setAudioBlocked(false);
  };

  const hasClips = clips.length > 0;

  return (
    <div
      className="relative flex-1 flex items-center justify-center overflow-hidden min-h-0"
      style={{ cursor: previewScale > 1 ? (isPanning ? "grabbing" : "grab") : "default", background: "var(--kt-bg-preview)" }}
      onPointerDown={handlePanDown}
      onPointerMove={handlePanMove}
      onPointerUp={handlePanUp}
    >
      {hasClips ? (
        <>
          {/* Aspect-ratio wrapper — canvas fills this, CSS scales it to fit */}
          <div
            className="relative max-w-full max-h-full"
            style={{ aspectRatio, display: "flex", transform: `translate(${panX}px, ${panY}px) scale(${previewScale})`, transformOrigin: "center center" }}
          >
            <PreviewCanvas ref={canvasRef} />

            {/* Loading spinner — shown until first frame renders */}
            {!previewReady && (
              <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: "var(--kt-bg-preview)" }}>
                <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--kt-spinner-border)", borderTopColor: "var(--kt-spinner-top)" }} />
              </div>
            )}

            {/* Text/sticker overlays — always visible */}
            <OverlayLayer />

            {/* Drawing canvas — active only when Annotate tool is selected */}
            <DrawingCanvas isActive={activeTool === "annotate"} />

            {/* Crop handles — only in crop mode */}
            {activeTool === "crop" && <CropOverlay />}
          </div>

          {/* Audio blocked banner */}
          {audioBlocked && !isMuted && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm border text-xs"
              style={{ background: "var(--kt-bg-surface)", borderColor: "var(--kt-border)", color: "var(--kt-text-secondary)" }}
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--kt-accent)" }}>
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Audio blocked by browser — open in Chrome for sound
            </motion.div>
          )}

          {/* Floating playback controls */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={togglePlayAction}
              disabled={duration === 0}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors"
              style={{ background: "var(--kt-text-primary)", color: "var(--kt-bg-base)" }}
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleMuteToggle}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors backdrop-blur-sm"
              style={{ background: "var(--kt-bg-subtle-hover)", color: "var(--kt-text-primary)" }}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              )}
            </motion.button>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 select-none"
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-3 px-8 py-6 rounded-xl border border-dashed transition-colors cursor-pointer group"
            style={{ borderColor: "var(--kt-border-strong)" }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors" style={{ background: "var(--kt-bg-subtle)" }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: "var(--kt-text-secondary)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: "var(--kt-text-primary)" }}>Import a video</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--kt-text-muted)" }}>or drag and drop anywhere</p>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && importFiles(e.target.files)}
          />
        </motion.div>
      )}
    </div>
  );
}
