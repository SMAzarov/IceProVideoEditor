import type { VideoMetadata } from "./types";
export declare class ClipVideoDecoder {
    private video;
    private objectUrl;
    private loadedFile;
    private metadata;
    private _muted;
    private _audioBlocked;
    private seekChain;
    private seekGeneration;
    getMetadata(file: File): Promise<VideoMetadata>;
    requestFrame(file: File, timeSeconds: number): Promise<VideoFrame | null>;
    /** Capture current frame without seeking — used during live playback. */
    captureCurrentFrame(): VideoFrame | null;
    getVideoCurrentTime(): number;
    /** Start native video playback. Aborts any in-flight frame seeks first. */
    startPlayback(fromTime: number): Promise<void>;
    get audioBlocked(): boolean;
    stopPlayback(): void;
    setMuted(muted: boolean): void;
    getMuted(): boolean;
    private ensureVideo;
    private capture;
    private frameFromVideo;
    private frameFromCanvas;
    dispose(): void;
}
export declare function getDecoderForFile(file: File): ClipVideoDecoder;
//# sourceMappingURL=VideoDecoder.d.ts.map