"use client";

import type { VideoMetadata } from "./types";

export class ClipVideoDecoder {
  private video: HTMLVideoElement | null = null;
  private objectUrl: string | null = null;
  private loadedFile: File | null = null;
  private metadata: VideoMetadata | null = null;
  private _muted = false;
  private _audioBlocked = false;

  // Serialise seek operations so concurrent requestFrame calls don't race.
  private seekChain: Promise<void> = Promise.resolve();
  // Incrementing this number aborts all in-flight seeks (e.g. when playback starts).
  private seekGeneration = 0;

  async getMetadata(file: File): Promise<VideoMetadata> {
    if (this.metadata && this.loadedFile === file) return this.metadata;
    await this.ensureVideo(file);
    return this.metadata!;
  }

  requestFrame(file: File, timeSeconds: number): Promise<VideoFrame | null> {
    const gen = this.seekGeneration;
    const result = this.seekChain.then(async () => {
      // If startPlayback was called while we were queued, abort this seek.
      if (this.seekGeneration !== gen) return null;
      await this.ensureVideo(file);
      if (this.seekGeneration !== gen) return null;
      return this.capture(timeSeconds);
    });
    // Advance the chain even if this step errors so later requests still run.
    this.seekChain = result.then(() => {}, () => {});
    return result;
  }

  /** Capture current frame without seeking — used during live playback. */
  captureCurrentFrame(): VideoFrame | null {
    const video = this.video;
    if (!video) return null;
    return this.frameFromVideo(video, video.currentTime);
  }

  getVideoCurrentTime(): number {
    return this.video?.currentTime ?? 0;
  }

  /** Start native video playback. Aborts any in-flight frame seeks first. */
  async startPlayback(fromTime: number): Promise<void> {
    const video = this.video;
    if (!video) return;

    // Cancel all queued requestFrame seeks so they don't fire mid-playback.
    this.seekGeneration++;
    this.seekChain = Promise.resolve();

    video.muted = this._muted;
    video.currentTime = fromTime;
    try {
      await video.play();
    } catch {
      video.muted = true;
      try {
        await video.play();
        this._audioBlocked = true;
      } catch {
        // Playback completely blocked — nothing more we can do.
      }
    }
  }

  get audioBlocked(): boolean {
    return this._audioBlocked;
  }

  stopPlayback(): void {
    this.video?.pause();
  }

  setMuted(muted: boolean): void {
    this._muted = muted;
    if (this.video) this.video.muted = muted;
  }

  getMuted(): boolean {
    return this._muted;
  }

  private ensureVideo(file: File): Promise<void> {
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
          codec: "browser-native",
        };
        cleanup();
        resolve();
      };

      const onError = () => { cleanup(); reject(new Error(`Failed to load video: ${file.name}`)); };
      const cleanup = () => {
        video.removeEventListener("loadedmetadata", onMeta);
        video.removeEventListener("error", onError);
      };

      video.addEventListener("loadedmetadata", onMeta);
      video.addEventListener("error", onError);
    });
  }

  private capture(timeSeconds: number): Promise<VideoFrame | null> {
    const video = this.video;
    if (!video) return Promise.resolve(null);

    if (Math.abs(video.currentTime - timeSeconds) < 0.016) {
      return Promise.resolve(this.frameFromVideo(video, timeSeconds));
    }

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        video.removeEventListener("seeked", onSeeked);
        resolve(this.frameFromVideo(video, timeSeconds));
      }, 3000);

      const onSeeked = () => {
        clearTimeout(timer);
        resolve(this.frameFromVideo(video, timeSeconds));
      };

      video.addEventListener("seeked", onSeeked, { once: true });
      video.currentTime = timeSeconds;
    });
  }

  private frameFromVideo(video: HTMLVideoElement, timeSeconds: number): VideoFrame | null {
    try {
      return new VideoFrame(video, { timestamp: Math.round(timeSeconds * 1_000_000) });
    } catch {
      return this.frameFromCanvas(video, timeSeconds);
    }
  }

  private frameFromCanvas(video: HTMLVideoElement, timeSeconds: number): VideoFrame | null {
    try {
      const canvas = new OffscreenCanvas(video.videoWidth || 1280, video.videoHeight || 720);
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0);
      return new VideoFrame(canvas, { timestamp: Math.round(timeSeconds * 1_000_000) });
    } catch {
      return null;
    }
  }

  dispose(): void {
    this.video?.pause();
    this.video = null;
    if (this.objectUrl) { URL.revokeObjectURL(this.objectUrl); this.objectUrl = null; }
    this.metadata = null;
    this.loadedFile = null;
  }
}

const registry = new Map<string, ClipVideoDecoder>();

export function getDecoderForFile(file: File): ClipVideoDecoder {
  const key = `${file.name}::${file.size}::${file.lastModified}`;
  if (!registry.has(key)) registry.set(key, new ClipVideoDecoder());
  return registry.get(key)!;
}
