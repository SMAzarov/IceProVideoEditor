"use client";
"use client";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// src/Kutlass.tsx
import { useEffect as useEffect10, useMemo } from "react";

// components/editor/Editor.tsx
import { useState as useState9, useCallback as useCallback14 } from "react";
import { AnimatePresence, motion as motion3 } from "framer-motion";

// components/editor/TopBar.tsx
import { useRef, useState, useCallback as useCallback3, useEffect } from "react";

// store/editorStore.ts
import { create } from "zustand";

// store/slices/timelineSlice.ts
import { nanoid } from "nanoid";
var DEFAULT_TRACKS = [
  { id: "track-video", type: "video", name: "Video", muted: false, locked: false },
  { id: "track-audio", type: "audio", name: "Audio", muted: false, locked: false },
  { id: "track-text", type: "text", name: "Text", muted: false, locked: false },
  { id: "track-effects", type: "effects", name: "Effects", muted: false, locked: false }
];
var createTimelineSlice = (set, get) => ({
  clips: [],
  tracks: DEFAULT_TRACKS,
  currentTime: 0,
  duration: 0,
  zoom: 80,
  selectedClipId: null,
  addClip: (clip) => set((state) => {
    const newClip = __spreadProps(__spreadValues({}, clip), { id: nanoid() });
    const newClips = [...state.clips, newClip];
    const duration = Math.max(...newClips.map((c) => c.startTime + c.duration), 0);
    return { clips: newClips, duration };
  }),
  removeClip: (id) => set((state) => {
    const newClips = state.clips.filter((c) => c.id !== id);
    const duration = newClips.length > 0 ? Math.max(...newClips.map((c) => c.startTime + c.duration)) : 0;
    return { clips: newClips, duration, selectedClipId: state.selectedClipId === id ? null : state.selectedClipId };
  }),
  updateClip: (id, updates) => set((state) => ({
    clips: state.clips.map((c) => c.id === id ? __spreadValues(__spreadValues({}, c), updates) : c)
  })),
  moveClip: (id, startTime) => set((state) => {
    const newClips = state.clips.map(
      (c) => c.id === id ? __spreadProps(__spreadValues({}, c), { startTime: Math.max(0, startTime) }) : c
    );
    const duration = Math.max(...newClips.map((c) => c.startTime + c.duration));
    return { clips: newClips, duration };
  }),
  trimClipStart: (id, newTrimIn, newStartTime, newDuration) => set((state) => {
    const newClips = state.clips.map(
      (c) => c.id === id ? __spreadProps(__spreadValues({}, c), { trimIn: newTrimIn, startTime: newStartTime, duration: newDuration }) : c
    );
    const clip = newClips.find((c) => c.id === id);
    const currentTime = clip ? Math.max(clip.startTime, Math.min(state.currentTime, clip.startTime + clip.duration)) : state.currentTime;
    return { clips: newClips, currentTime };
  }),
  trimClipEnd: (id, newTrimOut, newDuration) => set((state) => {
    const newClips = state.clips.map(
      (c) => c.id === id ? __spreadProps(__spreadValues({}, c), { trimOut: newTrimOut, duration: newDuration }) : c
    );
    const duration = Math.max(...newClips.map((c) => c.startTime + c.duration));
    const clip = newClips.find((c) => c.id === id);
    const currentTime = clip ? Math.max(clip.startTime, Math.min(state.currentTime, clip.startTime + clip.duration)) : state.currentTime;
    return { clips: newClips, duration, currentTime };
  }),
  splitClipAt: (id, time) => {
    const state = get();
    const clip = state.clips.find((c) => c.id === id);
    if (!clip) return null;
    const localTime = time - clip.startTime;
    if (localTime <= 0 || localTime >= clip.duration) return null;
    const firstHalf = __spreadProps(__spreadValues({}, clip), {
      duration: localTime,
      trimOut: clip.trimIn + localTime
    });
    const secondHalf = __spreadProps(__spreadValues({}, clip), {
      id: nanoid(),
      startTime: time,
      duration: clip.duration - localTime,
      trimIn: clip.trimIn + localTime
    });
    set((state2) => ({
      clips: state2.clips.map((c) => c.id === id ? firstHalf : c).concat(secondHalf)
    }));
    return secondHalf.id;
  },
  setCurrentTime: (time) => set((state) => ({ currentTime: Math.max(0, Math.min(time, state.duration)) })),
  setZoom: (zoom) => set(() => ({ zoom: Math.max(20, Math.min(300, zoom)) })),
  setSelectedClip: (id) => set(() => ({ selectedClipId: id })),
  recomputeDuration: () => set((state) => {
    const duration = state.clips.length > 0 ? Math.max(...state.clips.map((c) => c.startTime + c.duration)) : 0;
    return { duration };
  })
});

// store/slices/playbackSlice.ts
var createPlaybackSlice = (set) => ({
  isPlaying: false,
  fps: 30,
  playbackRate: 1,
  muted: true,
  trimScrub: null,
  setPlaying: (playing) => set(() => ({ isPlaying: playing })),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setFps: (fps) => set(() => ({ fps })),
  setPlaybackRate: (rate) => set(() => ({ playbackRate: rate })),
  setMuted: (muted) => set(() => ({ muted })),
  toggleMuted: () => set((state) => ({ muted: !state.muted })),
  setTrimScrub: (scrub) => set(() => ({ trimScrub: scrub }))
});

// types/editor.ts
var DEFAULT_EFFECTS = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  rotation: 0,
  cropX: 0,
  cropY: 0,
  cropW: 1,
  cropH: 1,
  opacity: 1,
  speed: 1
};
var DEFAULT_EXPORT_SETTINGS = {
  format: "mp4",
  resolution: "720p",
  fps: 30,
  bitrate: 4e3
};

// store/slices/effectsSlice.ts
var createEffectsSlice = (set, get) => ({
  clipEffects: {},
  cropToolActive: false,
  setClipEffect: (clipId, key, value) => set((state) => {
    var _a;
    return {
      clipEffects: __spreadProps(__spreadValues({}, state.clipEffects), {
        [clipId]: __spreadProps(__spreadValues({}, (_a = state.clipEffects[clipId]) != null ? _a : DEFAULT_EFFECTS), {
          [key]: value
        })
      })
    };
  }),
  setClipEffects: (clipId, effects) => set((state) => {
    var _a;
    return {
      clipEffects: __spreadProps(__spreadValues({}, state.clipEffects), {
        [clipId]: __spreadValues(__spreadValues({}, (_a = state.clipEffects[clipId]) != null ? _a : DEFAULT_EFFECTS), effects)
      })
    };
  }),
  resetClipEffects: (clipId) => set((state) => {
    const next = __spreadValues({}, state.clipEffects);
    delete next[clipId];
    return { clipEffects: next };
  }),
  getClipEffects: (clipId) => {
    var _a;
    const state = get();
    return (_a = state.clipEffects[clipId]) != null ? _a : DEFAULT_EFFECTS;
  },
  setCropToolActive: (active) => set(() => ({ cropToolActive: active }))
});

// store/slices/exportSlice.ts
var createExportSlice = (set) => ({
  status: "idle",
  progress: 0,
  outputUrl: null,
  error: null,
  settings: DEFAULT_EXPORT_SETTINGS,
  setExportStatus: (status) => set(() => ({ status })),
  setExportProgress: (progress) => set(() => ({ progress })),
  setOutputUrl: (outputUrl) => set(() => ({ outputUrl })),
  setExportError: (error) => set(() => ({ error })),
  updateExportSettings: (settings) => set((state) => ({ settings: __spreadValues(__spreadValues({}, state.settings), settings) })),
  resetExport: () => set(() => ({ status: "idle", progress: 0, outputUrl: null, error: null }))
});

// store/slices/overlaysSlice.ts
import { nanoid as nanoid2 } from "nanoid";
var createOverlaysSlice = (set, get) => ({
  overlays: [],
  selectedOverlayId: null,
  stickerDuration: 3,
  freezeOnOverlay: true,
  addTextOverlay: (overlay) => {
    var _a, _b;
    const id = nanoid2();
    const currentTime = (_a = get().currentTime) != null ? _a : 0;
    const annotationDuration = (_b = get().annotationDuration) != null ? _b : 3;
    const endTime = currentTime + annotationDuration;
    set((state) => ({
      overlays: [...state.overlays, __spreadProps(__spreadValues({}, overlay), { id, type: "text", startTime: currentTime, endTime })],
      selectedOverlayId: id
    }));
    if (get().freezeOnOverlay && typeof get().addFreeze === "function") {
      get().addFreeze(currentTime, endTime);
    }
    return id;
  },
  addStickerOverlay: (overlay) => {
    var _a, _b;
    const id = nanoid2();
    const currentTime = (_a = get().currentTime) != null ? _a : 0;
    const stickerDuration = (_b = get().stickerDuration) != null ? _b : 3;
    const endTime = currentTime + stickerDuration;
    set((state) => ({
      overlays: [...state.overlays, __spreadProps(__spreadValues({}, overlay), { id, type: "sticker", startTime: currentTime, endTime })],
      selectedOverlayId: id
    }));
    if (get().freezeOnOverlay && typeof get().addFreeze === "function") {
      get().addFreeze(currentTime, endTime);
    }
    return id;
  },
  addVoiceOverlay: (overlay) => {
    var _a;
    const id = nanoid2();
    const currentTime = (_a = get().currentTime) != null ? _a : 0;
    const endTime = currentTime + overlay.duration;
    set((state) => ({
      overlays: [...state.overlays, __spreadProps(__spreadValues({}, overlay), { id, type: "voice", startTime: currentTime, endTime })],
      selectedOverlayId: id
    }));
    if (typeof get().addFreeze === "function") {
      get().addFreeze(currentTime, endTime);
    }
    return id;
  },
  updateOverlay: (id, updates) => set((state) => ({
    overlays: state.overlays.map(
      (o) => o.id === id ? __spreadValues(__spreadValues({}, o), updates) : o
    )
  })),
  removeOverlay: (id) => set((state) => ({
    overlays: state.overlays.filter((o) => o.id !== id),
    selectedOverlayId: state.selectedOverlayId === id ? null : state.selectedOverlayId
  })),
  selectOverlay: (id) => set(() => ({ selectedOverlayId: id })),
  clearOverlays: () => set(() => ({ overlays: [], selectedOverlayId: null })),
  setStickerDuration: (duration) => set(() => ({ stickerDuration: duration })),
  setFreezeOnOverlay: (value) => set(() => ({ freezeOnOverlay: value }))
});

// store/slices/drawingSlice.ts
function createDrawingSlice(set, get) {
  return {
    strokes: [],
    drawingTool: "pen",
    drawingColor: "#ff0000",
    drawingWidth: 4,
    annotationDuration: 3,
    addStroke: (stroke) => {
      var _a, _b;
      const currentTime = (_a = get().currentTime) != null ? _a : 0;
      const annotationDuration = (_b = get().annotationDuration) != null ? _b : 3;
      const endTime = currentTime + annotationDuration;
      set((s) => ({
        strokes: [
          ...s.strokes,
          __spreadProps(__spreadValues({}, stroke), { startTime: currentTime, endTime })
        ]
      }));
      if (get().freezeOnOverlay && typeof get().addFreeze === "function") {
        get().addFreeze(currentTime, endTime);
      }
    },
    undoStroke: () => set((s) => ({ strokes: s.strokes.slice(0, -1) })),
    clearStrokes: () => set(() => ({ strokes: [] })),
    setDrawingTool: (tool) => set(() => ({ drawingTool: tool })),
    setDrawingColor: (color) => set(() => ({ drawingColor: color })),
    setDrawingWidth: (width) => set(() => ({ drawingWidth: width })),
    setAnnotationDuration: (duration) => set(() => ({ annotationDuration: duration }))
  };
}

// store/slices/historySlice.ts
var createHistorySlice = (set, get) => ({
  past: [],
  future: [],
  captureHistory: () => {
    const s = get();
    const snapshot = {
      clips: s.clips,
      duration: s.duration,
      clipEffects: s.clipEffects,
      overlays: s.overlays
    };
    set(() => ({ past: [...s.past.slice(-49), snapshot], future: [] }));
  },
  undo: () => set((state) => {
    if (state.past.length === 0) return {};
    const entry = state.past[state.past.length - 1];
    const current = {
      clips: state.clips,
      duration: state.duration,
      clipEffects: state.clipEffects,
      overlays: state.overlays
    };
    return __spreadValues({
      past: state.past.slice(0, -1),
      future: [current, ...state.future]
    }, entry);
  }),
  redo: () => set((state) => {
    if (state.future.length === 0) return {};
    const entry = state.future[0];
    const current = {
      clips: state.clips,
      duration: state.duration,
      clipEffects: state.clipEffects,
      overlays: state.overlays
    };
    return __spreadValues({
      past: [...state.past, current],
      future: state.future.slice(1)
    }, entry);
  })
});

// store/slices/freezeSlice.ts
import { nanoid as nanoid3 } from "nanoid";
var createFreezeSlice = (set) => ({
  freezes: [],
  addFreeze: (startTime, endTime) => {
    const id = nanoid3();
    set((state) => ({
      freezes: [...state.freezes, { id, startTime, endTime }]
    }));
    return id;
  },
  removeFreeze: (id) => set((state) => ({
    freezes: state.freezes.filter((f) => f.id !== id)
  })),
  clearFreezes: () => set(() => ({ freezes: [] }))
});

// store/slices/transitionSlice.ts
import { nanoid as nanoid4 } from "nanoid";
var createTransitionSlice = (set, get) => ({
  transitions: [],
  addTransition: (clipAId, clipBId, duration = 0.3) => {
    const state = get();
    const transitions = state.transitions;
    const exists = transitions.some(
      (t) => t.clipAId === clipAId && t.clipBId === clipBId
    );
    if (exists) return null;
    const id = nanoid4();
    set((state2) => {
      var _a;
      return {
        transitions: [
          ...(_a = state2.transitions) != null ? _a : [],
          { id, type: "crossfade", duration, clipAId, clipBId }
        ]
      };
    });
    return id;
  },
  removeTransition: (id) => set((state) => {
    var _a;
    return {
      transitions: ((_a = state.transitions) != null ? _a : []).filter((t) => t.id !== id)
    };
  }),
  updateTransitionDuration: (id, duration) => set((state) => {
    var _a;
    return {
      transitions: ((_a = state.transitions) != null ? _a : []).map(
        (t) => t.id === id ? __spreadProps(__spreadValues({}, t), { duration: Math.max(0.05, Math.min(1, duration)) }) : t
      )
    };
  })
});

// store/slices/shapeSlice.ts
import { nanoid as nanoid5 } from "nanoid";
var createShapeSlice = (set, get) => ({
  shapes: [],
  selectedShapeId: null,
  shapeTool: "rectangle",
  shapeStyle: "simple",
  shapeColor: "#ff0000",
  shapeFillColor: "transparent",
  shapeStrokeWidth: 3,
  shapeText: "Text",
  shapeFontSize: 32,
  shapeDuration: 3,
  annotateMode: "draw",
  setAnnotateMode: (mode) => set(() => ({ annotateMode: mode })),
  addShape: (shape) => {
    var _a, _b;
    const id = nanoid5();
    const currentTime = (_a = get().currentTime) != null ? _a : 0;
    const duration = (_b = get().shapeDuration) != null ? _b : 3;
    set((s) => ({
      shapes: [
        ...s.shapes,
        __spreadProps(__spreadValues({}, shape), { id, startTime: currentTime, endTime: currentTime + duration })
      ]
    }));
    return id;
  },
  updateShape: (id, updates) => set((s) => ({
    shapes: s.shapes.map((sh) => sh.id === id ? __spreadValues(__spreadValues({}, sh), updates) : sh)
  })),
  removeShape: (id) => set((s) => ({
    shapes: s.shapes.filter((sh) => sh.id !== id),
    selectedShapeId: s.selectedShapeId === id ? null : s.selectedShapeId
  })),
  selectShape: (id) => set(() => ({ selectedShapeId: id })),
  clearShapes: () => set(() => ({ shapes: [], selectedShapeId: null })),
  setShapeTool: (tool) => set(() => ({ shapeTool: tool })),
  setShapeStyle: (style) => set(() => ({ shapeStyle: style })),
  setShapeColor: (color) => set(() => ({ shapeColor: color })),
  setShapeFillColor: (color) => set(() => ({ shapeFillColor: color })),
  setShapeStrokeWidth: (width) => set(() => ({ shapeStrokeWidth: width })),
  setShapeText: (text) => set(() => ({ shapeText: text })),
  setShapeFontSize: (size) => set(() => ({ shapeFontSize: size })),
  setShapeDuration: (duration) => set(() => ({ shapeDuration: duration }))
});

// store/slices/themeSlice.ts
var LS_KEY = "kt-theme";
function getInitialTheme() {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(LS_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
}
function applyTheme(theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-kt-theme", theme);
  document.documentElement.style.background = theme === "dark" ? "#1c1c1c" : "#f0f2f5";
  document.body.style.background = theme === "dark" ? "#1c1c1c" : "#f0f2f5";
}
var createThemeSlice = (set) => {
  const initial = getInitialTheme();
  return {
    theme: initial,
    setTheme: (theme) => {
      set(() => ({ theme }));
      localStorage.setItem(LS_KEY, theme);
      applyTheme(theme);
    },
    toggleTheme: () => {
      set((state) => {
        const next = state.theme === "dark" ? "light" : "dark";
        localStorage.setItem(LS_KEY, next);
        applyTheme(next);
        return { theme: next };
      });
    }
  };
};

// store/editorStore.ts
var useEditorStore = create()((set, get) => __spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues({}, createTimelineSlice(set, get)), createPlaybackSlice(set)), createEffectsSlice(
  set,
  get
)), createExportSlice(set)), createOverlaysSlice(
  set,
  get
)), createDrawingSlice(
  set,
  get
)), createHistorySlice(
  set,
  get
)), createFreezeSlice(set)), createTransitionSlice(
  set,
  get
)), createShapeSlice(
  set,
  get
)), createThemeSlice(set)));

// hooks/useExport.ts
import { useCallback } from "react";

// lib/webcodecs/VideoDecoder.ts
var ClipVideoDecoder = class {
  constructor() {
    this.video = null;
    this.objectUrl = null;
    this.loadedFile = null;
    this.metadata = null;
    this._muted = false;
    this._audioBlocked = false;
    // Serialise seek operations so concurrent requestFrame calls don't race.
    this.seekChain = Promise.resolve();
    // Incrementing this number aborts all in-flight seeks (e.g. when playback starts).
    this.seekGeneration = 0;
  }
  async getMetadata(file) {
    if (this.metadata && this.loadedFile === file) return this.metadata;
    await this.ensureVideo(file);
    return this.metadata;
  }
  requestFrame(file, timeSeconds) {
    const gen = this.seekGeneration;
    const result = this.seekChain.then(async () => {
      if (this.seekGeneration !== gen) return null;
      await this.ensureVideo(file);
      if (this.seekGeneration !== gen) return null;
      return this.capture(timeSeconds);
    });
    this.seekChain = result.then(() => {
    }, () => {
    });
    return result;
  }
  /** Capture current frame without seeking — used during live playback. */
  captureCurrentFrame() {
    const video = this.video;
    if (!video) return null;
    return this.frameFromVideo(video, video.currentTime);
  }
  getVideoCurrentTime() {
    var _a, _b;
    return (_b = (_a = this.video) == null ? void 0 : _a.currentTime) != null ? _b : 0;
  }
  /** Start native video playback. Aborts any in-flight frame seeks first. */
  async startPlayback(fromTime) {
    const video = this.video;
    if (!video) return;
    this.seekGeneration++;
    this.seekChain = Promise.resolve();
    video.muted = this._muted;
    video.currentTime = fromTime;
    try {
      await video.play();
    } catch (e) {
      video.muted = true;
      try {
        await video.play();
        this._audioBlocked = true;
      } catch (e2) {
      }
    }
  }
  get audioBlocked() {
    return this._audioBlocked;
  }
  stopPlayback() {
    var _a;
    (_a = this.video) == null ? void 0 : _a.pause();
  }
  setMuted(muted) {
    this._muted = muted;
    if (this.video) this.video.muted = muted;
  }
  getMuted() {
    return this._muted;
  }
  ensureVideo(file) {
    if (this.video && this.loadedFile === file) return Promise.resolve();
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    return new Promise((resolve, reject) => {
      this.objectUrl = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "auto";
      video.playsInline = true;
      video.muted = true;
      video.src = this.objectUrl;
      const onMeta = () => {
        this.video = video;
        this.loadedFile = file;
        this.metadata = {
          duration: video.duration,
          width: video.videoWidth || 1280,
          height: video.videoHeight || 720,
          fps: 30,
          codec: "browser-native"
        };
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error(`Failed to load video: ${file.name}`));
      };
      const cleanup = () => {
        video.removeEventListener("loadedmetadata", onMeta);
        video.removeEventListener("error", onError);
      };
      video.addEventListener("loadedmetadata", onMeta);
      video.addEventListener("error", onError);
    });
  }
  capture(timeSeconds) {
    const video = this.video;
    if (!video) return Promise.resolve(null);
    if (Math.abs(video.currentTime - timeSeconds) < 0.016) {
      return Promise.resolve(this.frameFromVideo(video, timeSeconds));
    }
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        video.removeEventListener("seeked", onSeeked);
        resolve(this.frameFromVideo(video, timeSeconds));
      }, 3e3);
      const onSeeked = () => {
        clearTimeout(timer);
        resolve(this.frameFromVideo(video, timeSeconds));
      };
      video.addEventListener("seeked", onSeeked, { once: true });
      video.currentTime = timeSeconds;
    });
  }
  frameFromVideo(video, timeSeconds) {
    try {
      return new VideoFrame(video, { timestamp: Math.round(timeSeconds * 1e6) });
    } catch (e) {
      return this.frameFromCanvas(video, timeSeconds);
    }
  }
  frameFromCanvas(video, timeSeconds) {
    try {
      const canvas = new OffscreenCanvas(video.videoWidth || 1280, video.videoHeight || 720);
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0);
      return new VideoFrame(canvas, { timestamp: Math.round(timeSeconds * 1e6) });
    } catch (e) {
      return null;
    }
  }
  dispose() {
    var _a;
    (_a = this.video) == null ? void 0 : _a.pause();
    this.video = null;
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.metadata = null;
    this.loadedFile = null;
  }
};
var registry = /* @__PURE__ */ new Map();
function getDecoderForFile(file) {
  const key = `${file.name}::${file.size}::${file.lastModified}`;
  if (!registry.has(key)) registry.set(key, new ClipVideoDecoder());
  return registry.get(key);
}

// lib/webcodecs/FrameRenderer.ts
var FrameRenderer = class {
  renderFrame(frame, canvas, effects) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const srcX = effects.cropX * frame.displayWidth;
    const srcY = effects.cropY * frame.displayHeight;
    const srcW = effects.cropW * frame.displayWidth;
    const srcH = effects.cropH * frame.displayHeight;
    const w = Math.max(1, Math.round(srcW));
    const h = Math.max(1, Math.round(srcH));
    canvas.width = w;
    canvas.height = h;
    ctx.save();
    ctx.globalAlpha = effects.opacity;
    const filters = [];
    if (effects.brightness !== 0) filters.push(`brightness(${1 + effects.brightness / 100})`);
    if (effects.contrast !== 0) filters.push(`contrast(${1 + effects.contrast / 100})`);
    if (effects.saturation !== 0) filters.push(`saturate(${1 + effects.saturation / 100})`);
    ctx.filter = filters.length > 0 ? filters.join(" ") : "none";
    if (effects.rotation !== 0) {
      ctx.translate(w / 2, h / 2);
      ctx.rotate(effects.rotation * Math.PI / 180);
      ctx.translate(-w / 2, -h / 2);
    }
    ctx.drawImage(frame, srcX, srcY, srcW, srcH, 0, 0, w, h);
    ctx.restore();
  }
  clear(canvas) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
};

// lib/audioUtils.ts
async function blobToWav(blob) {
  const audioCtx = new AudioContext();
  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;
  const pcmData = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    let sample = 0;
    for (let ch = 0; ch < numChannels; ch++) {
      sample += audioBuffer.getChannelData(ch)[i];
    }
    pcmData[i] = sample / numChannels;
  }
  audioCtx.close();
  const numSamples = pcmData.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, numSamples * 2, true);
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, pcmData[i]));
    const val = s < 0 ? s * 32768 : s * 32767;
    view.setInt16(offset, val, true);
    offset += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}
async function padWavWithSilence(wavBuf, padSeconds) {
  if (padSeconds <= 0) return wavBuf;
  const view = new DataView(wavBuf);
  const sampleRate = view.getUint32(24, true);
  const dataSize = view.getUint32(40, true);
  const numSamples = dataSize / 2;
  const padSamples = Math.round(sampleRate * padSeconds);
  const padBytes = padSamples * 2;
  const newDataSize = dataSize + padBytes;
  const newBuf = new ArrayBuffer(44 + newDataSize);
  const newView = new DataView(newBuf);
  for (let i = 0; i < 44; i++) {
    newView.setUint8(i, view.getUint8(i));
  }
  newView.setUint32(4, 36 + newDataSize, true);
  newView.setUint32(40, newDataSize, true);
  const src = new Uint8Array(wavBuf, 44, dataSize);
  const dst = new Uint8Array(newBuf, 44 + padBytes, dataSize);
  dst.set(src);
  return newBuf;
}
function trimWavEnd(wavBuf, maxDurationSeconds) {
  const view = new DataView(wavBuf);
  const sampleRate = view.getUint32(24, true);
  const dataSize = view.getUint32(40, true);
  const numSamples = dataSize / 2;
  const duration = numSamples / sampleRate;
  if (duration <= maxDurationSeconds) return wavBuf;
  const trimmedSamples = Math.round(sampleRate * maxDurationSeconds);
  const trimmedDataSize = trimmedSamples * 2;
  const newBuf = new ArrayBuffer(44 + trimmedDataSize);
  const newView = new DataView(newBuf);
  for (let i = 0; i < 44; i++) {
    newView.setUint8(i, view.getUint8(i));
  }
  newView.setUint32(4, 36 + trimmedDataSize, true);
  newView.setUint32(40, trimmedDataSize, true);
  const src = new Uint8Array(wavBuf, 44, trimmedDataSize);
  const dst = new Uint8Array(newBuf, 44, trimmedDataSize);
  dst.set(src);
  return newBuf;
}
function padWavEnd(wavBuf, targetDurationSeconds) {
  const view = new DataView(wavBuf);
  const sampleRate = view.getUint32(24, true);
  const dataSize = view.getUint32(40, true);
  const numSamples = dataSize / 2;
  const duration = numSamples / sampleRate;
  if (duration >= targetDurationSeconds) return wavBuf;
  const padSamples = Math.round(sampleRate * (targetDurationSeconds - duration));
  const padBytes = padSamples * 2;
  const newDataSize = dataSize + padBytes;
  const newBuf = new ArrayBuffer(44 + newDataSize);
  const newView = new DataView(newBuf);
  for (let i = 0; i < 44; i++) {
    newView.setUint8(i, view.getUint8(i));
  }
  newView.setUint32(4, 36 + newDataSize, true);
  newView.setUint32(40, newDataSize, true);
  const src = new Uint8Array(wavBuf, 44, dataSize);
  const dst = new Uint8Array(newBuf, 44, dataSize);
  dst.set(src);
  return newBuf;
}
function mergeWavBuffers(buffers) {
  if (buffers.length === 0) throw new Error("No WAV buffers to merge");
  if (buffers.length === 1) return buffers[0];
  const firstView = new DataView(buffers[0]);
  const sampleRate = firstView.getUint32(24, true);
  const firstDataSize = firstView.getUint32(40, true);
  let totalDataSize = firstDataSize;
  for (let i = 1; i < buffers.length; i++) {
    const view = new DataView(buffers[i]);
    totalDataSize += view.getUint32(40, true);
  }
  const mergedBuf = new ArrayBuffer(44 + totalDataSize);
  const mergedView = new DataView(mergedBuf);
  for (let i = 0; i < 44; i++) {
    mergedView.setUint8(i, firstView.getUint8(i));
  }
  mergedView.setUint32(4, 36 + totalDataSize, true);
  mergedView.setUint32(40, totalDataSize, true);
  let offset = 44;
  for (const buf of buffers) {
    const view = new DataView(buf);
    const dataSize = view.getUint32(40, true);
    const src = new Uint8Array(buf, 44, dataSize);
    const dst = new Uint8Array(mergedBuf, offset, dataSize);
    dst.set(src);
    offset += dataSize;
  }
  return mergedBuf;
}
function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// src/ffmpegConfig.ts
var config = {
  coreJS: "/ffmpeg/ffmpeg-core.js",
  coreWasm: "/ffmpeg/ffmpeg-core.wasm"
};
function setFFmpegPaths(paths) {
  Object.assign(config, paths);
}
function getFFmpegPaths() {
  return config;
}

// lib/ffmpeg/ffmpegClient.ts
var ffmpegInstance = null;
var initPromise = null;
async function getFFmpeg() {
  if (ffmpegInstance) return ffmpegInstance;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const ffmpegUtil = await import("@ffmpeg/util");
    const toBlobURL = ffmpegUtil.toBlobURL;
    const ffmpeg = new FFmpeg();
    ffmpeg.on("log", ({ message }) => {
      console.log("[FFmpeg]", message);
    });
    const paths = getFFmpegPaths();
    await ffmpeg.load({
      coreURL: await toBlobURL(paths.coreJS, "text/javascript"),
      wasmURL: await toBlobURL(paths.coreWasm, "application/wasm")
    });
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();
  return initPromise;
}

// lib/ffmpeg/exportPipeline.ts
function drawArrowhead(ctx, fromX, fromY, toX, toY, headLength) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.save();
  ctx.translate(toX, toY);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-headLength, -headLength * 0.4);
  ctx.lineTo(-headLength, headLength * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
function drawStrokes(ctx, strokes, w, h) {
  for (const stroke of strokes) {
    if (stroke.points.length < 2) continue;
    ctx.save();
    const isEraser = stroke.tool === "eraser";
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.strokeStyle = isEraser ? "rgba(0,0,0,1)" : stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const p0 = stroke.points[0];
    const p1 = stroke.points[stroke.points.length - 1];
    const x0 = p0.x * w;
    const y0 = p0.y * h;
    const x1 = p1.x * w;
    const y1 = p1.y * h;
    if (stroke.tool === "arrow" || stroke.tool === "straight") {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      if (stroke.tool === "arrow") {
        ctx.fillStyle = isEraser ? "rgba(0,0,0,1)" : stroke.color;
        drawArrowhead(ctx, x0, y0, x1, y1, Math.max(12, stroke.width * 3));
      }
    } else if (stroke.tool === "curved") {
      if (stroke.points.length >= 3) {
        const cp = stroke.points[1];
        const cx = cp.x * w;
        const cy = cp.y * h;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(cx, cy, x1, y1);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x * w, stroke.points[i].y * h);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
}
async function drawOverlays(ctx, overlays, w, h) {
  var _a;
  for (const overlay of overlays) {
    if (overlay.type === "voice") continue;
    const o = overlay;
    const px = o.x * w;
    const py = o.y * h;
    if (o.type === "text") {
      const t = o;
      const size = Math.round(t.fontSize / 720 * h);
      ctx.save();
      ctx.font = `${t.bold ? "bold " : ""}${size}px ${(_a = t.fontFamily) != null ? _a : "sans-serif"}`;
      ctx.fillStyle = t.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(t.text, px, py);
      ctx.restore();
    } else {
      const s = o;
      const baseSize = Math.round(80 * s.scale * (h / 720));
      if (s.imageUrl) {
        try {
          const resp = await fetch(s.imageUrl);
          const blob = await resp.blob();
          const bmp = await createImageBitmap(blob);
          ctx.save();
          ctx.drawImage(bmp, px - baseSize / 2, py - baseSize / 2, baseSize, baseSize);
          bmp.close();
          ctx.restore();
        } catch (e) {
        }
      } else if (s.emoji) {
        const size = Math.round(60 * s.scale * (h / 720));
        ctx.save();
        ctx.font = `${size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(s.emoji, px, py);
        ctx.restore();
      }
    }
  }
}
function drawShapes(ctx, shapes, w, h) {
  for (const shape of shapes) {
    ctx.save();
    const cx = shape.x * w;
    const cy = shape.y * h;
    const sw = shape.width * w;
    const sh = shape.height * h;
    const halfW = sw / 2;
    const halfH = sh / 2;
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.strokeWidth;
    ctx.fillStyle = shape.fillColor;
    if (shape.type === "rectangle") {
      ctx.beginPath();
      ctx.rect(cx - halfW, cy - halfH, sw, sh);
      if (shape.fillColor !== "transparent") ctx.fill();
      ctx.stroke();
    } else if (shape.type === "circle") {
      ctx.beginPath();
      ctx.ellipse(cx, cy, halfW, halfH, 0, 0, Math.PI * 2);
      if (shape.fillColor !== "transparent") ctx.fill();
      ctx.stroke();
    } else if (shape.type === "text") {
      const size = Math.round(shape.fontSize * (h / 720));
      ctx.font = `bold ${size}px sans-serif`;
      ctx.fillStyle = shape.color;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const maxW = sw > 10 ? sw : w * 0.3;
      const maxH = sh > 10 ? sh : h * 0.15;
      const tx = cx - maxW / 2;
      const ty = cy - maxH / 2;
      const words = shape.text.split(" ");
      const lines = [];
      let currentLine = "";
      for (const word of words) {
        const testLine = currentLine ? currentLine + " " + word : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxW && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      const lineHeight = size * 1.3;
      const maxLines = Math.floor(maxH / lineHeight);
      ctx.save();
      ctx.beginPath();
      ctx.rect(tx, ty, maxW, maxH);
      ctx.clip();
      for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
        ctx.fillText(lines[i], tx, ty + i * lineHeight);
      }
      ctx.restore();
    }
    ctx.restore();
  }
}
function getOutputSize(clip, effects, resolution) {
  const cropW = Math.round(clip.width * effects.cropW);
  const cropH = Math.round(clip.height * effects.cropH);
  if (resolution === "original") return { w: cropW, h: cropH };
  const targets = {
    "1080p": { w: 1920, h: 1080 },
    "720p": { w: 1280, h: 720 },
    "480p": { w: 854, h: 480 }
  };
  const target = targets[resolution];
  if (!target) return { w: cropW, h: cropH };
  const aspect = cropW / cropH;
  let w = target.w;
  let h = Math.round(w / aspect);
  if (h > target.h) {
    h = target.h;
    w = Math.round(h * aspect);
  }
  return { w: w & ~1, h: h & ~1 };
}
async function runExport(job) {
  var _a, _b, _c, _d, _e, _f;
  const { clips, settings, effectsMap, strokes, overlays, freezes, onProgress, signal } = job;
  const ffmpeg = await getFFmpeg();
  const renderer2 = new FrameRenderer();
  const fps = settings.fps;
  const firstClip = clips[0];
  const firstEffects = (_a = effectsMap[firstClip.id]) != null ? _a : DEFAULT_EFFECTS;
  const { w: outW, h: outH } = getOutputSize(firstClip, firstEffects, settings.resolution);
  onProgress(2);
  let globalFrameIdx = 0;
  const totalFrames = clips.reduce((sum, c) => {
    var _a2, _b2;
    const effects = (_a2 = effectsMap[c.id]) != null ? _a2 : DEFAULT_EFFECTS;
    const speed = (_b2 = effects.speed) != null ? _b2 : 1;
    const base = Math.ceil(c.duration * fps / speed);
    const clipStart = c.startTime;
    const clipEnd = c.startTime + c.duration;
    let extra = 0;
    for (const f of freezes) {
      const overlapStart = Math.max(f.startTime, clipStart);
      const overlapEnd = Math.min(f.endTime, clipEnd);
      if (overlapEnd > overlapStart) {
        extra += Math.ceil((overlapEnd - overlapStart) * fps);
      }
    }
    return sum + base + extra;
  }, 0);
  let lastFrameCanvas = null;
  async function renderFrame(clip, outIdx, normalFrames, sourceFrameCount, decoder, effects, speed, isFrozen) {
    if (isFrozen && lastFrameCanvas) {
      const canvas2 = new OffscreenCanvas(outW, outH);
      const ctx = canvas2.getContext("2d");
      ctx.drawImage(lastFrameCanvas, 0, 0);
      return canvas2;
    }
    const srcIdx = Math.min(Math.floor(normalFrames * speed), sourceFrameCount - 1);
    const sourceTime = clip.trimIn + srcIdx / fps;
    const frame = await decoder.requestFrame(
      clip.file,
      Math.min(sourceTime, clip.trimOut - 1e-3)
    );
    const canvas = new OffscreenCanvas(outW, outH);
    if (frame) {
      const tmp = new OffscreenCanvas(1, 1);
      renderer2.renderFrame(frame, tmp, effects);
      frame.close();
      const ctx = canvas.getContext("2d");
      ctx.drawImage(tmp, 0, 0, outW, outH);
    }
    lastFrameCanvas = canvas;
    return canvas;
  }
  async function compositeAndWrite(canvas, frameTime, globalIdx) {
    const ctx = canvas.getContext("2d");
    const visibleStrokes = strokes.filter(
      (s) => s.startTime <= frameTime && frameTime < s.endTime
    );
    if (visibleStrokes.length > 0) drawStrokes(ctx, visibleStrokes, outW, outH);
    const visibleShapes = job.shapes.filter(
      (s) => s.startTime <= frameTime && frameTime < s.endTime
    );
    if (visibleShapes.length > 0) drawShapes(ctx, visibleShapes, outW, outH);
    const visibleOverlays = overlays.filter(
      (o) => o.startTime <= frameTime && frameTime < o.endTime
    );
    if (visibleOverlays.length > 0) await drawOverlays(ctx, visibleOverlays, outW, outH);
    const blob = await canvas.convertToBlob({ type: "image/webp", quality: 0.8 });
    const frameName = `frame_${String(globalIdx).padStart(6, "0")}.webp`;
    await ffmpeg.writeFile(frameName, new Uint8Array(await blob.arrayBuffer()));
  }
  async function renderCrossfadeFrame(clipB, timelineTime, effectsB, speedB) {
    const decoderB = getDecoderForFile(clipB.file);
    const localTime = timelineTime - clipB.startTime;
    const srcIdx = Math.min(Math.floor(localTime * fps * speedB), Math.ceil(clipB.duration * fps) - 1);
    const sourceTime = clipB.trimIn + srcIdx / fps;
    const frame = await decoderB.requestFrame(clipB.file, Math.min(sourceTime, clipB.trimOut - 1e-3));
    const canvas = new OffscreenCanvas(outW, outH);
    if (frame) {
      const tmp = new OffscreenCanvas(1, 1);
      renderer2.renderFrame(frame, tmp, effectsB);
      frame.close();
      const ctx = canvas.getContext("2d");
      ctx.drawImage(tmp, 0, 0, outW, outH);
    }
    return canvas;
  }
  for (const clip of clips) {
    const effects = (_b = effectsMap[clip.id]) != null ? _b : DEFAULT_EFFECTS;
    const speed = (_c = effects.speed) != null ? _c : 1;
    const decoder = getDecoderForFile(clip.file);
    const sourceFrameCount = Math.ceil(clip.duration * fps);
    const outputFrameCount = Math.ceil(clip.duration * fps / speed);
    const clipStart = clip.startTime;
    const clipEnd = clip.startTime + clip.duration;
    let extraFreezeFrames = 0;
    for (const f of freezes) {
      const overlapStart = Math.max(f.startTime, clipStart);
      const overlapEnd = Math.min(f.endTime, clipEnd);
      if (overlapEnd > overlapStart) {
        extraFreezeFrames += Math.ceil((overlapEnd - overlapStart) * fps);
      }
    }
    const totalOutputFrames = outputFrameCount + extraFreezeFrames;
    const transition = job.transitions.find((t) => t.clipAId === clip.id);
    let clipB = null;
    let effectsB = DEFAULT_EFFECTS;
    let speedB = 1;
    if (transition) {
      clipB = (_d = clips.find((c) => c.id === transition.clipBId)) != null ? _d : null;
      if (clipB) {
        effectsB = (_e = effectsMap[clipB.id]) != null ? _e : DEFAULT_EFFECTS;
        speedB = (_f = effectsB.speed) != null ? _f : 1;
      }
    }
    let normalFrames = 0;
    const BATCH_SIZE = 8;
    for (let batchStart = 0; batchStart < totalOutputFrames; batchStart += BATCH_SIZE) {
      if (signal == null ? void 0 : signal.aborted) throw new DOMException("Export cancelled", "AbortError");
      const batchEnd = Math.min(batchStart + BATCH_SIZE, totalOutputFrames);
      const batchSize = batchEnd - batchStart;
      const frameInfos = [];
      let localNormalFrames = normalFrames;
      for (let i = batchStart; i < batchEnd; i++) {
        const frameTime = clip.startTime + i / fps * speed;
        const isFrozen = freezes.some(
          (f) => frameTime >= f.startTime && frameTime < f.endTime
        );
        let isCrossfade = false;
        let crossfadeAlpha = 0;
        if (transition && clipB) {
          const transitionStart = clip.startTime + clip.duration - transition.duration;
          const transitionEnd = clip.startTime + clip.duration;
          if (frameTime >= transitionStart && frameTime < transitionEnd) {
            isCrossfade = true;
            crossfadeAlpha = (frameTime - transitionStart) / transition.duration;
          }
        }
        frameInfos.push({
          outIdx: i,
          frameTime,
          isFrozen,
          normalFramesAtStart: localNormalFrames,
          isCrossfade,
          crossfadeAlpha
        });
        if (!isFrozen) localNormalFrames++;
      }
      const renderPromises = frameInfos.map(
        (info) => renderFrame(
          clip,
          info.outIdx,
          info.normalFramesAtStart,
          sourceFrameCount,
          decoder,
          effects,
          speed,
          info.isFrozen
        )
      );
      let crossfadePromises = null;
      if (transition && clipB) {
        crossfadePromises = frameInfos.map((info) => {
          if (info.isCrossfade) {
            return renderCrossfadeFrame(clipB, info.frameTime, effectsB, speedB);
          }
          return Promise.resolve(new OffscreenCanvas(1, 1));
        });
      }
      const canvases = await Promise.all(renderPromises);
      let crossfadeCanvases = null;
      if (crossfadePromises) {
        crossfadeCanvases = await Promise.all(crossfadePromises);
      }
      for (let j = 0; j < batchSize; j++) {
        const info = frameInfos[j];
        let canvas = canvases[j];
        if (info.isCrossfade && crossfadeCanvases) {
          const canvasB = crossfadeCanvases[j];
          const blended = new OffscreenCanvas(outW, outH);
          const ctx = blended.getContext("2d");
          ctx.globalAlpha = 1 - info.crossfadeAlpha;
          ctx.drawImage(canvas, 0, 0);
          ctx.globalAlpha = info.crossfadeAlpha;
          ctx.drawImage(canvasB, 0, 0);
          ctx.globalAlpha = 1;
          canvas = blended;
        }
        await compositeAndWrite(canvas, info.frameTime, globalFrameIdx);
        if (!info.isFrozen) normalFrames++;
        globalFrameIdx++;
        onProgress(2 + Math.round(globalFrameIdx / totalFrames * 68));
      }
    }
  }
  onProgress(70);
  const voiceOverlays = overlays.filter((o) => o.type === "voice");
  let hasAudioInput = false;
  if (voiceOverlays.length > 0) {
    const wavBuffers = [];
    for (let vi = 0; vi < voiceOverlays.length; vi++) {
      if (signal == null ? void 0 : signal.aborted) throw new DOMException("Export cancelled", "AbortError");
      const voice = voiceOverlays[vi];
      try {
        const resp = await fetch(voice.audioUrl);
        if (!resp.ok) {
          console.warn(`Voice overlay ${vi}: fetch failed with status ${resp.status}`);
          continue;
        }
        const audioBlob = await resp.blob();
        const wavBlob = await blobToWav(audioBlob);
        const wavBuf = await wavBlob.arrayBuffer();
        const paddedWav = await padWavWithSilence(wavBuf, voice.startTime);
        const voiceDuration = voice.endTime - voice.startTime;
        const trimmedWav = trimWavEnd(paddedWav, voice.endTime);
        wavBuffers.push(trimmedWav);
      } catch (err) {
        console.warn(`Voice overlay ${vi}: conversion failed, skipping`, err);
      }
    }
    if (wavBuffers.length > 0) {
      try {
        const mergedWav = mergeWavBuffers(wavBuffers);
        const videoDuration = totalFrames / fps;
        const paddedWav = padWavEnd(mergedWav, videoDuration);
        await ffmpeg.writeFile("voice_mixed.wav", new Uint8Array(paddedWav));
        hasAudioInput = true;
      } catch (err) {
        console.warn("Voice merge failed, exporting without audio:", err);
      }
    }
  }
  const outputName = `output.${settings.format}`;
  const args = [
    "-framerate",
    String(fps),
    "-i",
    "frame_%06d.webp"
  ];
  if (hasAudioInput) {
    args.push("-i", "voice_mixed.wav");
  }
  args.push("-r", String(fps));
  args.push("-b:v", `${settings.bitrate}k`);
  args.push("-c:v", settings.format === "mp4" ? "libx264" : "libvpx-vp9");
  if (hasAudioInput) {
    args.push("-c:a", "aac");
    args.push("-shortest");
  }
  if (settings.format === "mp4") {
    args.push("-pix_fmt", "yuv420p");
    args.push("-preset", "ultrafast");
    args.push("-movflags", "+faststart");
  }
  args.push("-y", outputName);
  const onFFmpegProgress = ({ progress }) => {
    onProgress(70 + Math.round(progress * 25));
  };
  ffmpeg.on("progress", onFFmpegProgress);
  try {
    await ffmpeg.exec(args);
  } catch (err) {
    console.error("[FFmpeg encode] Failed:", err);
    throw err;
  } finally {
    ffmpeg.off("progress", onFFmpegProgress);
  }
  onProgress(96);
  if (hasAudioInput) {
    await ffmpeg.deleteFile("voice_mixed.wav").catch(() => {
    });
  }
  const data = await ffmpeg.readFile(outputName);
  const result = data instanceof Uint8Array ? data : new TextEncoder().encode(data);
  for (let i = 0; i < globalFrameIdx; i++) {
    const name = `frame_${String(i).padStart(6, "0")}.webp`;
    await ffmpeg.deleteFile(name).catch(() => {
    });
  }
  await ffmpeg.deleteFile(outputName).catch(() => {
  });
  onProgress(100);
  return result;
}

// hooks/useExport.ts
var activeController = null;
function useExport() {
  const clips = useEditorStore((s) => s.clips);
  const settings = useEditorStore((s) => s.settings);
  const clipEffects = useEditorStore((s) => s.clipEffects);
  const strokes = useEditorStore((s) => s.strokes);
  const overlays = useEditorStore((s) => s.overlays);
  const freezes = useEditorStore((s) => s.freezes);
  const transitions = useEditorStore((s) => s.transitions);
  const shapes = useEditorStore((s) => s.shapes);
  const setExportStatus = useEditorStore((s) => s.setExportStatus);
  const setExportProgress = useEditorStore((s) => s.setExportProgress);
  const setOutputUrl = useEditorStore((s) => s.setOutputUrl);
  const setExportError = useEditorStore((s) => s.setExportError);
  const resetExport = useEditorStore((s) => s.resetExport);
  const startExport = useCallback(async () => {
    const videoClips = clips.filter((c) => c.trackId === "track-video");
    if (videoClips.length === 0) return;
    useEditorStore.getState().setPlaying(false);
    for (const clip of videoClips) {
      getDecoderForFile(clip.file).stopPlayback();
    }
    activeController == null ? void 0 : activeController.abort();
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
        freezes,
        transitions,
        shapes,
        signal: controller.signal,
        onProgress: (p) => {
          if (controller.signal.aborted) return;
          setExportProgress(p);
          if (p > 10) setExportStatus("encoding");
        }
      });
      if (controller.signal.aborted) return;
      const mimeType = settings.format === "mp4" ? "video/mp4" : "video/webm";
      const blob = new Blob([data.buffer], { type: mimeType });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setExportStatus("done");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      console.error("Export failed:", err);
      setExportError(err instanceof Error ? err.message : "Export failed");
      setExportStatus("error");
    }
  }, [clips, settings, clipEffects, strokes, overlays, freezes, resetExport, setExportStatus, setExportProgress, setOutputUrl, setExportError]);
  const cancelExport = useCallback(() => {
    activeController == null ? void 0 : activeController.abort();
    activeController = null;
    resetExport();
  }, [resetExport]);
  const downloadExport = useCallback(
    (url) => {
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

// hooks/useVideoImport.ts
import { useCallback as useCallback2 } from "react";
var SUPPORTED_FORMATS = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"];
function useVideoImport() {
  const addClip = useEditorStore((s) => s.addClip);
  const removeClip = useEditorStore((s) => s.removeClip);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const clearStrokes = useEditorStore((s) => s.clearStrokes);
  const clearOverlays = useEditorStore((s) => s.clearOverlays);
  const resetExport = useEditorStore((s) => s.resetExport);
  const importFile = useCallback2(async (file) => {
    if (!SUPPORTED_FORMATS.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|mkv)$/i)) {
      console.warn("Unsupported file type:", file.type);
      return;
    }
    try {
      const decoder = getDecoderForFile(file);
      const metadata = await decoder.getMetadata(file);
      const initialThumbnails = [];
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
      } catch (e) {
      }
      const existingEnd = useEditorStore.getState().duration;
      const clip = {
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
        thumbnails: initialThumbnails
      };
      addClip(clip);
    } catch (err) {
      console.error("Failed to import video:", err);
    }
  }, [addClip]);
  const importFiles = useCallback2(
    (files) => {
      Array.from(files).forEach(importFile);
    },
    [importFile]
  );
  const replaceImport = useCallback2(
    (files) => {
      const { clips } = useEditorStore.getState();
      clips.forEach((c) => removeClip(c.id));
      setCurrentTime(0);
      clearStrokes();
      clearOverlays();
      resetExport();
      Array.from(files).forEach(importFile);
    },
    [importFile, removeClip, setCurrentTime, clearStrokes, clearOverlays, resetExport]
  );
  return { importFile, importFiles, replaceImport };
}

// components/editor/TopBar.tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var MENUS = [
  { id: "file", label: "File" },
  { id: "edit", label: "Edit" },
  { id: "view", label: "View" },
  { id: "help", label: "Help" }
];
function TopBar() {
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);
  const exportStatus = useEditorStore((s) => s.status);
  const clips = useEditorStore((s) => s.clips);
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const playbackRate = useEditorStore((s) => s.playbackRate);
  const setPlaybackRate = useEditorStore((s) => s.setPlaybackRate);
  const theme = useEditorStore((s) => s.theme);
  const toggleTheme = useEditorStore((s) => s.toggleTheme);
  const { startExport } = useExport();
  const { replaceImport } = useVideoImport();
  const fileInputRef = useRef(null);
  const isExporting = exportStatus === "preparing" || exportStatus === "encoding";
  const hasClips = clips.length > 0;
  const zoomPercent = Math.round(zoom / 80 * 100);
  useEffect(() => {
    if (!openMenu) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenu]);
  const toggleMenu = useCallback3((id) => {
    setOpenMenu((prev) => prev === id ? null : id);
  }, []);
  const handleAction = useCallback3(
    (action) => {
      var _a;
      setOpenMenu(null);
      switch (action) {
        case "import":
          (_a = fileInputRef.current) == null ? void 0 : _a.click();
          break;
        case "export":
          if (!isExporting && hasClips) {
            setPlaying(false);
            startExport();
          }
          break;
        case "undo":
          undo();
          break;
        case "redo":
          redo();
          break;
        case "toggle-theme":
          toggleTheme();
          break;
        case "zoom-in":
          setZoom(zoom * 1.25);
          break;
        case "zoom-out":
          setZoom(zoom / 1.25);
          break;
        case "zoom-reset":
          setZoom(80);
          break;
      }
    },
    [undo, redo, toggleTheme, setZoom, zoom, isExporting, hasClips, setPlaying]
  );
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: menuRef,
      className: "flex items-center h-11 px-1 md:px-2 shrink-0 border-b select-none",
      style: { borderColor: "var(--kt-border)" },
      children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: fileInputRef,
            type: "file",
            accept: "video/*",
            className: "hidden",
            onChange: (e) => {
              var _a;
              const files = Array.from((_a = e.target.files) != null ? _a : []).filter((f) => f.type.startsWith("video/"));
              if (files.length > 0) replaceImport(files);
              e.target.value = "";
            }
          }
        ),
        MENUS.map((menu) => /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => toggleMenu(menu.id),
              className: "kt-btn-ghost px-3 h-8 rounded-lg text-sm font-medium transition-colors",
              style: {
                color: openMenu === menu.id ? "var(--kt-text-primary)" : "var(--kt-text-tertiary)",
                background: openMenu === menu.id ? "var(--kt-bg-subtle-hover)" : "transparent"
              },
              children: menu.label
            }
          ),
          openMenu === menu.id && /* @__PURE__ */ jsxs(
            "div",
            {
              className: "absolute top-full left-0 mt-0.5 w-48 rounded-lg shadow-xl border z-50 py-1",
              style: {
                background: "var(--kt-bg-panel)",
                borderColor: "var(--kt-border-strong)"
              },
              children: [
                menu.id === "file" && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(MenuItem, { label: "Import Video", shortcut: "\u2318I", onClick: () => handleAction("import") }),
                  hasClips && /* @__PURE__ */ jsx(
                    MenuItem,
                    {
                      label: "Export",
                      shortcut: "\u2318E",
                      onClick: () => handleAction("export"),
                      disabled: isExporting
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "h-px my-1", style: { background: "var(--kt-border)" } }),
                  /* @__PURE__ */ jsx(MenuItem, { label: "Close", shortcut: "\u2318W", onClick: () => handleAction("close") })
                ] }),
                menu.id === "edit" && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(MenuItem, { label: "Undo", shortcut: "\u2318Z", onClick: () => handleAction("undo"), disabled: !canUndo }),
                  /* @__PURE__ */ jsx(MenuItem, { label: "Redo", shortcut: "\u2318\u21E7Z", onClick: () => handleAction("redo"), disabled: !canRedo })
                ] }),
                menu.id === "view" && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(MenuItem, { label: "Zoom In", shortcut: "\u2318+", onClick: () => handleAction("zoom-in") }),
                  /* @__PURE__ */ jsx(MenuItem, { label: "Zoom Out", shortcut: "\u2318-", onClick: () => handleAction("zoom-out") }),
                  /* @__PURE__ */ jsx(MenuItem, { label: "Reset Zoom", shortcut: "\u23180", onClick: () => handleAction("zoom-reset") }),
                  /* @__PURE__ */ jsx("div", { className: "h-px my-1", style: { background: "var(--kt-border)" } }),
                  /* @__PURE__ */ jsx(
                    MenuItem,
                    {
                      label: theme === "dark" ? "Light Theme" : "Dark Theme",
                      shortcut: "\u2318T",
                      onClick: () => handleAction("toggle-theme"),
                      icon: theme === "dark" ? /* @__PURE__ */ jsxs("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: [
                        /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "5" }),
                        /* @__PURE__ */ jsx("path", { strokeLinecap: "round", d: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" })
                      ] }) : /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", d: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" }) })
                    }
                  )
                ] }),
                menu.id === "help" && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(MenuItem, { label: "Keyboard Shortcuts", shortcut: "?", onClick: () => handleAction("shortcuts") }),
                  /* @__PURE__ */ jsx(MenuItem, { label: "About IceProVideoEditor", onClick: () => handleAction("about") })
                ] })
              ]
            }
          )
        ] }, menu.id)),
        /* @__PURE__ */ jsx("div", { className: "flex-1" }),
        /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-1 mr-3", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium flex items-center gap-1 mr-1", style: { color: "var(--kt-text-muted)" }, children: [
            /* @__PURE__ */ jsxs("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: [
              /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "7" }),
              /* @__PURE__ */ jsx("path", { strokeLinecap: "round", d: "M16.5 16.5L21 21" })
            ] }),
            "Zoom"
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setZoom(zoom / 1.25),
              className: "kt-btn-ghost w-7 h-7 flex items-center justify-center rounded-lg transition-colors text-base leading-none",
              children: "-"
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium w-10 text-center tabular-nums", style: { color: "var(--kt-text-secondary)" }, children: [
            zoomPercent,
            "%"
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setZoom(zoom * 1.25),
              className: "kt-btn-ghost w-7 h-7 flex items-center justify-center rounded-lg transition-colors text-base leading-none",
              children: "+"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 mr-3", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium flex items-center gap-1 mr-1", style: { color: "var(--kt-text-muted)" }, children: [
            /* @__PURE__ */ jsxs("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: [
              /* @__PURE__ */ jsx("path", { strokeLinecap: "round", d: "M12 6v6l4 2" }),
              /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "9" })
            ] }),
            "Speed"
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setPlaybackRate(Math.max(0, playbackRate - 0.25)),
              className: "kt-btn-ghost w-6 h-6 flex items-center justify-center rounded text-xs leading-none",
              title: "Slower ([)",
              children: "\u2212"
            }
          ),
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "text-xs font-mono tabular-nums min-w-[2.5ch] text-center",
              style: { color: playbackRate !== 1 ? "var(--kt-accent)" : "var(--kt-text-muted)" },
              children: playbackRate === 0 ? "\u275A\u275A" : `${playbackRate}x`
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setPlaybackRate(Math.min(2, playbackRate + 0.25)),
              className: "kt-btn-ghost w-6 h-6 flex items-center justify-center rounded text-xs leading-none",
              title: "Faster (])",
              children: "+"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 md:gap-2", children: hasClips && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => {
                var _a;
                return (_a = fileInputRef.current) == null ? void 0 : _a.click();
              },
              className: "kt-btn-import px-2 md:px-3 h-8 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5",
              title: "Import new video",
              children: [
                /* @__PURE__ */ jsx("span", { className: "hidden md:inline", children: "Import Video" }),
                /* @__PURE__ */ jsx("span", { className: "md:hidden", children: "Import" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              disabled: isExporting,
              onClick: () => {
                setPlaying(false);
                startExport();
              },
              className: "kt-btn-accent px-4 h-8 rounded-lg text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
              children: "Done"
            }
          )
        ] }) })
      ]
    }
  );
}
function MenuItem({
  label,
  shortcut,
  icon,
  disabled,
  onClick
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      disabled,
      className: "flex items-center w-full px-3 py-2 text-sm transition-colors",
      style: {
        color: disabled ? "var(--kt-text-faint)" : "var(--kt-text-secondary)",
        cursor: disabled ? "not-allowed" : "pointer"
      },
      onMouseEnter: (e) => {
        if (!disabled) {
          e.currentTarget.style.background = "var(--kt-bg-subtle-hover)";
          e.currentTarget.style.color = "var(--kt-text-primary)";
        }
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.background = "transparent";
        if (!disabled) e.currentTarget.style.color = "var(--kt-text-secondary)";
      },
      children: [
        icon && /* @__PURE__ */ jsx("span", { className: "mr-2", children: icon }),
        /* @__PURE__ */ jsx("span", { className: "flex-1 text-left", children: label }),
        shortcut && /* @__PURE__ */ jsx("span", { className: "ml-4 text-[10px] tabular-nums", style: { color: "var(--kt-text-muted)" }, children: shortcut })
      ]
    }
  );
}

// components/editor/Sidebar.tsx
import { motion } from "framer-motion";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var C = {
  trim: "#3b82f6",
  // blue
  crop: "#22c55e",
  // green
  finetune: "#a855f7",
  // purple
  filter: "#f43f5e",
  // rose
  annotate: "#f97316",
  // orange
  sticker: "#ec4899",
  // pink
  resize: "#eab308",
  // yellow
  voice: "#06b6d4"
  // cyan
};
var TOOLS = [
  {
    id: "trim",
    label: "Trim",
    icon: (c) => /* @__PURE__ */ jsxs2("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", children: [
      /* @__PURE__ */ jsx2("rect", { x: "2", y: "4", width: "20", height: "16", rx: "2", stroke: c, strokeWidth: 1.75 }),
      /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", d: "M8 4v16M16 4v16", stroke: c, strokeWidth: 1.75 }),
      /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", strokeWidth: 1.5, d: "M2 9h20M2 15h20", stroke: c, opacity: "0.35" })
    ] })
  },
  {
    id: "crop",
    label: "Crop",
    icon: (c) => /* @__PURE__ */ jsxs2("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", children: [
      /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 2v14a2 2 0 002 2h14M2 6h14a2 2 0 012 2v14", stroke: c, strokeWidth: 1.75 }),
      /* @__PURE__ */ jsx2("circle", { cx: "12", cy: "12", r: "3", stroke: c, strokeWidth: 1.5, opacity: "0.45" })
    ] })
  },
  {
    id: "finetune",
    label: "Adjust",
    icon: (c) => /* @__PURE__ */ jsxs2("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", children: [
      /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", d: "M4 6h16M4 12h16M4 18h16", stroke: c, strokeWidth: 1.75 }),
      /* @__PURE__ */ jsx2("circle", { cx: "8", cy: "6", r: "2", fill: c, stroke: "none", opacity: "0.7" }),
      /* @__PURE__ */ jsx2("circle", { cx: "16", cy: "12", r: "2", fill: c, stroke: "none", opacity: "0.7" }),
      /* @__PURE__ */ jsx2("circle", { cx: "8", cy: "18", r: "2", fill: c, stroke: "none", opacity: "0.7" })
    ] })
  },
  {
    id: "filter",
    label: "Filter",
    icon: (c) => /* @__PURE__ */ jsxs2("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", children: [
      /* @__PURE__ */ jsx2("circle", { cx: "12", cy: "12", r: "9", stroke: c, strokeWidth: 1.75 }),
      /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", d: "M12 3a9 9 0 010 18M3 12h18", stroke: c, strokeWidth: 1.75 }),
      /* @__PURE__ */ jsx2("circle", { cx: "12", cy: "12", r: "3", stroke: c, strokeWidth: 1.5, opacity: "0.45" })
    ] })
  },
  {
    id: "annotate",
    label: "Annotate",
    icon: (c) => /* @__PURE__ */ jsxs2("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", children: [
      /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5", stroke: c, strokeWidth: 1.75 }),
      /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M18.5 2.5a2.121 2.121 0 013 3L13 14l-4 1 1-4 8.5-8.5z", stroke: c, strokeWidth: 1.75 }),
      /* @__PURE__ */ jsx2("circle", { cx: "16", cy: "8", r: "1.5", fill: c, stroke: "none", opacity: "0.55" })
    ] })
  },
  {
    id: "sticker",
    label: "Sticker",
    icon: (c) => /* @__PURE__ */ jsxs2("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", children: [
      /* @__PURE__ */ jsx2("rect", { x: "3", y: "3", width: "18", height: "18", rx: "4", stroke: c, strokeWidth: 1.75 }),
      /* @__PURE__ */ jsx2("circle", { cx: "9", cy: "9", r: "1.5", fill: c, stroke: "none" }),
      /* @__PURE__ */ jsx2("circle", { cx: "15", cy: "9", r: "1.5", fill: c, stroke: "none" }),
      /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", strokeWidth: 1.5, d: "M8 15s1.5 2 4 2 4-2 4-2", stroke: c })
    ] })
  },
  {
    id: "resize",
    label: "Resize",
    icon: (c) => /* @__PURE__ */ jsxs2("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", children: [
      /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3", stroke: c, strokeWidth: 1.75 }),
      /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", strokeWidth: 1.5, d: "M8 12h8M12 8v8", stroke: c, opacity: "0.45" })
    ] })
  },
  {
    id: "voice",
    label: "Voice",
    icon: (c) => /* @__PURE__ */ jsxs2("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", children: [
      /* @__PURE__ */ jsx2("rect", { x: "9", y: "2", width: "6", height: "12", rx: "3", stroke: c, strokeWidth: 1.75 }),
      /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", d: "M5 11a7 7 0 0014 0", stroke: c, strokeWidth: 1.75 }),
      /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", strokeWidth: 1.5, d: "M12 19v3M9 22h6", stroke: c })
    ] })
  }
];
function Sidebar({ activeTool, onToolChange, horizontal }) {
  if (horizontal) {
    return /* @__PURE__ */ jsx2("div", { className: "flex shrink-0 border-t px-1 py-1 gap-0.5 overflow-x-auto", style: { borderColor: "var(--kt-border)" }, children: TOOLS.map((tool) => {
      const isActive = activeTool === tool.id;
      return /* @__PURE__ */ jsxs2(
        "button",
        {
          onClick: () => onToolChange(tool.id),
          className: "relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg transition-colors shrink-0 kt-tool-btn",
          style: isActive ? { color: "var(--kt-accent)", background: "var(--kt-accent-subtle-bg)" } : { color: "var(--kt-text-tertiary)" },
          children: [
            isActive && /* @__PURE__ */ jsx2(
              motion.div,
              {
                layoutId: "sidebar-active-h",
                className: "absolute inset-0 rounded-lg",
                style: { background: "var(--kt-accent-subtle-bg)" },
                transition: { type: "spring", stiffness: 400, damping: 35 }
              }
            ),
            /* @__PURE__ */ jsx2("span", { className: "relative z-10", children: tool.icon(isActive ? "var(--kt-accent)" : C[tool.id]) }),
            /* @__PURE__ */ jsx2("span", { className: "relative z-10 text-xs font-medium leading-none", children: tool.label })
          ]
        },
        tool.id
      );
    }) });
  }
  return /* @__PURE__ */ jsx2("div", { className: "flex flex-col w-[72px] shrink-0 border-r py-2 gap-1", style: { borderColor: "var(--kt-border)" }, children: TOOLS.map((tool) => {
    const isActive = activeTool === tool.id;
    return /* @__PURE__ */ jsxs2(
      "button",
      {
        onClick: () => onToolChange(tool.id),
        className: "relative flex flex-col items-center gap-1 py-2.5 mx-1.5 rounded-xl transition-colors kt-tool-btn",
        style: isActive ? { color: "var(--kt-accent)", background: "var(--kt-accent-subtle-bg)" } : { color: "var(--kt-text-tertiary)" },
        children: [
          isActive && /* @__PURE__ */ jsx2(
            motion.div,
            {
              layoutId: "sidebar-active",
              className: "absolute inset-0 rounded-xl",
              style: { background: "var(--kt-accent-subtle-bg)" },
              transition: { type: "spring", stiffness: 400, damping: 35 }
            }
          ),
          /* @__PURE__ */ jsx2("span", { className: "relative z-10", children: tool.icon(isActive ? "var(--kt-accent)" : C[tool.id]) }),
          /* @__PURE__ */ jsx2("span", { className: "relative z-10 text-xs font-medium leading-none", children: tool.label })
        ]
      },
      tool.id
    );
  }) });
}

// components/editor/preview/PreviewPanel.tsx
import { useRef as useRef7, useState as useState4, useEffect as useEffect6, useCallback as useCallback9 } from "react";
import { motion as motion2 } from "framer-motion";

// components/editor/preview/PreviewCanvas.tsx
import { forwardRef } from "react";
import { jsx as jsx3 } from "react/jsx-runtime";
var PreviewCanvas = forwardRef(
  function PreviewCanvas2(_props, ref) {
    return /* @__PURE__ */ jsx3(
      "canvas",
      {
        ref,
        className: "w-full h-full"
      }
    );
  }
);

// components/editor/preview/CropOverlay.tsx
import { useRef as useRef2, useCallback as useCallback4 } from "react";
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
function CropOverlay() {
  var _a, _b, _c;
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const clips = useEditorStore((s) => s.clips);
  const clipEffects = useEditorStore((s) => s.clipEffects);
  const setClipEffects = useEditorStore((s) => s.setClipEffects);
  const captureHistory = useEditorStore((s) => s.captureHistory);
  const targetId = (_b = selectedClipId != null ? selectedClipId : (_a = clips.find((c) => c.trackId === "track-video")) == null ? void 0 : _a.id) != null ? _b : null;
  const effects = targetId ? (_c = clipEffects[targetId]) != null ? _c : DEFAULT_EFFECTS : DEFAULT_EFFECTS;
  const containerRef = useRef2(null);
  const dragRef = useRef2(null);
  const onPointerDown = useCallback4(
    (handle) => (e) => {
      if (!targetId) return;
      e.stopPropagation();
      captureHistory();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = {
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startEffects: __spreadValues({}, effects)
      };
    },
    [targetId, effects, captureHistory]
  );
  const onPointerMove = useCallback4(
    (e) => {
      if (!dragRef.current || !containerRef.current || !targetId) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = (e.clientX - dragRef.current.startX) / rect.width;
      const dy = (e.clientY - dragRef.current.startY) / rect.height;
      const s = dragRef.current.startEffects;
      let { cropX: cropX2, cropY: cropY2, cropW: cropW2, cropH: cropH2 } = s;
      const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
      const MIN_SIZE = 0.05;
      switch (dragRef.current.handle) {
        case "move": {
          cropX2 = clamp(s.cropX + dx, 0, 1 - s.cropW);
          cropY2 = clamp(s.cropY + dy, 0, 1 - s.cropH);
          break;
        }
        case "nw": {
          const newX = clamp(s.cropX + dx, 0, s.cropX + s.cropW - MIN_SIZE);
          const newY = clamp(s.cropY + dy, 0, s.cropY + s.cropH - MIN_SIZE);
          cropW2 = s.cropW - (newX - s.cropX);
          cropH2 = s.cropH - (newY - s.cropY);
          cropX2 = newX;
          cropY2 = newY;
          break;
        }
        case "ne": {
          const newY = clamp(s.cropY + dy, 0, s.cropY + s.cropH - MIN_SIZE);
          cropW2 = clamp(s.cropW + dx, MIN_SIZE, 1 - s.cropX);
          cropH2 = s.cropH - (newY - s.cropY);
          cropY2 = newY;
          break;
        }
        case "sw": {
          const newX = clamp(s.cropX + dx, 0, s.cropX + s.cropW - MIN_SIZE);
          cropW2 = s.cropW - (newX - s.cropX);
          cropH2 = clamp(s.cropH + dy, MIN_SIZE, 1 - s.cropY);
          cropX2 = newX;
          break;
        }
        case "se": {
          cropW2 = clamp(s.cropW + dx, MIN_SIZE, 1 - s.cropX);
          cropH2 = clamp(s.cropH + dy, MIN_SIZE, 1 - s.cropY);
          break;
        }
        case "n": {
          const newY = clamp(s.cropY + dy, 0, s.cropY + s.cropH - MIN_SIZE);
          cropH2 = s.cropH - (newY - s.cropY);
          cropY2 = newY;
          break;
        }
        case "s": {
          cropH2 = clamp(s.cropH + dy, MIN_SIZE, 1 - s.cropY);
          break;
        }
        case "w": {
          const newX = clamp(s.cropX + dx, 0, s.cropX + s.cropW - MIN_SIZE);
          cropW2 = s.cropW - (newX - s.cropX);
          cropX2 = newX;
          break;
        }
        case "e": {
          cropW2 = clamp(s.cropW + dx, MIN_SIZE, 1 - s.cropX);
          break;
        }
      }
      setClipEffects(targetId, { cropX: cropX2, cropY: cropY2, cropW: cropW2, cropH: cropH2 });
    },
    [targetId, setClipEffects]
  );
  const onPointerUp = useCallback4(() => {
    dragRef.current = null;
  }, []);
  const { cropX, cropY, cropW, cropH } = effects;
  const x = cropX * 100;
  const y = cropY * 100;
  const w = cropW * 100;
  const h = cropH * 100;
  const handleStyle = (cursor) => ({
    position: "absolute",
    width: 12,
    height: 12,
    background: "var(--kt-slider-thumb)",
    border: "2px solid var(--kt-accent-strong-border)",
    borderRadius: 2,
    cursor,
    transform: "translate(-50%, -50%)",
    zIndex: 30
  });
  const EDGE_HIT = 16;
  const edgeStyle = (cursor, extra) => __spreadValues({
    position: "absolute",
    background: "transparent",
    cursor,
    zIndex: 30
  }, extra);
  return /* @__PURE__ */ jsxs3(
    "div",
    {
      ref: containerRef,
      className: "absolute inset-0",
      onPointerMove,
      onPointerUp,
      style: { zIndex: 20 },
      children: [
        /* @__PURE__ */ jsx4("div", { className: "absolute pointer-events-none", style: { top: 0, left: 0, right: 0, height: `${y}%`, background: "var(--kt-crop-mask)" } }),
        /* @__PURE__ */ jsx4("div", { className: "absolute pointer-events-none", style: { bottom: 0, left: 0, right: 0, height: `${100 - y - h}%`, background: "var(--kt-crop-mask)" } }),
        /* @__PURE__ */ jsx4("div", { className: "absolute pointer-events-none", style: { top: `${y}%`, left: 0, width: `${x}%`, height: `${h}%`, background: "var(--kt-crop-mask)" } }),
        /* @__PURE__ */ jsx4("div", { className: "absolute pointer-events-none", style: { top: `${y}%`, right: 0, width: `${100 - x - w}%`, height: `${h}%`, background: "var(--kt-crop-mask)" } }),
        /* @__PURE__ */ jsx4(
          "div",
          {
            className: "absolute",
            style: {
              left: `${x}%`,
              top: `${y}%`,
              width: `${w}%`,
              height: `${h}%`,
              border: "2px solid var(--kt-accent-strong-border)",
              boxSizing: "border-box",
              cursor: "move",
              zIndex: 22
            },
            onPointerDown: onPointerDown("move"),
            children: /* @__PURE__ */ jsxs3("div", { className: "absolute inset-0 pointer-events-none", style: { opacity: 0.3 }, children: [
              /* @__PURE__ */ jsx4("div", { className: "absolute", style: { background: "var(--kt-border-input)", left: "33.3%", top: 0, bottom: 0, width: 1 } }),
              /* @__PURE__ */ jsx4("div", { className: "absolute", style: { background: "var(--kt-border-input)", left: "66.6%", top: 0, bottom: 0, width: 1 } }),
              /* @__PURE__ */ jsx4("div", { className: "absolute", style: { background: "var(--kt-border-input)", top: "33.3%", left: 0, right: 0, height: 1 } }),
              /* @__PURE__ */ jsx4("div", { className: "absolute", style: { background: "var(--kt-border-input)", top: "66.6%", left: 0, right: 0, height: 1 } })
            ] })
          }
        ),
        /* @__PURE__ */ jsx4("div", { style: __spreadProps(__spreadValues({}, handleStyle("nw-resize")), { left: `${x}%`, top: `${y}%` }), onPointerDown: onPointerDown("nw") }),
        /* @__PURE__ */ jsx4("div", { style: __spreadProps(__spreadValues({}, handleStyle("ne-resize")), { left: `${x + w}%`, top: `${y}%` }), onPointerDown: onPointerDown("ne") }),
        /* @__PURE__ */ jsx4("div", { style: __spreadProps(__spreadValues({}, handleStyle("sw-resize")), { left: `${x}%`, top: `${y + h}%` }), onPointerDown: onPointerDown("sw") }),
        /* @__PURE__ */ jsx4("div", { style: __spreadProps(__spreadValues({}, handleStyle("se-resize")), { left: `${x + w}%`, top: `${y + h}%` }), onPointerDown: onPointerDown("se") }),
        /* @__PURE__ */ jsx4(
          "div",
          {
            style: edgeStyle("n-resize", { left: `${x}%`, top: `calc(${y}% - ${EDGE_HIT / 2}px)`, width: `${w}%`, height: EDGE_HIT }),
            onPointerDown: onPointerDown("n")
          }
        ),
        /* @__PURE__ */ jsx4(
          "div",
          {
            style: edgeStyle("s-resize", { left: `${x}%`, top: `calc(${y + h}% - ${EDGE_HIT / 2}px)`, width: `${w}%`, height: EDGE_HIT }),
            onPointerDown: onPointerDown("s")
          }
        ),
        /* @__PURE__ */ jsx4(
          "div",
          {
            style: edgeStyle("w-resize", { left: `calc(${x}% - ${EDGE_HIT / 2}px)`, top: `${y}%`, width: EDGE_HIT, height: `${h}%` }),
            onPointerDown: onPointerDown("w")
          }
        ),
        /* @__PURE__ */ jsx4(
          "div",
          {
            style: edgeStyle("e-resize", { left: `calc(${x + w}% - ${EDGE_HIT / 2}px)`, top: `${y}%`, width: EDGE_HIT, height: `${h}%` }),
            onPointerDown: onPointerDown("e")
          }
        )
      ]
    }
  );
}

// components/editor/preview/OverlayLayer.tsx
import { useRef as useRef3, useCallback as useCallback5, useState as useState2, useEffect as useEffect2 } from "react";
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
function OverlayLayer() {
  const overlays = useEditorStore((s) => s.overlays);
  const selectedOverlayId = useEditorStore((s) => s.selectedOverlayId);
  const selectOverlay = useEditorStore((s) => s.selectOverlay);
  const updateOverlay = useEditorStore((s) => s.updateOverlay);
  const removeOverlay = useEditorStore((s) => s.removeOverlay);
  const [visibleOverlays, setVisibleOverlays] = useState2(() => {
    const { currentTime } = useEditorStore.getState();
    return overlays.filter(
      (o) => o.startTime <= currentTime && currentTime < o.endTime
    );
  });
  useEffect2(() => {
    const unsub = useEditorStore.subscribe(() => {
      const { currentTime } = useEditorStore.getState();
      const { overlays: allOverlays } = useEditorStore.getState();
      setVisibleOverlays(
        allOverlays.filter(
          (o) => o.startTime <= currentTime && currentTime < o.endTime
        )
      );
    });
    return unsub;
  }, []);
  const containerRef = useRef3(null);
  const dragRef = useRef3(null);
  const onPointerDown = useCallback5(
    (overlay) => (e) => {
      e.stopPropagation();
      selectOverlay(overlay.id);
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = {
        id: overlay.id,
        startX: e.clientX,
        startY: e.clientY,
        startOX: overlay.x,
        startOY: overlay.y
      };
    },
    [selectOverlay]
  );
  const onPointerMove = useCallback5(
    (e) => {
      if (!dragRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = (e.clientX - dragRef.current.startX) / rect.width;
      const dy = (e.clientY - dragRef.current.startY) / rect.height;
      const x = Math.max(0, Math.min(1, dragRef.current.startOX + dx));
      const y = Math.max(0, Math.min(1, dragRef.current.startOY + dy));
      updateOverlay(dragRef.current.id, { x, y });
    },
    [updateOverlay]
  );
  const onPointerUp = useCallback5(() => {
    dragRef.current = null;
  }, []);
  if (visibleOverlays.length === 0) return null;
  return /* @__PURE__ */ jsx5(
    "div",
    {
      ref: containerRef,
      className: "absolute inset-0 pointer-events-none",
      style: { zIndex: 15 },
      onPointerMove,
      onPointerUp,
      children: visibleOverlays.map((overlay) => {
        const isSelected = selectedOverlayId === overlay.id;
        if (overlay.type === "text") {
          const o = overlay;
          return /* @__PURE__ */ jsxs4(
            "div",
            {
              className: "absolute pointer-events-auto select-none",
              style: {
                left: `${o.x * 100}%`,
                top: `${o.y * 100}%`,
                transform: "translate(-50%, -50%)",
                cursor: "move",
                outline: isSelected ? "2px solid var(--kt-accent)" : "none",
                outlineOffset: 4,
                borderRadius: 2,
                padding: "2px 4px"
              },
              onPointerDown: onPointerDown(o),
              children: [
                /* @__PURE__ */ jsx5(
                  "span",
                  {
                    style: {
                      fontFamily: o.fontFamily,
                      fontSize: o.fontSize,
                      color: o.color,
                      fontWeight: o.bold ? "bold" : "normal",
                      textShadow: "0 1px 4px rgba(0,0,0,0.7)",
                      whiteSpace: "nowrap",
                      display: "block"
                    },
                    children: o.text
                  }
                ),
                isSelected && /* @__PURE__ */ jsx5(
                  "button",
                  {
                    className: "absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full flex items-center justify-center",
                    style: { background: "var(--kt-danger-btn)", color: "var(--kt-text-primary)", fontSize: 10, pointerEvents: "auto" },
                    onPointerDown: (e) => e.stopPropagation(),
                    onClick: () => removeOverlay(o.id),
                    children: "\xD7"
                  }
                )
              ]
            },
            o.id
          );
        }
        if (overlay.type === "sticker") {
          const o = overlay;
          const emojiSize = 48 * o.scale;
          const imgSize = 80 * o.scale;
          return /* @__PURE__ */ jsxs4(
            "div",
            {
              className: "absolute pointer-events-auto select-none",
              style: {
                left: `${o.x * 100}%`,
                top: `${o.y * 100}%`,
                transform: "translate(-50%, -50%)",
                cursor: "move",
                outline: isSelected ? "2px solid var(--kt-accent)" : "none",
                outlineOffset: 4,
                borderRadius: 4,
                lineHeight: 1
              },
              onPointerDown: onPointerDown(o),
              children: [
                o.imageUrl ? /* @__PURE__ */ jsx5(
                  "img",
                  {
                    src: o.imageUrl,
                    alt: "",
                    style: {
                      width: imgSize,
                      height: imgSize,
                      objectFit: "contain",
                      display: "block",
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                      pointerEvents: "none"
                    },
                    draggable: false
                  }
                ) : /* @__PURE__ */ jsx5(
                  "span",
                  {
                    style: {
                      fontSize: emojiSize,
                      display: "block",
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))"
                    },
                    children: o.emoji
                  }
                ),
                isSelected && /* @__PURE__ */ jsx5(
                  "button",
                  {
                    className: "absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full flex items-center justify-center",
                    style: { background: "var(--kt-danger-btn)", color: "var(--kt-text-primary)", fontSize: 10, pointerEvents: "auto" },
                    onPointerDown: (e) => e.stopPropagation(),
                    onClick: () => removeOverlay(o.id),
                    children: "\xD7"
                  }
                )
              ]
            },
            o.id
          );
        }
        return null;
      })
    }
  );
}

// components/editor/preview/DrawingCanvas.tsx
import { useRef as useRef4, useEffect as useEffect3, useCallback as useCallback6 } from "react";
import { jsx as jsx6 } from "react/jsx-runtime";
function drawArrowhead2(ctx, fromX, fromY, toX, toY, headLength) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.save();
  ctx.translate(toX, toY);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-headLength, -headLength * 0.4);
  ctx.lineTo(-headLength, headLength * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
function renderStrokes(ctx, strokes, w, h) {
  ctx.clearRect(0, 0, w, h);
  for (const stroke of strokes) {
    if (stroke.points.length < 2) continue;
    ctx.save();
    const isEraser = stroke.tool === "eraser";
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.strokeStyle = isEraser ? "rgba(0,0,0,1)" : stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const p0 = stroke.points[0];
    const p1 = stroke.points[stroke.points.length - 1];
    const x0 = p0.x * w;
    const y0 = p0.y * h;
    const x1 = p1.x * w;
    const y1 = p1.y * h;
    if (stroke.tool === "arrow" || stroke.tool === "straight") {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      if (stroke.tool === "arrow") {
        ctx.fillStyle = isEraser ? "rgba(0,0,0,1)" : stroke.color;
        drawArrowhead2(ctx, x0, y0, x1, y1, Math.max(12, stroke.width * 3));
      }
    } else if (stroke.tool === "curved") {
      if (stroke.points.length >= 3) {
        const cp = stroke.points[1];
        const cx = cp.x * w;
        const cy = cp.y * h;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(cx, cy, x1, y1);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x * w, stroke.points[i].y * h);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
}
function DrawingCanvas({ isActive }) {
  const canvasRef = useRef4(null);
  const activeStrokeRef = useRef4([]);
  const isDrawingRef = useRef4(false);
  const startPointRef = useRef4(null);
  const freezeStartRef = useRef4(0);
  const drawingTool = useEditorStore((s) => s.drawingTool);
  const drawingColor = useEditorStore((s) => s.drawingColor);
  const drawingWidth = useEditorStore((s) => s.drawingWidth);
  const addStroke = useEditorStore((s) => s.addStroke);
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const setPlaybackRate = useEditorStore((s) => s.setPlaybackRate);
  const annotateMode = useEditorStore((s) => s.annotateMode);
  useEffect3(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { strokes, currentTime } = useEditorStore.getState();
    const visible = strokes.filter(
      (s) => s.startTime <= currentTime && currentTime < s.endTime
    );
    renderStrokes(ctx, visible, canvas.width, canvas.height);
    const unsub = useEditorStore.subscribe(() => {
      const { strokes: s, currentTime: t } = useEditorStore.getState();
      const v = s.filter(
        (st) => st.startTime <= t && t < st.endTime
      );
      renderStrokes(ctx, v, canvas.width, canvas.height);
    });
    return unsub;
  }, []);
  const getRelative = useCallback6((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    };
  }, []);
  const isDrawMode = isActive && annotateMode === "draw";
  const onPointerDown = useCallback6(
    (e) => {
      if (!isActive || annotateMode !== "draw") return;
      setPlaying(false);
      setPlaybackRate(0);
      freezeStartRef.current = useEditorStore.getState().currentTime;
      e.currentTarget.setPointerCapture(e.pointerId);
      isDrawingRef.current = true;
      const pt = getRelative(e);
      startPointRef.current = pt;
      activeStrokeRef.current = [pt];
    },
    [isActive, annotateMode, getRelative, setPlaying, setPlaybackRate]
  );
  const onPointerMove = useCallback6(
    (e) => {
      if (!isDrawingRef.current || !isActive || annotateMode !== "draw") return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const pt = getRelative(e);
      const { strokes, currentTime } = useEditorStore.getState();
      const visibleStrokes = strokes.filter(
        (s) => s.startTime <= currentTime && currentTime < s.endTime
      );
      if (drawingTool === "pen" || drawingTool === "eraser") {
        activeStrokeRef.current.push(pt);
        renderStrokes(ctx, visibleStrokes, canvas.width, canvas.height);
        const pts = activeStrokeRef.current;
        if (pts.length < 2) return;
        ctx.save();
        const isEraser = drawingTool === "eraser";
        ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
        ctx.strokeStyle = isEraser ? "rgba(0,0,0,1)" : drawingColor;
        ctx.lineWidth = drawingWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(pts[0].x * canvas.width, pts[0].y * canvas.height);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x * canvas.width, pts[i].y * canvas.height);
        }
        ctx.stroke();
        ctx.restore();
      } else {
        activeStrokeRef.current = [startPointRef.current, pt];
        renderStrokes(ctx, visibleStrokes, canvas.width, canvas.height);
        const p0 = startPointRef.current;
        const x0 = p0.x * canvas.width;
        const y0 = p0.y * canvas.height;
        const x1 = pt.x * canvas.width;
        const y1 = pt.y * canvas.height;
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = drawingColor;
        ctx.lineWidth = drawingWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (drawingTool === "curved") {
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
          if (drawingTool === "arrow") {
            ctx.fillStyle = drawingColor;
            drawArrowhead2(ctx, x0, y0, x1, y1, Math.max(12, drawingWidth * 3));
          }
        }
        ctx.restore();
      }
    },
    [isActive, drawingTool, drawingColor, drawingWidth, getRelative]
  );
  const onPointerUp = useCallback6(
    () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      const pts = activeStrokeRef.current;
      if (drawingTool === "pen" || drawingTool === "eraser") {
        if (pts.length >= 2) {
          addStroke({
            id: crypto.randomUUID(),
            tool: drawingTool,
            color: drawingColor,
            width: drawingWidth,
            points: pts
          });
        }
      } else if (drawingTool === "arrow" || drawingTool === "straight") {
        if (pts.length >= 2) {
          addStroke({
            id: crypto.randomUUID(),
            tool: drawingTool,
            color: drawingColor,
            width: drawingWidth,
            points: pts
          });
        }
      } else if (drawingTool === "curved") {
        if (pts.length >= 2) {
          const start = pts[0];
          const end = pts[pts.length - 1];
          let control;
          if (pts.length >= 3) {
            control = pts[Math.floor(pts.length / 2)];
          } else {
            const mx = (start.x + end.x) / 2;
            const my = (start.y + end.y) / 2;
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            control = { x: mx - dy / len * 0.15, y: my + dx / len * 0.15 };
          }
          addStroke({
            id: crypto.randomUUID(),
            tool: drawingTool,
            color: drawingColor,
            width: drawingWidth,
            points: [start, control, end]
          });
        }
      }
      activeStrokeRef.current = [];
      startPointRef.current = null;
    },
    [addStroke, drawingTool, drawingColor, drawingWidth]
  );
  return /* @__PURE__ */ jsx6(
    "canvas",
    {
      ref: canvasRef,
      width: 1280,
      height: 720,
      className: "absolute inset-0 w-full h-full",
      style: {
        zIndex: 18,
        cursor: isActive && annotateMode === "draw" ? drawingTool === "eraser" ? "cell" : "crosshair" : "none",
        pointerEvents: isActive && annotateMode === "draw" ? "auto" : "none"
      },
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerLeave: onPointerUp
    }
  );
}

// components/editor/preview/ShapeOverlay.tsx
import { useRef as useRef5, useEffect as useEffect4, useCallback as useCallback7, useState as useState3 } from "react";

// lib/webcodecs/PreviewEngine.ts
var renderer = new FrameRenderer();
function drawShapesOnCtx(ctx, shapes, w, h) {
  for (const shape of shapes) {
    ctx.save();
    const cx = shape.x * w;
    const cy = shape.y * h;
    const sw = shape.width * w;
    const sh = shape.height * h;
    const halfW = sw / 2;
    const halfH = sh / 2;
    const style = shape.style || "simple";
    const drawPath = (drawFn) => {
      if (style === "note") {
        const r = Math.min(12, sw * 0.08, sh * 0.08);
        const fold = Math.min(24, sw * 0.15, sh * 0.15);
        const x = cx - halfW;
        const y = cy - halfH;
        const notePath = () => {
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + sw - fold - r, y);
          ctx.quadraticCurveTo(x + sw - fold, y, x + sw - fold, y + r);
          ctx.lineTo(x + sw, y + fold + r);
          ctx.lineTo(x + sw, y + sh - r);
          ctx.quadraticCurveTo(x + sw, y + sh, x + sw - r, y + sh);
          ctx.lineTo(x + r, y + sh);
          ctx.quadraticCurveTo(x, y + sh, x, y + sh - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
        };
        if (shape.fillColor !== "transparent") {
          ctx.save();
          ctx.shadowColor = "rgba(0,0,0,0.25)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 3;
          ctx.fillStyle = shape.fillColor;
          notePath();
          ctx.fill();
          ctx.restore();
        }
        notePath();
        if (shape.fillColor !== "transparent") {
          ctx.fillStyle = shape.fillColor;
          ctx.fill();
        }
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.strokeWidth;
        ctx.stroke();
        ctx.save();
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + sw - fold, y);
        ctx.lineTo(x + sw, y + fold);
        ctx.stroke();
        ctx.restore();
      } else if (style === "sticky") {
        const x = cx - halfW;
        const y = cy - halfH;
        const angle = 0.03;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.translate(-cx, -cy);
        if (shape.fillColor !== "transparent") {
          ctx.shadowColor = "rgba(0,0,0,0.2)";
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 4;
          ctx.fillStyle = shape.fillColor;
          ctx.beginPath();
          ctx.roundRect(x, y, sw, sh, 4);
          ctx.fill();
        }
        ctx.restore();
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.translate(-cx, -cy);
        if (shape.fillColor !== "transparent") {
          ctx.fillStyle = shape.fillColor;
          ctx.beginPath();
          ctx.roundRect(x, y, sw, sh, 4);
          ctx.fill();
        }
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.strokeWidth;
        ctx.stroke();
        ctx.restore();
      } else if (style === "outline") {
        const x = cx - halfW;
        const y = cy - halfH;
        ctx.save();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.strokeWidth;
        ctx.globalAlpha = 0.4;
        drawFn();
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.strokeWidth;
        ctx.globalAlpha = 1;
        const inset = 6;
        ctx.beginPath();
        ctx.rect(x + inset, y + inset, sw - inset * 2, sh - inset * 2);
        ctx.stroke();
        ctx.restore();
        if (shape.fillColor !== "transparent") {
          ctx.fillStyle = shape.fillColor;
          ctx.beginPath();
          ctx.rect(x, y, sw, sh);
          ctx.fill();
        }
      } else if (style === "neon") {
        ctx.save();
        ctx.shadowColor = shape.color;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.strokeWidth + 2;
        ctx.globalAlpha = 0.6;
        drawFn();
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.shadowColor = shape.color;
        ctx.shadowBlur = 8;
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.strokeWidth;
        drawFn();
        ctx.stroke();
        ctx.restore();
        if (shape.fillColor !== "transparent") {
          ctx.fillStyle = shape.fillColor;
          drawFn();
          ctx.fill();
        }
      } else {
        drawFn();
        if (shape.fillColor !== "transparent") ctx.fill();
        ctx.stroke();
      }
    };
    if (shape.type === "rectangle") {
      drawPath(() => {
        ctx.beginPath();
        ctx.roundRect(cx - halfW, cy - halfH, sw, sh, 6);
      });
    } else if (shape.type === "circle") {
      drawPath(() => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, halfW, halfH, 0, 0, Math.PI * 2);
      });
    } else if (shape.type === "text") {
      const size = Math.round(shape.fontSize * (h / 720));
      ctx.font = `bold ${size}px sans-serif`;
      ctx.fillStyle = shape.color;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const maxW = sw > 10 ? sw : w * 0.3;
      const maxH = sh > 10 ? sh : h * 0.15;
      const tx = cx - maxW / 2;
      const ty = cy - maxH / 2;
      const words = shape.text.split(" ");
      const lines = [];
      let currentLine = "";
      for (const word of words) {
        const testLine = currentLine ? currentLine + " " + word : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxW && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      const lineHeight = size * 1.3;
      const maxLines = Math.floor(maxH / lineHeight);
      ctx.save();
      ctx.beginPath();
      ctx.rect(tx, ty, maxW, maxH);
      ctx.clip();
      for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
        ctx.fillText(lines[i], tx, ty + i * lineHeight);
      }
      ctx.restore();
    }
    ctx.restore();
  }
}
async function renderPreview(canvas, clips, currentTime, effectsMap, skipCrop = false, shapes = []) {
  var _a;
  const activeClip = clips.find(
    (c) => c.trackId === "track-video" && c.startTime <= currentTime && c.startTime + c.duration > currentTime
  );
  if (!activeClip) {
    renderer.clear(canvas);
    return;
  }
  const localTime = currentTime - activeClip.startTime + activeClip.trimIn;
  const decoder = getDecoderForFile(activeClip.file);
  const frame = await decoder.requestFrame(activeClip.file, localTime);
  if (!frame) return;
  const base = (_a = effectsMap[activeClip.id]) != null ? _a : DEFAULT_EFFECTS;
  const effects = skipCrop ? __spreadProps(__spreadValues({}, base), { cropX: 0, cropY: 0, cropW: 1, cropH: 1 }) : base;
  renderer.renderFrame(frame, canvas, effects);
  frame.close();
  const visibleShapes = shapes.filter(
    (s) => s.startTime <= currentTime && currentTime < s.endTime
  );
  if (visibleShapes.length > 0) {
    const ctx = canvas.getContext("2d");
    if (ctx) drawShapesOnCtx(ctx, visibleShapes, canvas.width, canvas.height);
  }
}

// components/editor/preview/ShapeOverlay.tsx
import { jsx as jsx7 } from "react/jsx-runtime";
var HANDLE_SIZE = 8;
var HANDLE_HALF = HANDLE_SIZE / 2;
function hitTest(px, py, shape) {
  const w = shape.width > 0 ? shape.width : 0.2;
  const h = shape.height > 0 ? shape.height : 0.1;
  const hw = w / 2;
  const hh = h / 2;
  const left = shape.x - hw;
  const right = shape.x + hw;
  const top = shape.y - hh;
  const bottom = shape.y + hh;
  if (shape.type === "rectangle" || shape.type === "text") {
    return px >= left && px <= right && py >= top && py <= bottom;
  }
  if (shape.type === "circle") {
    const dx = (px - shape.x) / hw;
    const dy = (py - shape.y) / hh;
    return dx * dx + dy * dy <= 1;
  }
  return false;
}
function getShapeBounds(shape) {
  const w = shape.width > 0 ? shape.width : 0.2;
  const h = shape.height > 0 ? shape.height : 0.1;
  return {
    left: shape.x - w / 2,
    right: shape.x + w / 2,
    top: shape.y - h / 2,
    bottom: shape.y + h / 2,
    w,
    h
  };
}
function hitCorner(px, py, shape, canvasW, canvasH) {
  const b = getShapeBounds(shape);
  const corners = [
    { key: "tl", nx: b.left, ny: b.top },
    { key: "tr", nx: b.right, ny: b.top },
    { key: "bl", nx: b.left, ny: b.bottom },
    { key: "br", nx: b.right, ny: b.bottom }
  ];
  const threshold = HANDLE_SIZE / Math.min(canvasW, canvasH);
  for (const c of corners) {
    if (Math.abs(px - c.nx) < threshold && Math.abs(py - c.ny) < threshold) {
      return c.key;
    }
  }
  return null;
}
function ShapeOverlay({ isActive }) {
  const canvasRef = useRef5(null);
  const [hoveredCorner, setHoveredCorner] = useState3(null);
  const draggingRef = useRef5(null);
  const resizeRef = useRef5(null);
  const annotateMode = useEditorStore((s) => s.annotateMode);
  const selectedShapeId = useEditorStore((s) => s.selectedShapeId);
  const selectShape = useEditorStore((s) => s.selectShape);
  const updateShape = useEditorStore((s) => s.updateShape);
  const isShapeMode = isActive && annotateMode === "shape";
  useEffect4(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const render = () => {
      const { shapes, currentTime } = useEditorStore.getState();
      const visible = shapes.filter(
        (s) => s.startTime <= currentTime && currentTime < s.endTime
      );
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawShapesOnCtx(ctx, visible, canvas.width, canvas.height);
      const selected = visible.find((s) => s.id === selectedShapeId);
      if (selected) {
        const cx = selected.x * canvas.width;
        const cy = selected.y * canvas.height;
        const sw = selected.width * canvas.width;
        const sh = selected.height * canvas.height;
        const halfW = sw / 2;
        const halfH = sh / 2;
        ctx.save();
        ctx.strokeStyle = "#00aaff";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(cx - halfW - 4, cy - halfH - 4, sw + 8, sh + 8);
        ctx.fillStyle = "#00aaff";
        const corners = [
          [cx - halfW - 4, cy - halfH - 4],
          [cx + halfW + 4, cy - halfH - 4],
          [cx - halfW - 4, cy + halfH + 4],
          [cx + halfW + 4, cy + halfH + 4]
        ];
        corners.forEach(([hx, hy]) => {
          ctx.fillRect(hx - HANDLE_HALF, hy - HANDLE_HALF, HANDLE_SIZE, HANDLE_SIZE);
        });
        ctx.restore();
      }
    };
    render();
    const unsub = useEditorStore.subscribe(() => {
      if (!draggingRef.current && !resizeRef.current) render();
    });
    return unsub;
  }, [selectedShapeId]);
  const getRelative = useCallback7((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    };
  }, []);
  const getCanvasSize = useCallback7(() => {
    const canvas = canvasRef.current;
    return { cw: canvas.width, ch: canvas.height };
  }, []);
  const onPointerDown = useCallback7(
    (e) => {
      if (!isShapeMode) return;
      const pt = getRelative(e);
      const { cw, ch } = getCanvasSize();
      const { shapes, currentTime } = useEditorStore.getState();
      const visible = shapes.filter(
        (s) => s.startTime <= currentTime && currentTime < s.endTime
      );
      const selected = visible.find((s) => s.id === selectedShapeId);
      if (selected) {
        const corner = hitCorner(pt.x, pt.y, selected, cw, ch);
        if (corner) {
          e.currentTarget.setPointerCapture(e.pointerId);
          resizeRef.current = {
            shapeId: selected.id,
            corner,
            startPx: pt.x,
            startPy: pt.y,
            origBounds: getShapeBounds(selected)
          };
          return;
        }
      }
      let hit = null;
      for (let i = visible.length - 1; i >= 0; i--) {
        if (hitTest(pt.x, pt.y, visible[i])) {
          hit = visible[i];
          break;
        }
      }
      if (hit) {
        selectShape(hit.id);
        e.currentTarget.setPointerCapture(e.pointerId);
        draggingRef.current = {
          shapeId: hit.id,
          startX: pt.x,
          startY: pt.y,
          origX: hit.x,
          origY: hit.y
        };
      } else {
        selectShape(null);
      }
    },
    [isShapeMode, getRelative, getCanvasSize, selectedShapeId, selectShape]
  );
  const onPointerMove = useCallback7(
    (e) => {
      const pt = getRelative(e);
      const { cw, ch } = getCanvasSize();
      if (resizeRef.current) {
        const r = resizeRef.current;
        const dx = pt.x - r.startPx;
        const dy = pt.y - r.startPy;
        let newLeft = r.origBounds.left;
        let newRight = r.origBounds.right;
        let newTop = r.origBounds.top;
        let newBottom = r.origBounds.bottom;
        switch (r.corner) {
          case "tl":
            newLeft = r.origBounds.left + dx;
            newTop = r.origBounds.top + dy;
            break;
          case "tr":
            newRight = r.origBounds.right + dx;
            newTop = r.origBounds.top + dy;
            break;
          case "bl":
            newLeft = r.origBounds.left + dx;
            newBottom = r.origBounds.bottom + dy;
            break;
          case "br":
            newRight = r.origBounds.right + dx;
            newBottom = r.origBounds.bottom + dy;
            break;
        }
        const MIN_SIZE = 0.02;
        let left = Math.max(0, Math.min(newLeft, newRight - MIN_SIZE));
        let right = Math.min(1, Math.max(newRight, left + MIN_SIZE));
        let top = Math.max(0, Math.min(newTop, newBottom - MIN_SIZE));
        let bottom = Math.min(1, Math.max(newBottom, top + MIN_SIZE));
        const newW = right - left;
        const newH = bottom - top;
        const newX = left + newW / 2;
        const newY = top + newH / 2;
        updateShape(r.shapeId, { x: newX, y: newY, width: newW, height: newH });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const { shapes, currentTime } = useEditorStore.getState();
        const visible = shapes.filter(
          (s) => s.startTime <= currentTime && currentTime < s.endTime
        );
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawShapesOnCtx(ctx, visible, canvas.width, canvas.height);
        const sel = visible.find((s) => s.id === r.shapeId);
        if (sel) {
          const cx = sel.x * canvas.width;
          const cy = sel.y * canvas.height;
          const sw = sel.width * canvas.width;
          const sh = sel.height * canvas.height;
          const halfW = sw / 2;
          const halfH = sh / 2;
          ctx.save();
          ctx.strokeStyle = "#00aaff";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(cx - halfW - 4, cy - halfH - 4, sw + 8, sh + 8);
          ctx.fillStyle = "#00aaff";
          const corners = [
            [cx - halfW - 4, cy - halfH - 4],
            [cx + halfW + 4, cy - halfH - 4],
            [cx - halfW - 4, cy + halfH + 4],
            [cx + halfW + 4, cy + halfH + 4]
          ];
          corners.forEach(([hx, hy]) => {
            ctx.fillRect(hx - HANDLE_HALF, hy - HANDLE_HALF, HANDLE_SIZE, HANDLE_SIZE);
          });
          ctx.restore();
        }
        return;
      }
      if (draggingRef.current) {
        const dx = pt.x - draggingRef.current.startX;
        const dy = pt.y - draggingRef.current.startY;
        const newX = Math.max(0, Math.min(1, draggingRef.current.origX + dx));
        const newY = Math.max(0, Math.min(1, draggingRef.current.origY + dy));
        updateShape(draggingRef.current.shapeId, { x: newX, y: newY });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const { shapes, currentTime } = useEditorStore.getState();
        const visible = shapes.filter(
          (s) => s.startTime <= currentTime && currentTime < s.endTime
        );
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawShapesOnCtx(ctx, visible, canvas.width, canvas.height);
        const sel = visible.find((s) => s.id === draggingRef.current.shapeId);
        if (sel) {
          const cx = sel.x * canvas.width;
          const cy = sel.y * canvas.height;
          const sw = sel.width * canvas.width;
          const sh = sel.height * canvas.height;
          const halfW = sw / 2;
          const halfH = sh / 2;
          ctx.save();
          ctx.strokeStyle = "#00aaff";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(cx - halfW - 4, cy - halfH - 4, sw + 8, sh + 8);
          ctx.restore();
        }
        return;
      }
      if (isShapeMode && selectedShapeId) {
        const { shapes, currentTime } = useEditorStore.getState();
        const sel = shapes.find(
          (s) => s.id === selectedShapeId && s.startTime <= currentTime && currentTime < s.endTime
        );
        if (sel) {
          const corner = hitCorner(pt.x, pt.y, sel, cw, ch);
          setHoveredCorner(corner);
        } else {
          setHoveredCorner(null);
        }
      } else {
        setHoveredCorner(null);
      }
    },
    [getRelative, getCanvasSize, isShapeMode, selectedShapeId, updateShape]
  );
  const onPointerUp = useCallback7(() => {
    if (draggingRef.current || resizeRef.current) {
      useEditorStore.getState().setCurrentTime(useEditorStore.getState().currentTime);
    }
    draggingRef.current = null;
    resizeRef.current = null;
  }, []);
  let cursor = "default";
  if (isShapeMode) {
    if (hoveredCorner === "tl" || hoveredCorner === "br") cursor = "nwse-resize";
    else if (hoveredCorner === "tr" || hoveredCorner === "bl") cursor = "nesw-resize";
    else if (selectedShapeId) cursor = "move";
    else cursor = "pointer";
  }
  return /* @__PURE__ */ jsx7(
    "canvas",
    {
      ref: canvasRef,
      width: 1280,
      height: 720,
      className: "absolute inset-0 w-full h-full",
      style: {
        zIndex: 17,
        cursor,
        pointerEvents: isShapeMode ? "auto" : "none"
      },
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerLeave: onPointerUp
    }
  );
}

// hooks/usePlayback.ts
import { useEffect as useEffect5, useRef as useRef6, useCallback as useCallback8 } from "react";
function getActiveClipNow(time) {
  const { clips } = useEditorStore.getState();
  const clip = clips.find(
    (c) => c.trackId === "track-video" && c.startTime <= time && c.startTime + c.duration > time
  );
  return clip ? { clip, decoder: getDecoderForFile(clip.file) } : null;
}
function usePlayback(canvasRef, onFirstFrame) {
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const clipsLength = useEditorStore((s) => s.clips.filter((c) => c.trackId === "track-video").length);
  const rafRef = useRef6(null);
  const renderingRef = useRef6(false);
  const firstFrameFiredRef = useRef6(false);
  useEffect5(() => {
    if (clipsLength === 0) firstFrameFiredRef.current = false;
  }, [clipsLength]);
  const renderFrame = useCallback8(
    async (time) => {
      if (!canvasRef.current || renderingRef.current) return;
      renderingRef.current = true;
      try {
        const { clips, clipEffects, cropToolActive, shapes } = useEditorStore.getState();
        await renderPreview(canvasRef.current, clips, time, clipEffects, cropToolActive, shapes);
        if (!firstFrameFiredRef.current) {
          firstFrameFiredRef.current = true;
          onFirstFrame == null ? void 0 : onFirstFrame();
        }
      } finally {
        renderingRef.current = false;
      }
    },
    [canvasRef, onFirstFrame]
  );
  const renderSourceFrame = useCallback8(
    async (clipId, sourceTime) => {
      var _a;
      if (!canvasRef.current || renderingRef.current) return;
      renderingRef.current = true;
      try {
        const { clips, clipEffects } = useEditorStore.getState();
        const clip = clips.find((c) => c.id === clipId);
        if (!clip) return;
        const decoder = getDecoderForFile(clip.file);
        const frame = await decoder.requestFrame(clip.file, sourceTime);
        if (!frame) return;
        const effects = (_a = clipEffects[clip.id]) != null ? _a : DEFAULT_EFFECTS;
        renderer.renderFrame(frame, canvasRef.current, effects);
        frame.close();
      } finally {
        renderingRef.current = false;
      }
    },
    [canvasRef]
  );
  const renderFrameRef = useRef6(renderFrame);
  renderFrameRef.current = renderFrame;
  const renderSourceFrameRef = useRef6(renderSourceFrame);
  renderSourceFrameRef.current = renderSourceFrame;
  useEffect5(() => {
    let lastTime = useEditorStore.getState().currentTime;
    let lastEffects = useEditorStore.getState().clipEffects;
    let lastTrimScrub = useEditorStore.getState().trimScrub;
    let lastCropToolActive = useEditorStore.getState().cropToolActive;
    let lastShapes = useEditorStore.getState().shapes;
    return useEditorStore.subscribe((state) => {
      if (state.isPlaying) return;
      const scrubChanged = state.trimScrub !== lastTrimScrub;
      if (scrubChanged) {
        lastTrimScrub = state.trimScrub;
        if (state.trimScrub) {
          renderSourceFrameRef.current(state.trimScrub.clipId, state.trimScrub.sourceTime);
          return;
        }
      }
      if (state.trimScrub) return;
      const timeChanged = state.currentTime !== lastTime;
      const effectsChanged = state.clipEffects !== lastEffects;
      const cropChanged = state.cropToolActive !== lastCropToolActive;
      const shapesChanged = state.shapes !== lastShapes;
      if (timeChanged || effectsChanged || cropChanged || shapesChanged) {
        lastTime = state.currentTime;
        lastEffects = state.clipEffects;
        lastCropToolActive = state.cropToolActive;
        lastShapes = state.shapes;
        renderFrameRef.current(state.currentTime);
      }
    });
  }, []);
  useEffect5(() => {
    if (clipsLength === 0) return;
    const timer = setTimeout(() => {
      renderFrameRef.current(useEditorStore.getState().currentTime);
    }, 100);
    return () => clearTimeout(timer);
  }, [clipsLength]);
  useEffect5(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }
    let lastTime = performance.now();
    let accumulated = 0;
    const loop = (now) => {
      var _a;
      const { duration, playbackRate } = useEditorStore.getState();
      if (playbackRate === 0) {
        lastTime = now;
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      const delta = (now - lastTime) / 1e3;
      lastTime = now;
      accumulated += delta * playbackRate;
      const frameDuration = 1 / 30;
      if (accumulated < frameDuration) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      const steps = Math.floor(accumulated / frameDuration);
      accumulated -= steps * frameDuration;
      const currentTime = useEditorStore.getState().currentTime;
      const active = getActiveClipNow(currentTime);
      if (active) {
        const videoTime = active.decoder.getVideoCurrentTime();
        const timelineTime = active.clip.startTime + videoTime - active.clip.trimIn;
        if (timelineTime >= duration) {
          useEditorStore.getState().setPlaying(false);
          active.decoder.stopPlayback();
          useEditorStore.getState().setCurrentTime(0);
          return;
        }
        useEditorStore.getState().setCurrentTime(Math.min(timelineTime, duration));
        if (canvasRef.current && !renderingRef.current) {
          const frame = active.decoder.captureCurrentFrame();
          if (frame) {
            const { clipEffects, cropToolActive, shapes } = useEditorStore.getState();
            const base = (_a = clipEffects[active.clip.id]) != null ? _a : DEFAULT_EFFECTS;
            const effects = cropToolActive ? __spreadProps(__spreadValues({}, base), { cropX: 0, cropY: 0, cropW: 1, cropH: 1 }) : base;
            renderer.renderFrame(frame, canvasRef.current, effects);
            frame.close();
            const visibleShapes = shapes.filter(
              (s) => s.startTime <= currentTime && currentTime < s.endTime
            );
            if (visibleShapes.length > 0) {
              const ctx = canvasRef.current.getContext("2d");
              if (ctx) drawShapesOnCtx(ctx, visibleShapes, canvasRef.current.width, canvasRef.current.height);
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, canvasRef]);
}

// lib/playbackActions.ts
function getActiveVideoClip(time) {
  var _a;
  const clips = useEditorStore.getState().clips;
  return (_a = clips.find(
    (c) => c.trackId === "track-video" && c.startTime <= time && c.startTime + c.duration > time
  )) != null ? _a : null;
}
function playAction() {
  const { currentTime, setPlaying } = useEditorStore.getState();
  const clip = getActiveVideoClip(currentTime);
  if (clip) {
    const localTime = currentTime - clip.startTime + clip.trimIn;
    getDecoderForFile(clip.file).startPlayback(localTime);
  }
  setPlaying(true);
}
function pauseAction() {
  const { currentTime, setPlaying } = useEditorStore.getState();
  const clip = getActiveVideoClip(currentTime);
  if (clip) {
    getDecoderForFile(clip.file).stopPlayback();
  }
  setPlaying(false);
}
function togglePlayAction() {
  const { isPlaying } = useEditorStore.getState();
  if (isPlaying) pauseAction();
  else playAction();
}

// components/editor/preview/PreviewPanel.tsx
import { useShallow } from "zustand/react/shallow";
import { Fragment as Fragment2, jsx as jsx8, jsxs as jsxs5 } from "react/jsx-runtime";
function PreviewPanel({ activeTool }) {
  var _a;
  const canvasRef = useRef7(null);
  const fileInputRef = useRef7(null);
  const [isMuted, setIsMuted] = useState4(true);
  const [audioBlocked, setAudioBlocked] = useState4(false);
  const [panX, setPanX] = useState4(0);
  const [panY, setPanY] = useState4(0);
  const [isPanning, setIsPanning] = useState4(false);
  const panDragRef = useRef7(null);
  const [previewReady, setPreviewReady] = useState4(false);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const duration = useEditorStore((s) => s.duration);
  const currentTime = useEditorStore((s) => s.currentTime);
  const clips = useEditorStore(useShallow((s) => s.clips.filter((c) => c.trackId === "track-video")));
  const clipEffects = useEditorStore((s) => s.clipEffects);
  const cropToolActive = useEditorStore((s) => s.cropToolActive);
  const storeZoom = useEditorStore((s) => s.zoom);
  const previewScale = storeZoom / 80;
  const { importFiles } = useVideoImport();
  usePlayback(canvasRef, useCallback9(() => setPreviewReady(true), []));
  useEffect6(() => {
    if (previewScale <= 1) {
      setPanX(0);
      setPanY(0);
    }
  }, [previewScale]);
  useEffect6(() => {
    if (clips.length === 0) setPreviewReady(false);
  }, [clips.length]);
  const handlePanDown = useCallback9((e) => {
    if (previewScale <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsPanning(true);
    panDragRef.current = { startX: e.clientX, startY: e.clientY, startPanX: panX, startPanY: panY };
  }, [previewScale, panX, panY]);
  const handlePanMove = useCallback9((e) => {
    if (!panDragRef.current) return;
    setPanX(panDragRef.current.startPanX + (e.clientX - panDragRef.current.startX));
    setPanY(panDragRef.current.startPanY + (e.clientY - panDragRef.current.startY));
  }, []);
  const handlePanUp = useCallback9(() => {
    panDragRef.current = null;
    setIsPanning(false);
  }, []);
  const activeClip = (_a = clips.find(
    (c) => c.startTime <= currentTime && c.startTime + c.duration > currentTime
  )) != null ? _a : clips[0];
  const aspectRatio = (() => {
    var _a2, _b;
    if (!activeClip) return "16/9";
    if (cropToolActive) return `${activeClip.width}/${activeClip.height}`;
    const effects = clipEffects[activeClip.id];
    const cropW = (_a2 = effects == null ? void 0 : effects.cropW) != null ? _a2 : 1;
    const cropH = (_b = effects == null ? void 0 : effects.cropH) != null ? _b : 1;
    return `${cropW * activeClip.width}/${cropH * activeClip.height}`;
  })();
  useEffect6(() => {
    if (!activeClip) return;
    const decoder = getDecoderForFile(activeClip.file);
    decoder.setMuted(isMuted);
  }, [isMuted, activeClip]);
  useEffect6(() => {
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
  return /* @__PURE__ */ jsx8(
    "div",
    {
      className: "relative flex-1 flex items-center justify-center overflow-hidden min-h-0",
      style: { cursor: previewScale > 1 ? isPanning ? "grabbing" : "grab" : "default", background: "var(--kt-bg-preview)" },
      onPointerDown: handlePanDown,
      onPointerMove: handlePanMove,
      onPointerUp: handlePanUp,
      children: hasClips ? /* @__PURE__ */ jsxs5(Fragment2, { children: [
        /* @__PURE__ */ jsxs5(
          "div",
          {
            className: "relative max-w-full max-h-full",
            style: { aspectRatio, display: "flex", transform: `translate(${panX}px, ${panY}px) scale(${previewScale})`, transformOrigin: "center center" },
            children: [
              /* @__PURE__ */ jsx8(PreviewCanvas, { ref: canvasRef }),
              !previewReady && /* @__PURE__ */ jsx8("div", { className: "absolute inset-0 flex items-center justify-center z-10", style: { background: "var(--kt-bg-preview)" }, children: /* @__PURE__ */ jsx8("div", { className: "w-8 h-8 border-2 rounded-full animate-spin", style: { borderColor: "var(--kt-spinner-border)", borderTopColor: "var(--kt-spinner-top)" } }) }),
              /* @__PURE__ */ jsx8(OverlayLayer, {}),
              /* @__PURE__ */ jsx8(DrawingCanvas, { isActive: activeTool === "annotate" }),
              /* @__PURE__ */ jsx8(ShapeOverlay, { isActive: activeTool === "annotate" }),
              activeTool === "crop" && /* @__PURE__ */ jsx8(CropOverlay, {})
            ]
          }
        ),
        audioBlocked && !isMuted && /* @__PURE__ */ jsxs5(
          motion2.div,
          {
            initial: { opacity: 0, y: -4 },
            animate: { opacity: 1, y: 0 },
            className: "absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm border text-xs",
            style: { background: "var(--kt-bg-surface)", borderColor: "var(--kt-border)", color: "var(--kt-text-secondary)" },
            children: [
              /* @__PURE__ */ jsx8("svg", { className: "w-3.5 h-3.5 shrink-0", fill: "currentColor", viewBox: "0 0 20 20", style: { color: "var(--kt-accent)" }, children: /* @__PURE__ */ jsx8("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }),
              "Audio blocked by browser \u2014 open in Chrome for sound"
            ]
          }
        ),
        /* @__PURE__ */ jsxs5("div", { className: "absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx8(
            motion2.button,
            {
              whileTap: { scale: 0.92 },
              onClick: togglePlayAction,
              disabled: duration === 0,
              className: "w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors shrink-0",
              style: { background: "var(--kt-text-primary)", color: "var(--kt-bg-base)" },
              children: isPlaying ? /* @__PURE__ */ jsx8("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx8("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z", clipRule: "evenodd" }) }) : /* @__PURE__ */ jsx8("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx8("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z", clipRule: "evenodd" }) })
            }
          ),
          /* @__PURE__ */ jsx8(
            motion2.button,
            {
              whileTap: { scale: 0.92 },
              onClick: handleMuteToggle,
              className: "w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors backdrop-blur-sm shrink-0",
              style: { background: "var(--kt-bg-subtle-hover)", color: "var(--kt-text-primary)" },
              title: isMuted ? "Unmute" : "Mute",
              children: isMuted ? /* @__PURE__ */ jsx8("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx8("path", { fillRule: "evenodd", d: "M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z", clipRule: "evenodd" }) }) : /* @__PURE__ */ jsx8("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx8("path", { fillRule: "evenodd", d: "M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z", clipRule: "evenodd" }) })
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsxs5(
        motion2.div,
        {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          className: "flex flex-col items-center gap-4 select-none",
          children: [
            /* @__PURE__ */ jsxs5(
              "button",
              {
                onClick: () => {
                  var _a2;
                  return (_a2 = fileInputRef.current) == null ? void 0 : _a2.click();
                },
                className: "flex flex-col items-center gap-3 px-8 py-6 rounded-xl border border-dashed transition-colors cursor-pointer group",
                style: { borderColor: "var(--kt-border-strong)" },
                children: [
                  /* @__PURE__ */ jsx8("div", { className: "w-12 h-12 rounded-full flex items-center justify-center transition-colors", style: { background: "var(--kt-bg-subtle)" }, children: /* @__PURE__ */ jsx8("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", strokeWidth: 1.5, viewBox: "0 0 24 24", style: { color: "var(--kt-text-secondary)" }, children: /* @__PURE__ */ jsx8("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" }) }) }),
                  /* @__PURE__ */ jsxs5("div", { className: "text-center", children: [
                    /* @__PURE__ */ jsx8("p", { className: "text-sm font-medium", style: { color: "var(--kt-text-primary)" }, children: "Import a video" }),
                    /* @__PURE__ */ jsx8("p", { className: "text-xs mt-0.5", style: { color: "var(--kt-text-muted)" }, children: "or drag and drop anywhere" })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsx8(
              "input",
              {
                ref: fileInputRef,
                type: "file",
                accept: "video/*",
                multiple: true,
                className: "hidden",
                onChange: (e) => e.target.files && importFiles(e.target.files)
              }
            )
          ]
        }
      )
    }
  );
}

// components/editor/panels/TrimPanel.tsx
import { useRef as useRef8, useCallback as useCallback10, useEffect as useEffect7, useState as useState5 } from "react";
import { useShallow as useShallow2 } from "zustand/react/shallow";

// lib/timeline/timeUtils.ts
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor(seconds % 1 * 100);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
}

// components/editor/panels/TrimPanel.tsx
import { Fragment as Fragment3, jsx as jsx9, jsxs as jsxs6 } from "react/jsx-runtime";
var STRIP_HEIGHT = 56;
var RULER_H = 20;
var TOTAL_H = RULER_H + STRIP_HEIGHT + 16;
var MIN_CLIP_DURATION = 0.1;
var HANDLE_W = 14;
var thumbCache = /* @__PURE__ */ new Map();
function TrimPanel() {
  var _a, _b, _c;
  const containerRef = useRef8(null);
  const [containerWidth, setContainerWidth] = useState5(0);
  const dragRef = useRef8(null);
  const clips = useEditorStore(useShallow2((s) => s.clips.filter((c) => c.trackId === "track-video")));
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const currentTime = useEditorStore((s) => s.currentTime);
  const duration = useEditorStore((s) => s.duration);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const trimClipStart = useEditorStore((s) => s.trimClipStart);
  const trimClipEnd = useEditorStore((s) => s.trimClipEnd);
  const splitClipAt = useEditorStore((s) => s.splitClipAt);
  const setSelectedClip = useEditorStore((s) => s.setSelectedClip);
  const setTrimScrub = useEditorStore((s) => s.setTrimScrub);
  const captureHistory = useEditorStore((s) => s.captureHistory);
  const transitions = useEditorStore((s) => s.transitions);
  const addTransition = useEditorStore((s) => s.addTransition);
  const removeTransition = useEditorStore((s) => s.removeTransition);
  const muted = useEditorStore((s) => s.muted);
  const toggleMuted = useEditorStore((s) => s.toggleMuted);
  const clip = (_b = (_a = clips.find((c) => c.id === selectedClipId)) != null ? _a : clips[0]) != null ? _b : null;
  useEffect7(() => {
    if (!selectedClipId && clips.length > 0) {
      setSelectedClip(clips[0].id);
    }
  }, [clips, selectedClipId, setSelectedClip]);
  useEffect7(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const sourceDuration = (_c = clip == null ? void 0 : clip.sourceDuration) != null ? _c : 1;
  const zoom = containerWidth > 0 && sourceDuration > 0 ? containerWidth / sourceDuration : 1;
  const [localSourceTime, setLocalSourceTime] = useState5(0);
  const isDraggingRef = useRef8(false);
  const wasPlayingRef = useRef8(false);
  useEffect7(() => {
    if (isDraggingRef.current || !clip) return;
    const src = clip.trimIn + (currentTime - clip.startTime);
    setLocalSourceTime(Math.max(0, Math.min(src, clip.sourceDuration)));
  }, [currentTime, clip]);
  const [thumbs, setThumbs] = useState5(() => {
    var _a2;
    return (_a2 = thumbCache.get("")) != null ? _a2 : [];
  });
  useEffect7(() => {
    if (!clip || containerWidth === 0) return;
    const cached = thumbCache.get(clip.id);
    if (cached) {
      setThumbs(cached);
      return;
    }
    setThumbs([]);
    const aspect = clip.width / clip.height;
    const thumbW = Math.round(STRIP_HEIGHT * aspect);
    const count = Math.max(2, Math.ceil(containerWidth / thumbW));
    const decoder = getDecoderForFile(clip.file);
    const promises = Array.from({ length: count }, (_, i) => {
      const t = i / Math.max(count - 1, 1) * clip.sourceDuration;
      return decoder.requestFrame(clip.file, t).then((frame) => {
        if (!frame) return null;
        const c = document.createElement("canvas");
        c.width = thumbW;
        c.height = STRIP_HEIGHT;
        const ctx = c.getContext("2d");
        if (ctx) ctx.drawImage(frame, 0, 0, thumbW, STRIP_HEIGHT);
        frame.close();
        return c.toDataURL("image/jpeg", 0.65);
      }).catch(() => null);
    });
    Promise.all(promises).then((results) => {
      const valid = results.filter(Boolean);
      if (valid.length > 0) {
        thumbCache.set(clip.id, valid);
        setThumbs(valid);
      }
    });
  }, [clip == null ? void 0 : clip.id, containerWidth]);
  const toX = (sec) => sec * zoom;
  const handlePointerMove = useCallback10(
    (e) => {
      const d = dragRef.current;
      if (!d || !clip || !containerRef.current) return;
      if (d.type === "scrub") {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const t = Math.max(0, Math.min(x / zoom, clip.sourceDuration));
        setLocalSourceTime(t);
        setTrimScrub({ clipId: clip.id, sourceTime: t });
        return;
      }
      const dxSec = (e.clientX - d.startX) / zoom;
      if (d.type === "trimStart") {
        const newTrimIn = Math.max(0, Math.min(d.startTrimIn + dxSec, d.startTrimOut - MIN_CLIP_DURATION));
        const delta = newTrimIn - d.startTrimIn;
        trimClipStart(clip.id, newTrimIn, d.startClipStartTime + delta, d.startDuration - delta);
      } else if (d.type === "trimEnd") {
        const newTrimOut = Math.min(
          clip.sourceDuration,
          Math.max(d.startTrimOut + dxSec, d.startTrimIn + MIN_CLIP_DURATION)
        );
        const delta = newTrimOut - d.startTrimOut;
        trimClipEnd(clip.id, newTrimOut, d.startDuration + delta);
      }
    },
    [clip, zoom, setTrimScrub, trimClipStart, trimClipEnd]
  );
  const handlePointerUp = useCallback10(() => {
    if (!clip) return;
    const d = dragRef.current;
    dragRef.current = null;
    isDraggingRef.current = false;
    if ((d == null ? void 0 : d.type) === "scrub") {
      setTrimScrub(null);
      const timelineT = clip.startTime + (localSourceTime - clip.trimIn);
      if (wasPlayingRef.current) {
        wasPlayingRef.current = false;
        const decoder = getDecoderForFile(clip.file);
        decoder.startPlayback(localSourceTime);
        useEditorStore.getState().setPlaying(true);
      } else {
        setCurrentTime(Math.max(0, Math.min(timelineT, duration)));
      }
    }
  }, [clip, localSourceTime, duration, setCurrentTime, setTrimScrub]);
  const beginDrag = useCallback10(
    (e, type) => {
      var _a2;
      if (!clip) return;
      e.stopPropagation();
      (_a2 = containerRef.current) == null ? void 0 : _a2.setPointerCapture(e.pointerId);
      isDraggingRef.current = true;
      if (type === "scrub") {
        const isPlaying = useEditorStore.getState().isPlaying;
        wasPlayingRef.current = isPlaying;
        if (isPlaying) pauseAction();
      } else {
        captureHistory();
      }
      dragRef.current = {
        type,
        startX: e.clientX,
        startTrimIn: clip.trimIn,
        startTrimOut: clip.trimOut,
        startClipStartTime: clip.startTime,
        startDuration: clip.duration
      };
    },
    [clip, captureHistory]
  );
  const rulerTicks = [];
  let majorInterval = 1;
  if (sourceDuration > 300) majorInterval = 60;
  else if (sourceDuration > 120) majorInterval = 30;
  else if (sourceDuration > 60) majorInterval = 10;
  else if (sourceDuration > 30) majorInterval = 5;
  const minorInterval = majorInterval / 5;
  for (let t = 0; t <= Math.ceil(sourceDuration); t += minorInterval) {
    rulerTicks.push({ t, isMajor: Math.abs(t % majorInterval) < minorInterval / 2 });
  }
  return /* @__PURE__ */ jsxs6(
    "div",
    {
      ref: containerRef,
      className: "shrink-0 relative border-t overflow-hidden select-none",
      style: { height: TOTAL_H, borderColor: "var(--kt-border)", background: "var(--kt-bg-panel)" },
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      children: [
        (!clip || containerWidth === 0) && /* @__PURE__ */ jsx9("div", { className: "flex items-center justify-center", style: { height: TOTAL_H }, children: /* @__PURE__ */ jsx9("p", { className: "text-xs", style: { color: "var(--kt-text-faint)" }, children: clips.length === 0 ? "Import a video to trim" : "Loading\u2026" }) }),
        clip && containerWidth > 0 && /* @__PURE__ */ jsxs6(Fragment3, { children: [
          /* @__PURE__ */ jsx9(
            "div",
            {
              className: "absolute top-0 left-0 right-0 cursor-col-resize",
              style: { height: RULER_H },
              onPointerDown: (e) => beginDrag(e, "scrub"),
              children: rulerTicks.map(({ t, isMajor }) => /* @__PURE__ */ jsxs6("div", { className: "absolute top-0 flex flex-col", style: { left: toX(t) }, children: [
                /* @__PURE__ */ jsx9("div", { className: `w-px ${isMajor ? "h-2.5" : "h-1.5"}`, style: { background: isMajor ? "var(--kt-tick-major)" : "var(--kt-tick-minor)" } }),
                isMajor && /* @__PURE__ */ jsx9("span", { className: "text-[9px] ml-1 leading-none tabular-nums", style: { color: "var(--kt-text-muted)" }, children: formatTime(t) })
              ] }, t))
            }
          ),
          /* @__PURE__ */ jsxs6(
            "div",
            {
              className: "absolute left-0 right-0 cursor-col-resize",
              style: { top: RULER_H, height: STRIP_HEIGHT },
              onPointerDown: (e) => beginDrag(e, "scrub"),
              children: [
                thumbs.length > 0 ? /* @__PURE__ */ jsx9("div", { className: "flex h-full pointer-events-none", children: thumbs.map((src, i) => /* @__PURE__ */ jsx9(
                  "img",
                  {
                    src,
                    alt: "",
                    className: "h-full flex-1 object-cover",
                    draggable: false,
                    style: { filter: `brightness(var(--kt-dimmed-thumb))` }
                  },
                  i
                )) }) : /* @__PURE__ */ jsx9("div", { className: "w-full h-full flex items-center justify-center pointer-events-none", style: { background: "var(--kt-bg-surface)" }, children: /* @__PURE__ */ jsx9("div", { className: "w-4 h-4 border-2 rounded-full animate-spin", style: { borderColor: "var(--kt-spinner-border)", borderTopColor: "var(--kt-spinner-top)" } }) }),
                (() => {
                  const selLeft = toX(clip.trimIn);
                  const selWidth = Math.max(toX(clip.trimOut) - toX(clip.trimIn), HANDLE_W * 2 + 4);
                  return /* @__PURE__ */ jsxs6(Fragment3, { children: [
                    /* @__PURE__ */ jsx9(
                      "div",
                      {
                        className: "absolute top-0 overflow-hidden pointer-events-none",
                        style: { left: selLeft, width: selWidth, height: STRIP_HEIGHT },
                        children: thumbs.length > 0 && /* @__PURE__ */ jsx9("div", { className: "flex h-full", style: { width: containerWidth, marginLeft: -selLeft }, children: thumbs.map((src, i) => /* @__PURE__ */ jsx9("img", { src, alt: "", className: "h-full flex-1 object-cover", draggable: false }, i)) })
                      }
                    ),
                    /* @__PURE__ */ jsx9(
                      "div",
                      {
                        className: "absolute top-0 pointer-events-none",
                        style: {
                          left: selLeft,
                          width: selWidth,
                          height: STRIP_HEIGHT,
                          border: "2px solid var(--kt-accent-strong-border)",
                          borderRadius: 2
                        }
                      }
                    ),
                    /* @__PURE__ */ jsx9(
                      "div",
                      {
                        className: "absolute top-0 bottom-0 flex items-center justify-center cursor-w-resize rounded-l",
                        style: { left: selLeft, width: HANDLE_W, zIndex: 10, background: "var(--kt-accent)" },
                        onPointerDown: (e) => beginDrag(e, "trimStart"),
                        children: /* @__PURE__ */ jsxs6("div", { className: "flex gap-0.5 pointer-events-none", children: [
                          /* @__PURE__ */ jsx9("div", { className: "w-0.5 h-5 bg-amber-900/60 rounded-full" }),
                          /* @__PURE__ */ jsx9("div", { className: "w-0.5 h-5 bg-amber-900/60 rounded-full" })
                        ] })
                      }
                    ),
                    /* @__PURE__ */ jsx9(
                      "div",
                      {
                        className: "absolute top-0 bottom-0 flex items-center justify-center cursor-e-resize rounded-r",
                        style: { left: selLeft + selWidth - HANDLE_W, width: HANDLE_W, zIndex: 10, background: "var(--kt-accent)" },
                        onPointerDown: (e) => beginDrag(e, "trimEnd"),
                        children: /* @__PURE__ */ jsxs6("div", { className: "flex gap-0.5 pointer-events-none", children: [
                          /* @__PURE__ */ jsx9("div", { className: "w-0.5 h-5 bg-amber-900/60 rounded-full" }),
                          /* @__PURE__ */ jsx9("div", { className: "w-0.5 h-5 bg-amber-900/60 rounded-full" })
                        ] })
                      }
                    ),
                    /* @__PURE__ */ jsx9(
                      "div",
                      {
                        className: "absolute pointer-events-none text-[9px] font-semibold tabular-nums px-1 rounded",
                        style: { left: selLeft + HANDLE_W + 2, top: 2, color: "var(--kt-badge-text)", background: "var(--kt-badge-bg)" },
                        children: formatTime(clip.trimIn)
                      }
                    ),
                    /* @__PURE__ */ jsx9(
                      "div",
                      {
                        className: "absolute pointer-events-none text-[9px] font-semibold tabular-nums px-1 rounded",
                        style: { left: selLeft + selWidth - HANDLE_W - 36, top: 2, color: "var(--kt-badge-text)", background: "var(--kt-badge-bg)" },
                        children: formatTime(clip.trimOut)
                      }
                    )
                  ] });
                })()
              ]
            }
          ),
          /* @__PURE__ */ jsxs6(
            "div",
            {
              className: "absolute top-0 z-20 pointer-events-none",
              style: { left: toX(localSourceTime), bottom: 0 },
              children: [
                /* @__PURE__ */ jsx9(
                  "div",
                  {
                    className: "absolute w-px",
                    style: { top: RULER_H - 2, bottom: 0, left: 0, transform: "translateX(-50%)", background: "var(--kt-text-primary)" }
                  }
                ),
                /* @__PURE__ */ jsx9(
                  "div",
                  {
                    className: "absolute -translate-x-1/2 border rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums cursor-col-resize pointer-events-auto",
                    style: { top: 0, background: "var(--kt-time-badge-bg)", color: "var(--kt-text-primary)", borderColor: "var(--kt-time-badge-border)" },
                    onPointerDown: (e) => beginDrag(e, "scrub"),
                    children: formatTime(localSourceTime)
                  }
                ),
                /* @__PURE__ */ jsx9(
                  "div",
                  {
                    className: "absolute -translate-x-1/2",
                    style: {
                      top: RULER_H - 1,
                      width: 0,
                      height: 0,
                      borderLeft: "5px solid transparent",
                      borderRight: "5px solid transparent",
                      borderTop: "6px solid var(--kt-text-primary)"
                    }
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs6(
            "div",
            {
              className: "absolute right-3 flex items-center gap-2",
              style: { top: RULER_H + 2 },
              children: [
                /* @__PURE__ */ jsxs6("span", { className: "pointer-events-none text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded", style: { color: "var(--kt-text-tertiary)", background: "var(--kt-badge-bg)" }, children: [
                  formatTime(clip.trimOut - clip.trimIn),
                  " / ",
                  formatTime(clip.sourceDuration)
                ] }),
                /* @__PURE__ */ jsx9(
                  "button",
                  {
                    onClick: () => {
                      captureHistory();
                      const srcTime = localSourceTime;
                      const newClipId = splitClipAt(clip.id, clip.startTime + (srcTime - clip.trimIn));
                      if (newClipId) setSelectedClip(newClipId);
                    },
                    className: "kt-btn-ghost text-[10px] font-semibold px-1.5 py-0.5 rounded",
                    title: "Split clip at playhead position",
                    children: "Split"
                  }
                ),
                (() => {
                  const clipStart = clip.startTime;
                  const clipEnd = clip.startTime + clip.duration;
                  const adjacent = clips.find((c) => {
                    if (c.id === clip.id) return false;
                    const cEnd = c.startTime + c.duration;
                    return Math.abs(c.startTime - clipEnd) < 0.01 || Math.abs(cEnd - clipStart) < 0.01;
                  });
                  if (!adjacent) return null;
                  const adjEnd = adjacent.startTime + adjacent.duration;
                  const clipA = clipEnd <= adjEnd ? clip : adjacent;
                  const clipB = clipA === clip ? adjacent : clip;
                  const hasTransition = transitions.some(
                    (t) => t.clipAId === clipA.id && t.clipBId === clipB.id
                  );
                  return hasTransition ? /* @__PURE__ */ jsx9(
                    "button",
                    {
                      onClick: () => {
                        const t = transitions.find(
                          (t2) => t2.clipAId === clipA.id && t2.clipBId === clipB.id
                        );
                        if (t) removeTransition(t.id);
                      },
                      className: "kt-btn-ghost text-[10px] font-semibold px-1.5 py-0.5 rounded",
                      title: "Remove crossfade transition",
                      children: "\u2715 Crossfade"
                    }
                  ) : /* @__PURE__ */ jsx9(
                    "button",
                    {
                      onClick: () => {
                        captureHistory();
                        addTransition(clipA.id, clipB.id);
                      },
                      className: "kt-btn-ghost text-[10px] font-semibold px-1.5 py-0.5 rounded",
                      title: "Add crossfade transition",
                      children: "+ Crossfade"
                    }
                  );
                })()
              ]
            }
          )
        ] })
      ]
    }
  );
}

// components/editor/panels/FinetunePanel.tsx
import { jsx as jsx10, jsxs as jsxs7 } from "react/jsx-runtime";
function SliderRow({ label, value, min, max, onValueChange, onPointerDown, displayValue }) {
  const pct = (value - min) / (max - min) * 100;
  return /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsx10("span", { className: "text-xs w-20 shrink-0", style: { color: "var(--kt-text-tertiary)" }, children: label }),
    /* @__PURE__ */ jsxs7("div", { className: "relative flex-1 h-5 flex items-center", children: [
      /* @__PURE__ */ jsx10("div", { className: "absolute inset-x-0 h-1 rounded-full", style: { background: "var(--kt-slider-track)" }, children: /* @__PURE__ */ jsx10("div", { className: "h-full rounded-full", style: { width: `${pct}%`, background: "var(--kt-slider-fill)" } }) }),
      /* @__PURE__ */ jsx10(
        "div",
        {
          className: "absolute w-3.5 h-3.5 rounded-full shadow-md pointer-events-none",
          style: { left: `calc(${pct}% - 7px)`, background: "var(--kt-slider-thumb)" }
        }
      ),
      /* @__PURE__ */ jsx10(
        "input",
        {
          type: "range",
          min,
          max,
          value,
          onChange: (e) => onValueChange(Number(e.target.value)),
          onPointerDown,
          className: "absolute inset-0 w-full opacity-0 cursor-pointer h-5"
        }
      )
    ] }),
    /* @__PURE__ */ jsx10("span", { className: "text-xs w-8 text-right tabular-nums shrink-0", style: { color: "var(--kt-text-tertiary)" }, children: displayValue != null ? displayValue : value })
  ] });
}
function FinetunePanel() {
  var _a, _b, _c;
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const clipEffects = useEditorStore((s) => s.clipEffects);
  const setClipEffect = useEditorStore((s) => s.setClipEffect);
  const resetClipEffects = useEditorStore((s) => s.resetClipEffects);
  const captureHistory = useEditorStore((s) => s.captureHistory);
  const clips = useEditorStore((s) => s.clips);
  const targetId = (_b = selectedClipId != null ? selectedClipId : (_a = clips.find((c) => c.trackId === "track-video")) == null ? void 0 : _a.id) != null ? _b : null;
  const effects = targetId ? (_c = clipEffects[targetId]) != null ? _c : DEFAULT_EFFECTS : DEFAULT_EFFECTS;
  const set = (key, v) => {
    if (targetId) setClipEffect(targetId, key, v);
  };
  const handleSliderPointerDown = () => captureHistory();
  return /* @__PURE__ */ jsxs7("div", { className: "shrink-0 border-t px-3 md:px-6 py-3 md:py-4 max-h-[180px] overflow-y-auto", style: { borderColor: "var(--kt-border)", background: "var(--kt-bg-panel)" }, children: [
    /* @__PURE__ */ jsxs7("div", { className: "flex items-center justify-between mb-2 md:mb-3", children: [
      /* @__PURE__ */ jsx10("span", { className: "text-xs font-semibold uppercase tracking-wider", style: { color: "var(--kt-text-secondary)" }, children: "Adjustments" }),
      targetId && /* @__PURE__ */ jsx10(
        "button",
        {
          onClick: () => resetClipEffects(targetId),
          className: "text-[11px] transition-colors",
          style: { color: "var(--kt-text-muted)" },
          children: "Reset"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 md:gap-y-2.5", children: [
      /* @__PURE__ */ jsx10(
        SliderRow,
        {
          label: "Brightness",
          value: effects.brightness,
          min: -100,
          max: 100,
          onValueChange: (v) => set("brightness", v),
          onPointerDown: handleSliderPointerDown
        }
      ),
      /* @__PURE__ */ jsx10(
        SliderRow,
        {
          label: "Contrast",
          value: effects.contrast,
          min: -100,
          max: 100,
          onValueChange: (v) => set("contrast", v),
          onPointerDown: handleSliderPointerDown
        }
      ),
      /* @__PURE__ */ jsx10(
        SliderRow,
        {
          label: "Saturation",
          value: effects.saturation,
          min: -100,
          max: 100,
          onValueChange: (v) => set("saturation", v),
          onPointerDown: handleSliderPointerDown
        }
      ),
      /* @__PURE__ */ jsx10(
        SliderRow,
        {
          label: "Rotation",
          value: effects.rotation,
          min: -180,
          max: 180,
          displayValue: `${effects.rotation}\xB0`,
          onValueChange: (v) => set("rotation", v),
          onPointerDown: handleSliderPointerDown
        }
      ),
      /* @__PURE__ */ jsx10(
        SliderRow,
        {
          label: "Opacity",
          value: Math.round(effects.opacity * 100),
          min: 0,
          max: 100,
          displayValue: `${Math.round(effects.opacity * 100)}%`,
          onValueChange: (v) => set("opacity", v / 100),
          onPointerDown: handleSliderPointerDown
        }
      ),
      /* @__PURE__ */ jsx10(
        SliderRow,
        {
          label: "Speed",
          value: Math.round(effects.speed * 100),
          min: 25,
          max: 400,
          displayValue: `${effects.speed.toFixed(2)}x`,
          onValueChange: (v) => set("speed", v / 100),
          onPointerDown: handleSliderPointerDown
        }
      )
    ] })
  ] });
}

// components/editor/panels/FilterPanel.tsx
import { jsx as jsx11, jsxs as jsxs8 } from "react/jsx-runtime";
var PRESETS = [
  {
    id: "original",
    label: "Original",
    effects: { brightness: 0, contrast: 0, saturation: 0 },
    cssFilter: "none"
  },
  {
    id: "vivid",
    label: "Vivid",
    effects: { brightness: 10, contrast: 20, saturation: 40 },
    cssFilter: "brightness(1.1) contrast(1.2) saturate(1.4)"
  },
  {
    id: "warm",
    label: "Warm",
    effects: { brightness: 8, contrast: 5, saturation: 15 },
    cssFilter: "brightness(1.08) contrast(1.05) saturate(1.15) sepia(0.2)"
  },
  {
    id: "cool",
    label: "Cool",
    effects: { brightness: 5, contrast: 10, saturation: -10 },
    cssFilter: "brightness(1.05) contrast(1.1) saturate(0.9) hue-rotate(20deg)"
  },
  {
    id: "bw",
    label: "B&W",
    effects: { brightness: 5, contrast: 15, saturation: -100 },
    cssFilter: "grayscale(1) brightness(1.05) contrast(1.15)"
  },
  {
    id: "fade",
    label: "Fade",
    effects: { brightness: 20, contrast: -20, saturation: -20 },
    cssFilter: "brightness(1.2) contrast(0.8) saturate(0.8)"
  },
  {
    id: "dramatic",
    label: "Dramatic",
    effects: { brightness: -5, contrast: 40, saturation: 20 },
    cssFilter: "brightness(0.95) contrast(1.4) saturate(1.2)"
  },
  {
    id: "film",
    label: "Film",
    effects: { brightness: -5, contrast: 10, saturation: -15 },
    cssFilter: "brightness(0.95) contrast(1.1) saturate(0.85) sepia(0.1)"
  },
  {
    id: "matte",
    label: "Matte",
    effects: { brightness: 15, contrast: -10, saturation: -30 },
    cssFilter: "brightness(1.15) contrast(0.9) saturate(0.7)"
  }
];
function FilterPanel() {
  var _a, _b, _c, _d, _e;
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const clips = useEditorStore((s) => s.clips);
  const clipEffects = useEditorStore((s) => s.clipEffects);
  const setClipEffects = useEditorStore((s) => s.setClipEffects);
  const captureHistory = useEditorStore((s) => s.captureHistory);
  const targetId = (_b = selectedClipId != null ? selectedClipId : (_a = clips.find((c) => c.trackId === "track-video")) == null ? void 0 : _a.id) != null ? _b : null;
  const effects = targetId ? (_c = clipEffects[targetId]) != null ? _c : DEFAULT_EFFECTS : DEFAULT_EFFECTS;
  const activePreset = (_e = (_d = PRESETS.find(
    (p) => {
      var _a2, _b2, _c2;
      return ((_a2 = p.effects.brightness) != null ? _a2 : 0) === effects.brightness && ((_b2 = p.effects.contrast) != null ? _b2 : 0) === effects.contrast && ((_c2 = p.effects.saturation) != null ? _c2 : 0) === effects.saturation;
    }
  )) == null ? void 0 : _d.id) != null ? _e : null;
  const applyPreset = (preset) => {
    if (!targetId) return;
    captureHistory();
    setClipEffects(targetId, preset.effects);
  };
  return /* @__PURE__ */ jsxs8("div", { className: "shrink-0 border-t px-3 md:px-4 py-3", style: { borderColor: "var(--kt-border)", background: "var(--kt-bg-panel)" }, children: [
    /* @__PURE__ */ jsx11("div", { className: "flex items-center justify-between mb-2.5", children: /* @__PURE__ */ jsx11("span", { className: "text-xs font-semibold uppercase tracking-wider", style: { color: "var(--kt-text-secondary)" }, children: "Filters" }) }),
    /* @__PURE__ */ jsx11("div", { className: "flex gap-2 overflow-x-auto pb-1 scrollbar-hide", children: PRESETS.map((preset) => /* @__PURE__ */ jsxs8(
      "button",
      {
        onClick: () => applyPreset(preset),
        className: "shrink-0 flex flex-col items-center gap-1.5 group",
        children: [
          /* @__PURE__ */ jsx11(
            "div",
            {
              className: "w-14 h-10 rounded-md overflow-hidden border-2 transition-colors",
              style: {
                borderColor: activePreset === preset.id ? "var(--kt-accent)" : "transparent"
              },
              children: /* @__PURE__ */ jsx11(
                "div",
                {
                  className: "w-full h-full",
                  style: {
                    background: "linear-gradient(135deg, #6b7280 0%, #374151 50%, #9ca3af 100%)",
                    filter: preset.cssFilter
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ jsx11(
            "span",
            {
              className: "text-[10px] leading-none transition-colors",
              style: { color: activePreset === preset.id ? "var(--kt-accent)" : "var(--kt-text-muted)" },
              children: preset.label
            }
          )
        ]
      },
      preset.id
    )) })
  ] });
}

// components/editor/panels/CropPanel.tsx
import { jsx as jsx12, jsxs as jsxs9 } from "react/jsx-runtime";
var ASPECT_PRESETS = [
  { label: "Free", ratio: null },
  { label: "16:9", ratio: [16, 9] },
  { label: "9:16", ratio: [9, 16] },
  { label: "4:3", ratio: [4, 3] },
  { label: "3:4", ratio: [3, 4] },
  { label: "1:1", ratio: [1, 1] }
];
function CropPanel() {
  var _a, _b, _c;
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const clips = useEditorStore((s) => s.clips);
  const clipEffects = useEditorStore((s) => s.clipEffects);
  const setClipEffects = useEditorStore((s) => s.setClipEffects);
  const resetClipEffects = useEditorStore((s) => s.resetClipEffects);
  const captureHistory = useEditorStore((s) => s.captureHistory);
  const targetId = (_b = selectedClipId != null ? selectedClipId : (_a = clips.find((c) => c.trackId === "track-video")) == null ? void 0 : _a.id) != null ? _b : null;
  const effects = targetId ? (_c = clipEffects[targetId]) != null ? _c : DEFAULT_EFFECTS : DEFAULT_EFFECTS;
  const applyCrop = (ratio) => {
    if (!targetId) return;
    captureHistory();
    if (!ratio) {
      setClipEffects(targetId, { cropX: 0, cropY: 0, cropW: 1, cropH: 1 });
      return;
    }
    const clip = clips.find((c) => c.id === targetId);
    if (!clip) return;
    const videoAspect = clip.width / clip.height;
    const targetAspect = ratio[0] / ratio[1];
    let cropW = 1, cropH = 1, cropX = 0, cropY = 0;
    if (targetAspect < videoAspect) {
      cropW = clip.height * targetAspect / clip.width;
      cropX = (1 - cropW) / 2;
    } else {
      cropH = clip.width / targetAspect / clip.height;
      cropY = (1 - cropH) / 2;
    }
    setClipEffects(targetId, { cropX, cropY, cropW, cropH });
  };
  const resetCrop = () => {
    if (!targetId) return;
    captureHistory();
    setClipEffects(targetId, { cropX: 0, cropY: 0, cropW: 1, cropH: 1 });
  };
  const isDefaultCrop = effects.cropX === 0 && effects.cropY === 0 && effects.cropW === 1 && effects.cropH === 1;
  return /* @__PURE__ */ jsxs9("div", { className: "shrink-0 border-t px-3 md:px-5 py-3", style: { borderColor: "var(--kt-border)", background: "var(--kt-bg-panel)" }, children: [
    /* @__PURE__ */ jsxs9("div", { className: "flex items-center justify-between mb-2.5", children: [
      /* @__PURE__ */ jsx12("span", { className: "text-[10px] font-semibold uppercase tracking-wider", style: { color: "var(--kt-text-muted)" }, children: "Aspect Ratio" }),
      !isDefaultCrop && /* @__PURE__ */ jsx12(
        "button",
        {
          onClick: resetCrop,
          className: "text-[11px] transition-colors",
          style: { color: "var(--kt-text-muted)" },
          children: "Reset"
        }
      )
    ] }),
    /* @__PURE__ */ jsx12("div", { className: "flex gap-1.5 flex-wrap", children: ASPECT_PRESETS.map((preset) => {
      const isActive = preset.ratio === null ? isDefaultCrop : (() => {
        if (!clips.find((c) => c.id === targetId)) return false;
        const clip = clips.find((c) => c.id === targetId);
        const videoAspect = clip.width / clip.height;
        const targetAspect = preset.ratio[0] / preset.ratio[1];
        let expectedW = 1, expectedH = 1, expectedX = 0, expectedY = 0;
        if (targetAspect < videoAspect) {
          expectedW = clip.height * targetAspect / clip.width;
          expectedX = (1 - expectedW) / 2;
        } else {
          expectedH = clip.width / targetAspect / clip.height;
          expectedY = (1 - expectedH) / 2;
        }
        return Math.abs(effects.cropX - expectedX) < 0.01 && Math.abs(effects.cropY - expectedY) < 0.01 && Math.abs(effects.cropW - expectedW) < 0.01 && Math.abs(effects.cropH - expectedH) < 0.01;
      })();
      return /* @__PURE__ */ jsx12(
        "button",
        {
          onClick: () => applyCrop(preset.ratio),
          className: `px-2.5 py-1 rounded text-xs font-medium transition-colors ${isActive ? "kt-chip-active" : "kt-chip"}`,
          children: preset.label
        },
        preset.label
      );
    }) }),
    /* @__PURE__ */ jsx12("p", { className: "text-[10px] mt-2", style: { color: "var(--kt-text-faint)" }, children: "Drag handles in preview to adjust crop freely" })
  ] });
}

// components/editor/panels/ResizePanel.tsx
import { jsx as jsx13, jsxs as jsxs10 } from "react/jsx-runtime";
var RESOLUTIONS = [
  { label: "Original", value: "original", desc: "Keep source resolution" },
  { label: "1080p", value: "1080p", desc: "1920 \xD7 1080" },
  { label: "720p", value: "720p", desc: "1280 \xD7 720" },
  { label: "480p", value: "480p", desc: "854 \xD7 480" }
];
var FPS_OPTIONS = [
  { label: "24 fps", value: 24 },
  { label: "30 fps", value: 30 },
  { label: "60 fps", value: 60 }
];
function ResizePanel() {
  const settings = useEditorStore((s) => s.settings);
  const updateSettings = useEditorStore((s) => s.updateExportSettings);
  return /* @__PURE__ */ jsx13("div", { className: "shrink-0 border-t px-3 md:px-5 py-3 max-h-[160px] overflow-y-auto", style: { borderColor: "var(--kt-border)", background: "var(--kt-bg-panel)" }, children: /* @__PURE__ */ jsxs10("div", { className: "flex flex-col md:flex-row gap-3 md:gap-8", children: [
    /* @__PURE__ */ jsxs10("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsx13("span", { className: "text-[10px] font-semibold uppercase tracking-wider", style: { color: "var(--kt-text-muted)" }, children: "Resolution" }),
      /* @__PURE__ */ jsx13("div", { className: "flex gap-1.5 mt-2 flex-wrap", children: RESOLUTIONS.map((r) => /* @__PURE__ */ jsx13(
        "button",
        {
          onClick: () => updateSettings({ resolution: r.value }),
          title: r.desc,
          className: `px-2.5 py-1 rounded text-xs font-medium transition-colors ${settings.resolution === r.value ? "kt-chip-active" : "kt-chip"}`,
          children: r.label
        },
        r.value
      )) })
    ] }),
    /* @__PURE__ */ jsxs10("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsx13("span", { className: "text-[10px] font-semibold uppercase tracking-wider", style: { color: "var(--kt-text-muted)" }, children: "Frame Rate" }),
      /* @__PURE__ */ jsx13("div", { className: "flex gap-1.5 mt-2", children: FPS_OPTIONS.map((f) => /* @__PURE__ */ jsx13(
        "button",
        {
          onClick: () => updateSettings({ fps: f.value }),
          className: `px-2.5 py-1 rounded text-xs font-medium transition-colors ${settings.fps === f.value ? "kt-chip-active" : "kt-chip"}`,
          children: f.label
        },
        f.value
      )) })
    ] }),
    /* @__PURE__ */ jsxs10("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsx13("span", { className: "text-[10px] font-semibold uppercase tracking-wider", style: { color: "var(--kt-text-muted)" }, children: "Format" }),
      /* @__PURE__ */ jsx13("div", { className: "flex gap-1.5 mt-2", children: ["mp4", "webm"].map((fmt) => /* @__PURE__ */ jsx13(
        "button",
        {
          onClick: () => updateSettings({ format: fmt }),
          className: `px-2.5 py-1 rounded text-xs font-medium uppercase transition-colors ${settings.format === fmt ? "kt-chip-active" : "kt-chip"}`,
          children: fmt
        },
        fmt
      )) })
    ] })
  ] }) });
}

// components/editor/panels/AnnotatePanel.tsx
import { useRef as useRef9, useState as useState6, useCallback as useCallback11 } from "react";
import { Fragment as Fragment4, jsx as jsx14, jsxs as jsxs11 } from "react/jsx-runtime";
var COLORS = ["#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00cfff", "#ffffff", "#000000"];
var WIDTHS = [2, 4, 8, 16];
var DRAWING_TOOLS = [
  { key: "pen", label: "Pen" },
  { key: "eraser", label: "Eraser" },
  { key: "straight", label: "Line" },
  { key: "arrow", label: "Arrow" },
  { key: "curved", label: "Curve" }
];
var SHAPE_TOOLS = [
  { key: "rectangle", label: "\u25A1 Rect" },
  { key: "circle", label: "\u25CB Circle" },
  { key: "text", label: "T Text" }
];
function AnnotatePanel() {
  const drawingTool = useEditorStore((s) => s.drawingTool);
  const drawingColor = useEditorStore((s) => s.drawingColor);
  const drawingWidth = useEditorStore((s) => s.drawingWidth);
  const annotationDuration = useEditorStore((s) => s.annotationDuration);
  const setDrawingTool = useEditorStore((s) => s.setDrawingTool);
  const setDrawingColor = useEditorStore((s) => s.setDrawingColor);
  const setDrawingWidth = useEditorStore((s) => s.setDrawingWidth);
  const setAnnotationDuration = useEditorStore((s) => s.setAnnotationDuration);
  const undoStroke = useEditorStore((s) => s.undoStroke);
  const clearStrokes = useEditorStore((s) => s.clearStrokes);
  const strokes = useEditorStore((s) => s.strokes);
  const shapeTool = useEditorStore((s) => s.shapeTool);
  const shapeStyle = useEditorStore((s) => s.shapeStyle);
  const shapeColor = useEditorStore((s) => s.shapeColor);
  const shapeFillColor = useEditorStore((s) => s.shapeFillColor);
  const shapeStrokeWidth = useEditorStore((s) => s.shapeStrokeWidth);
  const shapeText = useEditorStore((s) => s.shapeText);
  const shapeFontSize = useEditorStore((s) => s.shapeFontSize);
  const shapeDuration = useEditorStore((s) => s.shapeDuration);
  const shapes = useEditorStore((s) => s.shapes);
  const selectedShapeId = useEditorStore((s) => s.selectedShapeId);
  const setShapeTool = useEditorStore((s) => s.setShapeTool);
  const setShapeStyle = useEditorStore((s) => s.setShapeStyle);
  const setShapeColor = useEditorStore((s) => s.setShapeColor);
  const setShapeFillColor = useEditorStore((s) => s.setShapeFillColor);
  const setShapeStrokeWidth = useEditorStore((s) => s.setShapeStrokeWidth);
  const setShapeText = useEditorStore((s) => s.setShapeText);
  const setShapeFontSize = useEditorStore((s) => s.setShapeFontSize);
  const setShapeDuration = useEditorStore((s) => s.setShapeDuration);
  const addShape = useEditorStore((s) => s.addShape);
  const removeShape = useEditorStore((s) => s.removeShape);
  const clearShapes = useEditorStore((s) => s.clearShapes);
  const annotateMode = useEditorStore((s) => s.annotateMode);
  const setAnnotateMode = useEditorStore((s) => s.setAnnotateMode);
  const freezeOnOverlay = useEditorStore((s) => s.freezeOnOverlay);
  const setFreezeOnOverlay = useEditorStore((s) => s.setFreezeOnOverlay);
  return /* @__PURE__ */ jsxs11("div", { className: "shrink-0 border-t px-3 md:px-5 py-3", style: { borderColor: "var(--kt-border)", background: "var(--kt-bg-panel)" }, children: [
    /* @__PURE__ */ jsxs11("div", { className: "flex gap-1 mb-3 items-center", children: [
      /* @__PURE__ */ jsx14(
        "button",
        {
          onClick: () => setFreezeOnOverlay(!freezeOnOverlay),
          className: `px-2 py-1 rounded text-[10px] font-semibold transition-colors shrink-0 ${freezeOnOverlay ? "kt-btn-accent" : "kt-btn-subtle"}`,
          title: `Freeze video on overlay (1) \u2014 currently ${freezeOnOverlay ? "ON" : "OFF"}`,
          children: freezeOnOverlay ? "\u2744\uFE0F Freeze" : "\u25B6\uFE0F No freeze"
        }
      ),
      /* @__PURE__ */ jsx14("div", { className: "w-px h-4 mx-1", style: { background: "var(--kt-border)" } }),
      /* @__PURE__ */ jsx14(
        "button",
        {
          onClick: () => setAnnotateMode("draw"),
          className: `px-3 py-1 rounded text-xs font-medium transition-colors ${annotateMode === "draw" ? "kt-btn-accent" : "kt-btn-subtle"}`,
          children: "Draw"
        }
      ),
      /* @__PURE__ */ jsx14(
        "button",
        {
          onClick: () => setAnnotateMode("shape"),
          className: `px-3 py-1 rounded text-xs font-medium transition-colors ${annotateMode === "shape" ? "kt-btn-accent" : "kt-btn-subtle"}`,
          children: "Shapes"
        }
      )
    ] }),
    annotateMode === "draw" ? /* @__PURE__ */ jsx14(
      DrawTools,
      {
        drawingTool,
        drawingColor,
        drawingWidth,
        annotationDuration,
        setDrawingTool,
        setDrawingColor,
        setDrawingWidth,
        setAnnotationDuration,
        undoStroke,
        clearStrokes,
        strokes
      }
    ) : /* @__PURE__ */ jsx14(
      ShapeTools,
      {
        shapeTool,
        shapeStyle,
        shapeColor,
        shapeFillColor,
        shapeStrokeWidth,
        shapeText,
        shapeFontSize,
        shapeDuration,
        shapes,
        selectedShapeId,
        setShapeTool,
        setShapeStyle,
        setShapeColor,
        setShapeFillColor,
        setShapeStrokeWidth,
        setShapeText,
        setShapeFontSize,
        setShapeDuration,
        addShape,
        removeShape,
        clearShapes
      }
    )
  ] });
}
function DrawTools({
  drawingTool,
  drawingColor,
  drawingWidth,
  annotationDuration,
  setDrawingTool,
  setDrawingColor,
  setDrawingWidth,
  setAnnotationDuration,
  undoStroke,
  clearStrokes,
  strokes
}) {
  const [editingDur, setEditingDur] = useState6(false);
  const [durDraft, setDurDraft] = useState6("");
  const durInputRef = useRef9(null);
  const commitDur = useCallback11(() => {
    const val = parseFloat(durDraft);
    if (!isNaN(val)) {
      setAnnotationDuration(Math.min(30, Math.max(0.25, val)));
    }
    setEditingDur(false);
  }, [durDraft, setAnnotationDuration]);
  const startEditDur = useCallback11(() => {
    setDurDraft(annotationDuration.toFixed(2));
    setEditingDur(true);
    requestAnimationFrame(() => {
      var _a;
      return (_a = durInputRef.current) == null ? void 0 : _a.select();
    });
  }, [annotationDuration]);
  return /* @__PURE__ */ jsxs11("div", { className: "flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-6", children: [
    /* @__PURE__ */ jsxs11("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx14("span", { className: "text-[9px] font-semibold uppercase tracking-wider", style: { color: "var(--kt-text-muted)" }, children: "Tool" }),
      /* @__PURE__ */ jsx14("div", { className: "flex gap-1 flex-wrap", children: DRAWING_TOOLS.map((t) => /* @__PURE__ */ jsx14(
        "button",
        {
          onClick: () => setDrawingTool(t.key),
          className: `px-3 py-1.5 rounded text-xs font-medium transition-colors ${drawingTool === t.key ? "kt-btn-accent" : "kt-btn-subtle"}`,
          children: t.label
        },
        t.key
      )) })
    ] }),
    /* @__PURE__ */ jsxs11("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx14("span", { className: "text-[9px] font-semibold uppercase tracking-wider", style: { color: "var(--kt-text-muted)" }, children: "Color" }),
      /* @__PURE__ */ jsx14("div", { className: "flex gap-1.5", children: COLORS.map((c) => /* @__PURE__ */ jsx14(
        "button",
        {
          onClick: () => setDrawingColor(c),
          className: "w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
          style: {
            background: c,
            borderColor: drawingColor === c ? "var(--kt-text-primary)" : "transparent",
            boxShadow: c === "#ffffff" ? "inset 0 0 0 1px var(--kt-border)" : void 0
          }
        },
        c
      )) })
    ] }),
    /* @__PURE__ */ jsxs11("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx14("span", { className: "text-[9px] font-semibold uppercase tracking-wider", style: { color: "var(--kt-text-muted)" }, children: "Width" }),
      /* @__PURE__ */ jsx14("div", { className: "flex gap-1 items-center", children: WIDTHS.map((w) => /* @__PURE__ */ jsx14(
        "button",
        {
          onClick: () => setDrawingWidth(w),
          className: `flex items-center justify-center w-8 h-7 rounded transition-colors ${drawingWidth === w ? "" : "kt-btn-subtle"}`,
          style: drawingWidth === w ? { background: "var(--kt-accent-subtle-bg)", boxShadow: "inset 0 0 0 1px var(--kt-accent)" } : void 0,
          children: /* @__PURE__ */ jsx14(
            "div",
            {
              className: "rounded-full",
              style: { background: "var(--kt-slider-thumb)", width: Math.min(w * 2, 20), height: Math.min(w / 2 + 2, 8) }
            }
          )
        },
        w
      )) })
    ] }),
    /* @__PURE__ */ jsxs11("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxs11("span", { className: "text-[9px] font-semibold uppercase tracking-wider", style: { color: "var(--kt-text-muted)" }, children: [
        "Duration: ",
        annotationDuration,
        "s"
      ] }),
      /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx14(
          "input",
          {
            type: "range",
            min: 0.5,
            max: 10,
            step: 0.5,
            value: annotationDuration,
            onChange: (e) => setAnnotationDuration(parseFloat(e.target.value)),
            className: "w-20 h-1.5 rounded-full appearance-none cursor-pointer",
            style: {
              background: "var(--kt-slider-track)",
              accentColor: "var(--kt-accent)"
            }
          }
        ),
        editingDur ? /* @__PURE__ */ jsx14(
          "input",
          {
            ref: durInputRef,
            type: "number",
            min: 0.25,
            max: 30,
            step: 0.25,
            value: durDraft,
            onChange: (e) => setDurDraft(e.target.value),
            onBlur: commitDur,
            onKeyDown: (e) => {
              if (e.key === "Enter") commitDur();
              if (e.key === "Escape") setEditingDur(false);
            },
            className: "w-14 h-6 px-1 rounded text-xs tabular-nums text-center border",
            style: {
              color: "var(--kt-text-primary)",
              background: "var(--kt-bg-input)",
              borderColor: "var(--kt-accent)",
              outline: "none"
            },
            autoFocus: true
          }
        ) : /* @__PURE__ */ jsxs11(
          "button",
          {
            onClick: startEditDur,
            className: "text-xs tabular-nums cursor-text hover:underline min-w-[28px] text-left",
            style: { color: "var(--kt-text-secondary)" },
            title: "Click to edit",
            children: [
              annotationDuration.toFixed(1),
              "s"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs11("div", { className: "flex flex-col gap-1 md:ml-auto", children: [
      /* @__PURE__ */ jsx14("span", { className: "text-[9px] font-semibold uppercase tracking-wider", style: { color: "var(--kt-text-muted)" }, children: "Actions" }),
      /* @__PURE__ */ jsxs11("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsx14(
          "button",
          {
            onClick: undoStroke,
            disabled: strokes.length === 0,
            className: "px-3 py-1.5 rounded text-xs font-medium kt-btn-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors",
            children: "Undo"
          }
        ),
        /* @__PURE__ */ jsx14(
          "button",
          {
            onClick: clearStrokes,
            disabled: strokes.length === 0,
            className: "px-3 py-1.5 rounded text-xs font-medium kt-btn-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors",
            style: { color: "var(--kt-danger)" },
            children: "Clear"
          }
        )
      ] })
    ] })
  ] });
}
var SHAPE_STYLES = [
  { key: "simple", label: "Simple" },
  { key: "note", label: "Note" },
  { key: "sticky", label: "Sticky" },
  { key: "outline", label: "Outline" },
  { key: "neon", label: "Neon" }
];
function ShapeTools({
  shapeTool,
  shapeStyle,
  shapeColor,
  shapeFillColor,
  shapeStrokeWidth,
  shapeText,
  shapeFontSize,
  shapeDuration,
  shapes,
  selectedShapeId,
  setShapeTool,
  setShapeStyle,
  setShapeColor,
  setShapeFillColor,
  setShapeStrokeWidth,
  setShapeText,
  setShapeFontSize,
  setShapeDuration,
  addShape,
  removeShape,
  clearShapes
}) {
  const [editingDur, setEditingDur] = useState6(false);
  const [durDraft, setDurDraft] = useState6("");
  const durInputRef = useRef9(null);
  const commitDur = useCallback11(() => {
    const val = parseFloat(durDraft);
    if (!isNaN(val)) {
      setShapeDuration(Math.min(30, Math.max(0.25, val)));
    }
    setEditingDur(false);
  }, [durDraft, setShapeDuration]);
  const startEditDur = useCallback11(() => {
    setDurDraft(shapeDuration.toFixed(2));
    setEditingDur(true);
    requestAnimationFrame(() => {
      var _a;
      return (_a = durInputRef.current) == null ? void 0 : _a.select();
    });
  }, [shapeDuration]);
  const handleAddShape = () => {
    addShape({
      type: shapeTool,
      style: shapeStyle,
      x: 0.5,
      y: 0.5,
      width: 0.3,
      height: shapeTool === "text" ? 0.15 : 0.2,
      text: shapeTool === "text" ? shapeText : "",
      color: shapeColor,
      fillColor: shapeFillColor,
      strokeWidth: shapeStrokeWidth,
      fontSize: shapeFontSize
    });
  };
  return /* @__PURE__ */ jsxs11("div", { className: "flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-6", children: [
    /* @__PURE__ */ jsxs11("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx14("span", { className: "text-[9px] font-semibold uppercase tracking-wider", style: { color: "var(--kt-text-muted)" }, children: "Shape" }),
      /* @__PURE__ */ jsx14("div", { className: "flex gap-1 flex-wrap", children: SHAPE_TOOLS.map((t) => /* @__PURE__ */ jsx14(
        "button",
        {
          onClick: () => setShapeTool(t.key),
          className: `px-3 py-1.5 rounded text-xs font-medium transition-colors ${shapeTool === t.key ? "kt-btn-accent" : "kt-btn-subtle"}`,
          children: t.label
        },
        t.key
      )) })
    ] }),
    /* @__PURE__ */ jsxs11("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx14("span", { className: "text-[9px] font-semibold uppercase tracking-wider", style: { color: "var(--kt-text-muted)" }, children: "Style" }),
      /* @__PURE__ */ jsx14("div", { className: "flex gap-1 flex-wrap", children: SHAPE_STYLES.map((s) => /* @__PURE__ */ jsx14(
        "button",
        {
          onClick: () => setShapeStyle(s.key),
          className: `px-3 py-1.5 rounded text-xs font-medium transition-colors ${shapeStyle === s.key ? "kt-btn-accent" : "kt-btn-subtle"}`,
          children: s.label
        },
        s.key
      )) })
    ] }),
    /* @__PURE__ */ jsxs11("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx14("span", { className: "text-[9px] font-semibold uppercase tracking-wider", style: { color: "var(--kt-text-muted)" }, children: "Stroke" }),
      /* @__PURE__ */ jsx14("div", { className: "flex gap-1.5", children: COLORS.map((c) => /* @__PURE__ */ jsx14(
        "button",
        {
          onClick: () => setShapeColor(c),
          className: "w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
          style: {
            background: c,
            borderColor: shapeColor === c ? "var(--kt-text-primary)" : "transparent",
            boxShadow: c === "#ffffff" ? "inset 0 0 0 1px var(--kt-border)" : void 0
          }
        },
        c
      )) })
    ] }),
    /* @__PURE__ */ jsxs11("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx14("span", { className: "text-[9px] font-semibold uppercase tracking-wider", style: { color: "var(--kt-text-muted)" }, children: "Fill" }),
      /* @__PURE__ */ jsxs11("div", { className: "flex gap-1.5 items-center", children: [
        /* @__PURE__ */ jsx14(
          "button",
          {
            onClick: () => setShapeFillColor("transparent"),
            className: `px-2 py-1 rounded text-[10px] font-medium transition-colors ${shapeFillColor === "transparent" ? "kt-btn-accent" : "kt-btn-subtle"}`,
            children: "None"
          }
        ),
        COLORS.map((c) => /* @__PURE__ */ jsx14(
          "button",
          {
            onClick: () => setShapeFillColor(c),
            className: "w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
            style: {
              background: c,
              borderColor: shapeFillColor === c ? "var(--kt-text-primary)" : "transparent",
              boxShadow: c === "#ffffff" ? "inset 0 0 0 1px var(--kt-border)" : void 0
            }
          },
          c
        ))
      ] })
    ] }),
    /* @__PURE__ */ jsxs11("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx14("span", { className: "text-[9px] font-semibold uppercase tracking-wider", style: { color: "var(--kt-text-muted)" }, children: "Width" }),
      /* @__PURE__ */ jsx14("div", { className: "flex gap-1 items-center", children: WIDTHS.map((w) => /* @__PURE__ */ jsx14(
        "button",
        {
          onClick: () => setShapeStrokeWidth(w),
          className: `flex items-center justify-center w-8 h-7 rounded transition-colors ${shapeStrokeWidth === w ? "" : "kt-btn-subtle"}`,
          style: shapeStrokeWidth === w ? { background: "var(--kt-accent-subtle-bg)", boxShadow: "inset 0 0 0 1px var(--kt-accent)" } : void 0,
          children: /* @__PURE__ */ jsx14(
            "div",
            {
              className: "rounded-full",
              style: { background: "var(--kt-slider-thumb)", width: Math.min(w * 2, 20), height: Math.min(w / 2 + 2, 8) }
            }
          )
        },
        w
      )) })
    ] }),
    shapeTool === "text" && /* @__PURE__ */ jsxs11(Fragment4, { children: [
      /* @__PURE__ */ jsxs11("div", { className: "flex flex-col gap-1", children: [
        /* @__PURE__ */ jsx14("span", { className: "text-[9px] font-semibold uppercase tracking-wider", style: { color: "var(--kt-text-muted)" }, children: "Text" }),
        /* @__PURE__ */ jsx14(
          "input",
          {
            type: "text",
            value: shapeText,
            onChange: (e) => setShapeText(e.target.value),
            className: "px-2 py-1 rounded text-xs border",
            style: {
              background: "var(--kt-bg-surface)",
              borderColor: "var(--kt-border)",
              color: "var(--kt-text-primary)",
              minWidth: 100
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxs11("div", { className: "flex flex-col gap-1", children: [
        /* @__PURE__ */ jsxs11("span", { className: "text-[9px] font-semibold uppercase tracking-wider", style: { color: "var(--kt-text-muted)" }, children: [
          "Font: ",
          shapeFontSize,
          "px"
        ] }),
        /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx14(
            "input",
            {
              type: "range",
              min: 12,
              max: 120,
              step: 2,
              value: shapeFontSize,
              onChange: (e) => setShapeFontSize(parseInt(e.target.value, 10)),
              className: "w-20 h-1.5 rounded-full appearance-none cursor-pointer",
              style: {
                background: "var(--kt-slider-track)",
                accentColor: "var(--kt-accent)"
              }
            }
          ),
          /* @__PURE__ */ jsxs11("span", { className: "text-xs tabular-nums", style: { color: "var(--kt-text-secondary)", minWidth: 28 }, children: [
            shapeFontSize,
            "px"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs11("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxs11("span", { className: "text-[9px] font-semibold uppercase tracking-wider", style: { color: "var(--kt-text-muted)" }, children: [
        "Duration: ",
        shapeDuration,
        "s"
      ] }),
      /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx14(
          "input",
          {
            type: "range",
            min: 0.5,
            max: 10,
            step: 0.5,
            value: shapeDuration,
            onChange: (e) => setShapeDuration(parseFloat(e.target.value)),
            className: "w-20 h-1.5 rounded-full appearance-none cursor-pointer",
            style: {
              background: "var(--kt-slider-track)",
              accentColor: "var(--kt-accent)"
            }
          }
        ),
        editingDur ? /* @__PURE__ */ jsx14(
          "input",
          {
            ref: durInputRef,
            type: "number",
            min: 0.25,
            max: 30,
            step: 0.25,
            value: durDraft,
            onChange: (e) => setDurDraft(e.target.value),
            onBlur: commitDur,
            onKeyDown: (e) => {
              if (e.key === "Enter") commitDur();
              if (e.key === "Escape") setEditingDur(false);
            },
            className: "w-14 h-6 px-1 rounded text-xs tabular-nums text-center border",
            style: {
              color: "var(--kt-text-primary)",
              background: "var(--kt-bg-input)",
              borderColor: "var(--kt-accent)",
              outline: "none"
            },
            autoFocus: true
          }
        ) : /* @__PURE__ */ jsxs11(
          "button",
          {
            onClick: startEditDur,
            className: "text-xs tabular-nums cursor-text hover:underline min-w-[28px] text-left",
            style: { color: "var(--kt-text-secondary)" },
            title: "Click to edit",
            children: [
              shapeDuration.toFixed(1),
              "s"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs11("div", { className: "flex flex-col gap-1 md:ml-auto", children: [
      /* @__PURE__ */ jsx14("span", { className: "text-[9px] font-semibold uppercase tracking-wider", style: { color: "var(--kt-text-muted)" }, children: "Actions" }),
      /* @__PURE__ */ jsxs11("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsx14(
          "button",
          {
            onClick: handleAddShape,
            className: "px-3 py-1.5 rounded text-xs font-medium kt-btn-accent transition-colors",
            children: "+ Add"
          }
        ),
        selectedShapeId && /* @__PURE__ */ jsx14(
          "button",
          {
            onClick: () => removeShape(selectedShapeId),
            className: "px-3 py-1.5 rounded text-xs font-medium kt-btn-subtle transition-colors",
            style: { color: "var(--kt-danger)" },
            children: "Delete"
          }
        ),
        /* @__PURE__ */ jsx14(
          "button",
          {
            onClick: clearShapes,
            disabled: shapes.length === 0,
            className: "px-3 py-1.5 rounded text-xs font-medium kt-btn-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors",
            style: { color: "var(--kt-danger)" },
            children: "Clear"
          }
        )
      ] })
    ] })
  ] });
}

// components/editor/panels/StickerPanel.tsx
import { useRef as useRef10, useState as useState7, useCallback as useCallback12 } from "react";
import { jsx as jsx15, jsxs as jsxs12 } from "react/jsx-runtime";
var STICKER_GROUPS = [
  {
    label: "Reactions",
    emojis: ["\u{1F600}", "\u{1F602}", "\u{1F60D}", "\u{1F970}", "\u{1F60E}", "\u{1F929}", "\u{1F631}", "\u{1F914}", "\u{1F634}", "\u{1F973}"]
  },
  {
    label: "Symbols",
    emojis: ["\u2764\uFE0F", "\u{1F4AF}", "\u{1F525}", "\u2B50", "\u2728", "\u{1F4AB}", "\u{1F389}", "\u{1F38A}", "\u{1F44D}", "\u{1F44E}"]
  },
  {
    label: "Nature",
    emojis: ["\u{1F31F}", "\u{1F308}", "\u2600\uFE0F", "\u{1F319}", "\u26A1", "\u2744\uFE0F", "\u{1F338}", "\u{1F340}", "\u{1F98B}", "\u{1F43E}"]
  },
  {
    label: "Objects",
    emojis: ["\u{1F3AC}", "\u{1F4F8}", "\u{1F3B5}", "\u{1F3AE}", "\u{1F48E}", "\u{1F3C6}", "\u{1F3AF}", "\u{1F680}", "\u{1F4A1}", "\u{1F511}"]
  }
];
function StickerPanel() {
  const addStickerOverlay = useEditorStore((s) => s.addStickerOverlay);
  const overlays = useEditorStore((s) => s.overlays);
  const removeOverlay = useEditorStore((s) => s.removeOverlay);
  const stickerDuration = useEditorStore((s) => s.stickerDuration);
  const setStickerDuration = useEditorStore((s) => s.setStickerDuration);
  const imageInputRef = useRef10(null);
  const durationInputRef = useRef10(null);
  const [editingDuration, setEditingDuration] = useState7(false);
  const [durationDraft, setDurationDraft] = useState7("");
  const stickerOverlays = overlays.filter((o) => o.type === "sticker");
  const commitDuration = useCallback12(() => {
    const val = parseFloat(durationDraft);
    if (!isNaN(val)) {
      setStickerDuration(Math.min(30, Math.max(0.25, val)));
    }
    setEditingDuration(false);
  }, [durationDraft, setStickerDuration]);
  const startEditing = useCallback12(() => {
    setDurationDraft(stickerDuration.toFixed(2));
    setEditingDuration(true);
    requestAnimationFrame(() => {
      var _a;
      return (_a = durationInputRef.current) == null ? void 0 : _a.select();
    });
  }, [stickerDuration]);
  const handleAddEmoji = (emoji) => {
    addStickerOverlay({ emoji, x: 0.5, y: 0.5, scale: 1 });
  };
  const handleImageUpload = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addStickerOverlay({
        emoji: "",
        imageUrl: reader.result,
        x: 0.5,
        y: 0.5,
        scale: 1
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  return /* @__PURE__ */ jsx15(
    "div",
    {
      className: "shrink-0 border-t px-3 md:px-4 py-3 overflow-y-auto max-h-[200px]",
      style: { borderColor: "var(--kt-border)", background: "var(--kt-bg-panel)" },
      children: /* @__PURE__ */ jsxs12("div", { className: "flex gap-4 h-full", children: [
        /* @__PURE__ */ jsxs12("div", { className: "flex-1 min-w-0 overflow-y-auto", children: [
          /* @__PURE__ */ jsxs12("div", { className: "mb-2", children: [
            /* @__PURE__ */ jsxs12(
              "button",
              {
                onClick: () => {
                  var _a;
                  return (_a = imageInputRef.current) == null ? void 0 : _a.click();
                },
                className: "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium kt-btn-subtle border transition-colors",
                style: { borderColor: "var(--kt-border-input)" },
                children: [
                  /* @__PURE__ */ jsx15("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", strokeWidth: 1.75, viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx15("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" }) }),
                  "Upload image"
                ]
              }
            ),
            /* @__PURE__ */ jsx15(
              "input",
              {
                ref: imageInputRef,
                type: "file",
                accept: "image/*",
                className: "hidden",
                onChange: handleImageUpload
              }
            )
          ] }),
          /* @__PURE__ */ jsxs12("div", { className: "mb-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx15("span", { className: "text-[10px] font-semibold uppercase tracking-wider shrink-0", style: { color: "var(--kt-text-muted)" }, children: "Duration" }),
            /* @__PURE__ */ jsx15(
              "input",
              {
                type: "range",
                min: 0.25,
                max: 10,
                step: 0.25,
                value: stickerDuration,
                onChange: (e) => setStickerDuration(parseFloat(e.target.value)),
                className: "w-16 h-1.5 rounded-full appearance-none cursor-pointer",
                style: {
                  background: "var(--kt-slider-track)",
                  accentColor: "var(--kt-accent)"
                }
              }
            ),
            editingDuration ? /* @__PURE__ */ jsx15(
              "input",
              {
                ref: durationInputRef,
                type: "number",
                min: 0.25,
                max: 30,
                step: 0.25,
                value: durationDraft,
                onChange: (e) => setDurationDraft(e.target.value),
                onBlur: commitDuration,
                onKeyDown: (e) => {
                  if (e.key === "Enter") commitDuration();
                  if (e.key === "Escape") setEditingDuration(false);
                },
                className: "w-14 h-6 px-1 rounded text-xs tabular-nums text-center border",
                style: {
                  color: "var(--kt-text-primary)",
                  background: "var(--kt-bg-input)",
                  borderColor: "var(--kt-accent)",
                  outline: "none"
                },
                autoFocus: true
              }
            ) : /* @__PURE__ */ jsxs12(
              "button",
              {
                onClick: startEditing,
                className: "text-xs tabular-nums cursor-text hover:underline min-w-[28px] text-left",
                style: { color: "var(--kt-text-secondary)" },
                title: "Click to edit",
                children: [
                  stickerDuration.toFixed(1),
                  "s"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx15("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1", children: STICKER_GROUPS.map((group) => /* @__PURE__ */ jsxs12("div", { className: "flex items-center shrink-0 gap-1", children: [
            /* @__PURE__ */ jsxs12("span", { className: "text-[10px] font-semibold uppercase tracking-wider shrink-0", style: { color: "var(--kt-text-faint)" }, children: [
              group.label,
              ":"
            ] }),
            /* @__PURE__ */ jsx15("div", { className: "flex gap-0.5", children: group.emojis.map((emoji) => /* @__PURE__ */ jsx15(
              "button",
              {
                onClick: () => handleAddEmoji(emoji),
                className: "w-9 h-9 flex items-center justify-center rounded kt-emoji-btn transition-colors text-xl",
                title: `Add ${emoji}`,
                children: emoji
              },
              emoji
            )) })
          ] }, group.label)) })
        ] }),
        /* @__PURE__ */ jsxs12("div", { className: "hidden md:flex w-36 shrink-0 flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxs12("span", { className: "text-[10px] font-semibold uppercase tracking-wider", style: { color: "var(--kt-text-muted)" }, children: [
            "Active (",
            stickerOverlays.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxs12("div", { className: "flex flex-col gap-1 overflow-y-auto", children: [
            stickerOverlays.length === 0 && /* @__PURE__ */ jsx15("span", { className: "text-[11px]", style: { color: "var(--kt-text-faint)" }, children: "Click to add stickers" }),
            stickerOverlays.map((o) => {
              if (o.type !== "sticker") return null;
              return /* @__PURE__ */ jsxs12(
                "div",
                {
                  className: "flex items-center justify-between px-2 py-1 rounded",
                  style: { background: "var(--kt-bg-subtle)" },
                  children: [
                    o.imageUrl ? /* @__PURE__ */ jsx15("img", { src: o.imageUrl, alt: "", className: "w-6 h-6 object-cover rounded" }) : /* @__PURE__ */ jsx15("span", { className: "text-lg", children: o.emoji }),
                    /* @__PURE__ */ jsx15(
                      "button",
                      {
                        onClick: () => removeOverlay(o.id),
                        className: "transition-colors",
                        style: { color: "var(--kt-text-faint)" },
                        children: /* @__PURE__ */ jsx15("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx15("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) })
                      }
                    )
                  ]
                },
                o.id
              );
            })
          ] })
        ] })
      ] })
    }
  );
}

// components/editor/panels/VoiceRecorder.tsx
import { useState as useState8, useRef as useRef11, useCallback as useCallback13, useEffect as useEffect8 } from "react";
import { useShallow as useShallow3 } from "zustand/react/shallow";
import { Fragment as Fragment5, jsx as jsx16, jsxs as jsxs13 } from "react/jsx-runtime";
function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState8(false);
  const [recordingDuration, setRecordingDuration] = useState8(0);
  const mediaRecorderRef = useRef11(null);
  const chunksRef = useRef11([]);
  const timerRef = useRef11(null);
  const streamRef = useRef11(null);
  const recordingDurationRef = useRef11(0);
  const overlays = useEditorStore(useShallow3((s) => s.overlays.filter((o) => o.type === "voice")));
  const addVoiceOverlay = useEditorStore((s) => s.addVoiceOverlay);
  const removeOverlay = useEditorStore((s) => s.removeOverlay);
  const updateOverlay = useEditorStore((s) => s.updateOverlay);
  const selectedOverlayId = useEditorStore((s) => s.selectedOverlayId);
  const selectOverlay = useEditorStore((s) => s.selectOverlay);
  const duration = useEditorStore((s) => s.duration);
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const setPlaybackRate = useEditorStore((s) => s.setPlaybackRate);
  useEffect8(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);
  const startRecording = useCallback13(async () => {
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
        const duration2 = recordingDurationRef.current;
        addVoiceOverlay({ audioUrl: url, duration: duration2 });
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };
      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);
      recordingDurationRef.current = 0;
      timerRef.current = setInterval(() => {
        recordingDurationRef.current += 1;
        setRecordingDuration(recordingDurationRef.current);
      }, 1e3);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  }, [addVoiceOverlay]);
  const stopRecording = useCallback13(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setPlaybackRate(1);
  }, [setPlaybackRate]);
  const formatTime2 = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  return /* @__PURE__ */ jsxs13("div", { className: "flex flex-col gap-3 p-3", children: [
    /* @__PURE__ */ jsx16("p", { className: "text-xs font-medium", style: { color: "var(--kt-text-secondary)" }, children: "Voice Comment" }),
    /* @__PURE__ */ jsx16(
      "button",
      {
        onClick: isRecording ? stopRecording : startRecording,
        className: "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
        style: {
          background: isRecording ? "var(--kt-accent)" : "var(--kt-bg-subtle-hover)",
          color: isRecording ? "#fff" : "var(--kt-text-primary)"
        },
        children: isRecording ? /* @__PURE__ */ jsxs13(Fragment5, { children: [
          /* @__PURE__ */ jsx16("span", { className: "w-2.5 h-2.5 rounded-full bg-white animate-pulse" }),
          "Stop Recording (",
          formatTime2(recordingDuration),
          ")"
        ] }) : /* @__PURE__ */ jsxs13(Fragment5, { children: [
          /* @__PURE__ */ jsx16("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx16("path", { fillRule: "evenodd", d: "M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z", clipRule: "evenodd" }) }),
          "Start Recording"
        ] })
      }
    ),
    overlays.length > 0 && /* @__PURE__ */ jsxs13("div", { className: "flex flex-col gap-1.5 mt-1", children: [
      /* @__PURE__ */ jsxs13("p", { className: "text-[10px] font-medium uppercase tracking-wider", style: { color: "var(--kt-text-muted)" }, children: [
        "Recorded (",
        overlays.length,
        ")"
      ] }),
      overlays.map((overlay) => {
        if (overlay.type !== "voice") return null;
        const isSelected = overlay.id === selectedOverlayId;
        const voiceDuration = overlay.endTime - overlay.startTime;
        return /* @__PURE__ */ jsxs13("div", { children: [
          /* @__PURE__ */ jsxs13(
            "div",
            {
              onClick: () => selectOverlay(isSelected ? null : overlay.id),
              className: "flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-xs",
              style: {
                background: isSelected ? "var(--kt-bg-subtle-hover)" : "transparent",
                color: "var(--kt-text-primary)"
              },
              children: [
                /* @__PURE__ */ jsx16("svg", { className: "w-4 h-4 shrink-0", fill: "currentColor", viewBox: "0 0 20 20", style: { color: "var(--kt-accent)" }, children: /* @__PURE__ */ jsx16("path", { fillRule: "evenodd", d: "M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z", clipRule: "evenodd" }) }),
                /* @__PURE__ */ jsxs13("span", { className: "flex-1 truncate", children: [
                  "Voice ",
                  formatTime2(voiceDuration)
                ] }),
                /* @__PURE__ */ jsx16(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      removeOverlay(overlay.id);
                    },
                    className: "p-1 rounded hover:opacity-70 transition-opacity",
                    style: { color: "var(--kt-text-muted)" },
                    children: /* @__PURE__ */ jsx16("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx16("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }) })
                  }
                )
              ]
            }
          ),
          isSelected && /* @__PURE__ */ jsxs13("div", { className: "flex gap-2 mt-1.5 px-2.5", children: [
            /* @__PURE__ */ jsxs13("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx16("label", { className: "text-[10px] block mb-0.5", style: { color: "var(--kt-text-muted)" }, children: "Start" }),
              /* @__PURE__ */ jsx16(
                "input",
                {
                  type: "number",
                  min: 0,
                  max: duration,
                  step: 0.1,
                  value: Math.round(overlay.startTime * 10) / 10,
                  onChange: (e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0 && val < overlay.endTime) {
                      updateOverlay(overlay.id, { startTime: val });
                    }
                  },
                  className: "w-full px-2 py-1 rounded text-xs",
                  style: {
                    background: "var(--kt-bg-subtle)",
                    color: "var(--kt-text-primary)",
                    border: "1px solid var(--kt-border-color, transparent)"
                  }
                }
              )
            ] }),
            /* @__PURE__ */ jsxs13("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx16("label", { className: "text-[10px] block mb-0.5", style: { color: "var(--kt-text-muted)" }, children: "End" }),
              /* @__PURE__ */ jsx16(
                "input",
                {
                  type: "number",
                  min: 0,
                  max: duration,
                  step: 0.1,
                  value: Math.round(overlay.endTime * 10) / 10,
                  onChange: (e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val > overlay.startTime && val <= duration) {
                      updateOverlay(overlay.id, { endTime: val });
                    }
                  },
                  className: "w-full px-2 py-1 rounded text-xs",
                  style: {
                    background: "var(--kt-bg-subtle)",
                    color: "var(--kt-text-primary)",
                    border: "1px solid var(--kt-border-color, transparent)"
                  }
                }
              )
            ] })
          ] })
        ] }, overlay.id);
      })
    ] })
  ] });
}

// hooks/useKeyboardShortcuts.ts
import { useEffect as useEffect9 } from "react";
function useKeyboardShortcuts() {
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const setZoomFn = useEditorStore((s) => s.setZoom);
  const splitClipAt = useEditorStore((s) => s.splitClipAt);
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const removeClip = useEditorStore((s) => s.removeClip);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const captureHistory = useEditorStore((s) => s.captureHistory);
  const setPlaybackRate = useEditorStore((s) => s.setPlaybackRate);
  useEffect9(() => {
    const handler = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const { currentTime, fps, duration, zoom, playbackRate } = useEditorStore.getState();
      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlayAction();
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
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            setZoomFn(zoom * 1.25);
          }
          break;
        case "-":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            setZoomFn(zoom / 1.25);
          }
          break;
        case "z":
        case "Z":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            if (e.shiftKey) redo();
            else undo();
          }
          break;
        case "s":
        case "S":
          if (selectedClipId) {
            e.preventDefault();
            captureHistory();
            splitClipAt(selectedClipId, currentTime);
          }
          break;
        case "Delete":
        case "Backspace":
          if (selectedClipId) {
            e.preventDefault();
            captureHistory();
            removeClip(selectedClipId);
          }
          break;
        case "[":
          e.preventDefault();
          setPlaybackRate(Math.max(0, playbackRate - 0.25));
          break;
        case "]":
          e.preventDefault();
          setPlaybackRate(Math.min(2, playbackRate + 0.25));
          break;
        case "0":
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            setPlaybackRate(0);
          }
          break;
        case "1":
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            const { freezeOnOverlay, setFreezeOnOverlay } = useEditorStore.getState();
            setFreezeOnOverlay(!freezeOnOverlay);
          }
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCurrentTime, setZoomFn, splitClipAt, selectedClipId, removeClip, undo, redo, captureHistory]);
}

// components/editor/Editor.tsx
import { useShallow as useShallow4 } from "zustand/react/shallow";
import { Fragment as Fragment6, jsx as jsx17, jsxs as jsxs14 } from "react/jsx-runtime";
function Editor() {
  const [activeTool, setActiveTool] = useState9("trim");
  const setCropToolActive = useEditorStore((s) => s.setCropToolActive);
  const { status: exportStatus, progress: exportProgress, outputUrl } = useEditorStore(
    useShallow4((s) => ({ status: s.status, progress: s.progress, outputUrl: s.outputUrl }))
  );
  const resetExport = useEditorStore((s) => s.resetExport);
  const isExporting = exportStatus === "preparing" || exportStatus === "encoding";
  const isExportDone = exportStatus === "done" && !!outputUrl;
  const showOverlay = isExporting || isExportDone;
  const { importFiles } = useVideoImport();
  const { downloadExport, cancelExport } = useExport();
  useKeyboardShortcuts();
  const handleToolChange = useCallback14((tool) => {
    setActiveTool(tool);
    setCropToolActive(tool === "crop");
  }, [setCropToolActive]);
  const onDragOver = useCallback14((e) => {
    e.preventDefault();
  }, []);
  const onDrop = useCallback14(
    (e) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("video/"));
      if (files.length > 0) importFiles(files);
    },
    [importFiles]
  );
  return /* @__PURE__ */ jsxs14(
    "div",
    {
      className: "relative flex flex-col w-full h-full overflow-hidden rounded-xl",
      style: { background: "var(--kt-bg-base)" },
      onDragOver,
      onDrop,
      children: [
        /* @__PURE__ */ jsx17(AnimatePresence, { children: showOverlay && /* @__PURE__ */ jsx17(
          motion3.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            className: "absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 backdrop-blur-sm rounded-xl",
            style: { background: "var(--kt-bg-overlay)" },
            children: isExportDone ? /* @__PURE__ */ jsxs14(Fragment6, { children: [
              /* @__PURE__ */ jsx17("div", { className: "w-10 h-10 flex items-center justify-center rounded-full", style: { background: "var(--kt-success-bg)" }, children: /* @__PURE__ */ jsx17("svg", { className: "w-5 h-5", style: { color: "var(--kt-success)" }, fill: "none", stroke: "currentColor", strokeWidth: 2.5, viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx17("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 13l4 4L19 7" }) }) }),
              /* @__PURE__ */ jsx17("p", { className: "text-sm font-semibold", style: { color: "var(--kt-text-primary)" }, children: "Export complete" }),
              /* @__PURE__ */ jsxs14("div", { className: "flex items-center gap-3 mt-1", children: [
                /* @__PURE__ */ jsx17(
                  "button",
                  {
                    onClick: () => {
                      downloadExport(outputUrl);
                      resetExport();
                    },
                    className: "px-5 h-9 rounded-lg text-sm font-semibold transition-colors cursor-pointer",
                    style: { background: "var(--kt-success-btn)", color: "var(--kt-text-primary)" },
                    children: "Download"
                  }
                ),
                /* @__PURE__ */ jsx17(
                  "button",
                  {
                    onClick: resetExport,
                    className: "kt-btn-cancel px-5 h-9 rounded-lg text-sm font-medium transition-colors",
                    children: "Cancel"
                  }
                )
              ] })
            ] }) : /* @__PURE__ */ jsxs14(Fragment6, { children: [
              /* @__PURE__ */ jsx17("p", { className: "text-sm font-semibold", style: { color: "var(--kt-text-primary)" }, children: "Exporting\u2026" }),
              /* @__PURE__ */ jsx17("div", { className: "w-64 h-1.5 rounded-full overflow-hidden", style: { background: "var(--kt-slider-track)" }, children: /* @__PURE__ */ jsx17(
                motion3.div,
                {
                  className: "h-full rounded-full",
                  style: { background: "var(--kt-accent)" },
                  animate: { width: `${exportProgress}%` },
                  transition: { duration: 0.3 }
                }
              ) }),
              /* @__PURE__ */ jsxs14("p", { className: "text-xs tabular-nums", style: { color: "var(--kt-text-tertiary)" }, children: [
                exportProgress,
                "%"
              ] }),
              /* @__PURE__ */ jsx17(
                "button",
                {
                  onClick: cancelExport,
                  className: "kt-btn-cancel mt-1 px-5 h-9 rounded-lg text-sm font-medium transition-colors",
                  children: "Cancel"
                }
              )
            ] })
          }
        ) }),
        /* @__PURE__ */ jsx17(TopBar, {}),
        /* @__PURE__ */ jsxs14("div", { className: "flex flex-1 overflow-hidden min-h-0 md:flex-row flex-col", children: [
          /* @__PURE__ */ jsx17("div", { className: "hidden md:flex", children: /* @__PURE__ */ jsx17(Sidebar, { activeTool, onToolChange: handleToolChange }) }),
          /* @__PURE__ */ jsxs14("div", { className: "flex flex-col flex-1 overflow-hidden min-w-0", children: [
            /* @__PURE__ */ jsx17(PreviewPanel, { activeTool }),
            /* @__PURE__ */ jsx17("div", { className: "flex md:hidden", children: /* @__PURE__ */ jsx17(Sidebar, { activeTool, onToolChange: handleToolChange, horizontal: true }) }),
            /* @__PURE__ */ jsxs14(AnimatePresence, { mode: "wait", initial: false, children: [
              activeTool === "trim" && /* @__PURE__ */ jsx17(
                motion3.div,
                {
                  initial: { opacity: 0, y: 8 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 8 },
                  transition: { duration: 0.15 },
                  children: /* @__PURE__ */ jsx17(TrimPanel, {})
                },
                "trim"
              ),
              activeTool === "finetune" && /* @__PURE__ */ jsx17(
                motion3.div,
                {
                  initial: { opacity: 0, y: 8 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 8 },
                  transition: { duration: 0.15 },
                  children: /* @__PURE__ */ jsx17(FinetunePanel, {})
                },
                "finetune"
              ),
              activeTool === "filter" && /* @__PURE__ */ jsx17(
                motion3.div,
                {
                  initial: { opacity: 0, y: 8 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 8 },
                  transition: { duration: 0.15 },
                  children: /* @__PURE__ */ jsx17(FilterPanel, {})
                },
                "filter"
              ),
              activeTool === "crop" && /* @__PURE__ */ jsx17(
                motion3.div,
                {
                  initial: { opacity: 0, y: 8 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 8 },
                  transition: { duration: 0.15 },
                  children: /* @__PURE__ */ jsx17(CropPanel, {})
                },
                "crop"
              ),
              activeTool === "resize" && /* @__PURE__ */ jsx17(
                motion3.div,
                {
                  initial: { opacity: 0, y: 8 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 8 },
                  transition: { duration: 0.15 },
                  children: /* @__PURE__ */ jsx17(ResizePanel, {})
                },
                "resize"
              ),
              activeTool === "annotate" && /* @__PURE__ */ jsx17(
                motion3.div,
                {
                  initial: { opacity: 0, y: 8 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 8 },
                  transition: { duration: 0.15 },
                  children: /* @__PURE__ */ jsx17(AnnotatePanel, {})
                },
                "annotate"
              ),
              activeTool === "sticker" && /* @__PURE__ */ jsx17(
                motion3.div,
                {
                  initial: { opacity: 0, y: 8 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 8 },
                  transition: { duration: 0.15 },
                  children: /* @__PURE__ */ jsx17(StickerPanel, {})
                },
                "sticker"
              ),
              activeTool === "voice" && /* @__PURE__ */ jsx17(
                motion3.div,
                {
                  initial: { opacity: 0, y: 8 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 8 },
                  transition: { duration: 0.15 },
                  children: /* @__PURE__ */ jsx17(VoiceRecorder, {})
                },
                "voice"
              )
            ] })
          ] })
        ] })
      ]
    }
  );
}

// lib/colorUtils.ts
function hexToRgb(hex) {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}
function luminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
function deriveAccentVars(hex, isDark) {
  const rgb = hexToRgb(hex);
  if (!rgb) return {};
  const [r, g, b] = rgb;
  const lum = luminance(r, g, b);
  const textColor = lum > 0.4 ? "#18181b" : "#ffffff";
  const factor = isDark ? 1.15 : 0.85;
  const clamp = (v) => Math.min(255, Math.max(0, Math.round(v)));
  const hoverHex = `#${[r, g, b].map((c) => clamp(c * factor).toString(16).padStart(2, "0")).join("")}`;
  return {
    "accent": hex,
    "accent-hover": hoverHex,
    "accent-text": textColor,
    "accent-subtle-bg": `rgba(${r}, ${g}, ${b}, ${isDark ? 0.15 : 0.12})`,
    "accent-subtle-border": `rgba(${r}, ${g}, ${b}, ${isDark ? 0.4 : 0.35})`,
    "accent-strong-border": `rgba(${r}, ${g}, ${b}, ${isDark ? 0.9 : 0.8})`
  };
}

// src/Kutlass.tsx
import { jsx as jsx18 } from "react/jsx-runtime";
function Kutlass({
  className,
  style,
  accent,
  colors,
  exportSettings,
  ffmpegPaths,
  onExportComplete
}) {
  const storeTheme = useEditorStore((s) => s.theme);
  const colorOverrides = useMemo(() => {
    const vars = {};
    if (accent) {
      const derived = deriveAccentVars(accent, storeTheme === "dark");
      for (const [k, v] of Object.entries(derived)) vars[`--kt-${k}`] = v;
    }
    if (colors) {
      for (const [k, v] of Object.entries(colors)) {
        if (v) vars[`--kt-${k}`] = v;
      }
    }
    return vars;
  }, [accent, colors, storeTheme]);
  useEffect10(() => {
    if (ffmpegPaths) setFFmpegPaths(ffmpegPaths);
  }, [ffmpegPaths]);
  useEffect10(() => {
    if (exportSettings) {
      useEditorStore.getState().updateExportSettings(exportSettings);
    }
  }, [exportSettings]);
  useEffect10(() => {
    if (!onExportComplete) return;
    return useEditorStore.subscribe((state, prev) => {
      if (state.status === "done" && prev.status !== "done" && state.outputUrl) {
        fetch(state.outputUrl).then((r) => r.blob()).then((blob) => onExportComplete(blob)).catch(console.error);
      }
    });
  }, [onExportComplete]);
  return /* @__PURE__ */ jsx18(
    "div",
    {
      className: `kutlass-editor ${className != null ? className : ""}`,
      style: __spreadValues(__spreadValues({ width: "100%", height: "100%" }, colorOverrides), style),
      children: /* @__PURE__ */ jsx18(Editor, {})
    }
  );
}
export {
  Kutlass,
  setFFmpegPaths
};
//# sourceMappingURL=index.mjs.map