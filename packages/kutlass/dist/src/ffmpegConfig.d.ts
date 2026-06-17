export interface FFmpegPaths {
    /** URL to ffmpeg-core.js (e.g. "/ffmpeg/ffmpeg-core.js") */
    coreJS: string;
    /** URL to ffmpeg-core.wasm (e.g. "/ffmpeg/ffmpeg-core.wasm") */
    coreWasm: string;
}
/**
 * Configure where the FFmpeg WASM files are served from.
 * Must be called before rendering `<kutlassEditor />`.
 *
 * @example
 * ```ts
 * import { setFFmpegPaths } from "kutlass";
 * setFFmpegPaths({
 *   coreJS: "/vendor/ffmpeg-core.js",
 *   coreWasm: "/vendor/ffmpeg-core.wasm",
 * });
 * ```
 */
export declare function setFFmpegPaths(paths: Partial<FFmpegPaths>): void;
export declare function getFFmpegPaths(): FFmpegPaths;
//# sourceMappingURL=ffmpegConfig.d.ts.map