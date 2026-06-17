"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useShallow } from "zustand/react/shallow";

export function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingDurationRef = useRef(0);

  const overlays = useEditorStore(useShallow((s) => s.overlays.filter((o) => o.type === "voice")));
  const addVoiceOverlay = useEditorStore((s) => s.addVoiceOverlay);
  const removeOverlay = useEditorStore((s) => s.removeOverlay);
  const updateOverlay = useEditorStore((s) => s.updateOverlay);
  const selectedOverlayId = useEditorStore((s) => s.selectedOverlayId);
  const selectOverlay = useEditorStore((s) => s.selectOverlay);
  const duration = useEditorStore((s) => s.duration);
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const setPlaybackRate = useEditorStore((s) => s.setPlaybackRate);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startRecording = useCallback(async () => {
    // Auto-pause video when starting voice recording
    setPlaying(false);
    setPlaybackRate(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        const url = URL.createObjectURL(blob);
        const duration = recordingDurationRef.current;
        addVoiceOverlay({ audioUrl: url, duration });
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      mediaRecorder.start(100); // collect data every 100ms
      setIsRecording(true);
      setRecordingDuration(0);

      recordingDurationRef.current = 0;
      timerRef.current = setInterval(() => {
        recordingDurationRef.current += 1;
        setRecordingDuration(recordingDurationRef.current);
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  }, [addVoiceOverlay]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    // Restore playback rate so the user can resume playback
    setPlaybackRate(1);
  }, [setPlaybackRate]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      <p className="text-xs font-medium" style={{ color: "var(--kt-text-secondary)" }}>
        Voice Comment
      </p>

      {/* Record button */}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        style={{
          background: isRecording ? "var(--kt-accent)" : "var(--kt-bg-subtle-hover)",
          color: isRecording ? "#fff" : "var(--kt-text-primary)",
        }}
      >
        {isRecording ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            Stop Recording ({formatTime(recordingDuration)})
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            Start Recording
          </>
        )}
      </button>

      {/* Recorded voice overlays list */}
      {overlays.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-1">
          <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--kt-text-muted)" }}>
            Recorded ({overlays.length})
          </p>
          {overlays.map((overlay) => {
            if (overlay.type !== "voice") return null;
            const isSelected = overlay.id === selectedOverlayId;
            const voiceDuration = overlay.endTime - overlay.startTime;
            return (
              <div key={overlay.id}>
                <div
                  onClick={() => selectOverlay(isSelected ? null : overlay.id)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-xs"
                  style={{
                    background: isSelected ? "var(--kt-bg-subtle-hover)" : "transparent",
                    color: "var(--kt-text-primary)",
                  }}
                >
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--kt-accent)" }}>
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  <span className="flex-1 truncate">Voice {formatTime(voiceDuration)}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeOverlay(overlay.id); }}
                    className="p-1 rounded hover:opacity-70 transition-opacity"
                    style={{ color: "var(--kt-text-muted)" }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Start/End time inputs for selected voice */}
                {isSelected && (
                  <div className="flex gap-2 mt-1.5 px-2.5">
                    <div className="flex-1">
                      <label className="text-[10px] block mb-0.5" style={{ color: "var(--kt-text-muted)" }}>Start</label>
                      <input
                        type="number"
                        min={0}
                        max={duration}
                        step={0.1}
                        value={Math.round(overlay.startTime * 10) / 10}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val >= 0 && val < overlay.endTime) {
                            updateOverlay(overlay.id, { startTime: val });
                          }
                        }}
                        className="w-full px-2 py-1 rounded text-xs"
                        style={{
                          background: "var(--kt-bg-subtle)",
                          color: "var(--kt-text-primary)",
                          border: "1px solid var(--kt-border-color, transparent)",
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] block mb-0.5" style={{ color: "var(--kt-text-muted)" }}>End</label>
                      <input
                        type="number"
                        min={0}
                        max={duration}
                        step={0.1}
                        value={Math.round(overlay.endTime * 10) / 10}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val > overlay.startTime && val <= duration) {
                            updateOverlay(overlay.id, { endTime: val });
                          }
                        }}
                        className="w-full px-2 py-1 rounded text-xs"
                        style={{
                          background: "var(--kt-bg-subtle)",
                          color: "var(--kt-text-primary)",
                          border: "1px solid var(--kt-border-color, transparent)",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
