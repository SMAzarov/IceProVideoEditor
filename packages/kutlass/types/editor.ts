export type TrackType = "video" | "audio" | "text" | "effects";

export interface EffectParams {
  brightness: number; // -100 to 100, default 0
  contrast: number;   // -100 to 100, default 0
  saturation: number; // -100 to 100, default 0
  rotation: number;   // degrees, default 0
  cropX: number;      // 0-1, default 0
  cropY: number;      // 0-1, default 0
  cropW: number;      // 0-1, default 1
  cropH: number;      // 0-1, default 1
  opacity: number;    // 0-1, default 1
  speed: number;      // 0.25-4, default 1 (1 = normal speed)
}

// Text overlay placed on top of the video
export interface TextOverlay {
  id: string;
  type: "text";
  text: string;
  x: number;          // 0-1 normalized (center of text)
  y: number;          // 0-1 normalized
  fontSize: number;   // 12-120
  color: string;      // hex
  fontFamily: string;
  bold: boolean;
  startTime: number;  // seconds on timeline when this overlay appears
  endTime: number;    // seconds on timeline when this overlay disappears
}

// Emoji/sticker overlay
export interface StickerOverlay {
  id: string;
  type: "sticker";
  emoji: string;       // emoji character (empty string when imageUrl is set)
  imageUrl?: string;   // data-URL for user-uploaded image stickers
  x: number;           // 0-1 normalized
  y: number;           // 0-1 normalized
  scale: number;       // 1 = default size
  startTime: number;   // seconds on timeline when this overlay appears
  endTime: number;     // seconds on timeline when this overlay disappears
}

// Voice overlay (recorded audio comment)
export interface VoiceOverlay {
  id: string;
  type: "voice";
  audioUrl: string;       // blob URL from MediaRecorder
  startTime: number;      // seconds on timeline when this voice starts
  endTime: number;        // seconds on timeline when this voice ends
}

export type Overlay = TextOverlay | StickerOverlay | VoiceOverlay;

export const DEFAULT_EFFECTS: EffectParams = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  rotation: 0,
  cropX: 0,
  cropY: 0,
  cropW: 1,
  cropH: 1,
  opacity: 1,
  speed: 1,
};

export interface Clip {
  id: string;
  trackId: string;
  name: string;
  file: File;
  // Position in timeline (seconds)
  startTime: number;
  duration: number;
  // Trim points within source (seconds)
  trimIn: number;
  trimOut: number;
  // Source metadata
  sourceDuration: number;
  width: number;
  height: number;
  fps: number;
  // Thumbnails (base64 data URLs)
  thumbnails: string[];
}

export interface Track {
  id: string;
  type: TrackType;
  name: string;
  muted: boolean;
  locked: boolean;
}

export interface ExportSettings {
  format: "mp4" | "webm";
  resolution: "original" | "1080p" | "720p" | "480p";
  fps: 24 | 30 | 60;
  bitrate: number; // kbps
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  format: "mp4",
  resolution: "720p",
  fps: 30,
  bitrate: 4000,
};

export type ExportStatus = "idle" | "preparing" | "encoding" | "done" | "error";

/** A freeze segment — video pauses at a specific frame for a duration */
export interface FreezeSegment {
  id: string;
  startTime: number; // timeline time when freeze begins
  endTime: number;   // timeline time when freeze ends
}

/** A transition effect between two adjacent clips */
export interface Transition {
  id: string;
  type: "crossfade";
  duration: number; // seconds (0.1–1.0)
  clipAId: string;  // first clip (the one that ends at the transition point)
  clipBId: string;  // second clip (the one that starts at the transition point)
}

/** Shape annotation — rectangle, circle, or text drawn on the video */
export type ShapeType = "rectangle" | "circle" | "text";

export interface ShapeAnnotation {
  id: string;
  type: ShapeType;
  x: number;      // 0-1 normalized (center)
  y: number;      // 0-1 normalized (center)
  width: number;  // 0-1 normalized
  height: number; // 0-1 normalized
  text: string;
  color: string;       // stroke/text color
  fillColor: string;   // fill color (e.g. "transparent")
  strokeWidth: number;
  fontSize: number;    // font size in px (for text shapes)
  startTime: number;
  endTime: number;
}
