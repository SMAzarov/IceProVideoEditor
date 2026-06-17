"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";
import { togglePlayAction } from "@/lib/playbackActions";

export function useKeyboardShortcuts() {
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const setZoomFn = useEditorStore((s) => s.setZoom);
  const splitClipAt = useEditorStore((s) => s.splitClipAt);
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const removeClip = useEditorStore((s) => s.removeClip);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const captureHistory = useEditorStore((s) => s.captureHistory);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) return;

      const { currentTime, fps, duration, zoom } = useEditorStore.getState();

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlayAction(); // called directly from keydown — valid user gesture
          break;
        case "ArrowLeft":
          e.preventDefault();
          setCurrentTime(currentTime - (e.shiftKey ? 1 : 1 / fps));
          break;
        case "ArrowRight":
          e.preventDefault();
          setCurrentTime(currentTime + (e.shiftKey ? 1 : 1 / fps));
          break;
        case "Home":
          e.preventDefault();
          setCurrentTime(0);
          break;
        case "End":
          e.preventDefault();
          setCurrentTime(duration);
          break;
        case "=":
        case "+":
          if (e.metaKey || e.ctrlKey) { e.preventDefault(); setZoomFn(zoom * 1.25); }
          break;
        case "-":
          if (e.metaKey || e.ctrlKey) { e.preventDefault(); setZoomFn(zoom / 1.25); }
          break;
        case "z":
        case "Z":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            if (e.shiftKey) redo(); else undo();
          }
          break;
        case "s":
        case "S":
          if (selectedClipId) { e.preventDefault(); captureHistory(); splitClipAt(selectedClipId, currentTime); }
          break;
        case "Delete":
        case "Backspace":
          if (selectedClipId) { e.preventDefault(); captureHistory(); removeClip(selectedClipId); }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCurrentTime, setZoomFn, splitClipAt, selectedClipId, removeClip, undo, redo, captureHistory]);
}
