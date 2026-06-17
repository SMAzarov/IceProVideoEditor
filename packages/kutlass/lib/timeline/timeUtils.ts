/** Format seconds as MM:SS or HH:MM:SS */
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
}

/** Convert time (seconds) to pixels */
export function timeToPixels(time: number, zoom: number): number {
  return time * zoom;
}

/** Convert pixels to time (seconds) */
export function pixelsToTime(pixels: number, zoom: number): number {
  return pixels / zoom;
}

/** Snap time to nearest frame boundary */
export function snapToFrame(time: number, fps: number): number {
  return Math.round(time * fps) / fps;
}

/** Get frame number from time */
export function timeToFrame(time: number, fps: number): number {
  return Math.round(time * fps);
}

/** Get time from frame number */
export function frameToTime(frame: number, fps: number): number {
  return frame / fps;
}

/** Calculate ruler tick interval based on zoom */
export function getRulerTickInterval(zoom: number): { major: number; minor: number } {
  // zoom = pixels per second
  if (zoom >= 200) return { major: 1, minor: 0.5 };
  if (zoom >= 100) return { major: 2, minor: 1 };
  if (zoom >= 60) return { major: 5, minor: 1 };
  if (zoom >= 30) return { major: 10, minor: 5 };
  if (zoom >= 15) return { major: 30, minor: 10 };
  return { major: 60, minor: 30 };
}
