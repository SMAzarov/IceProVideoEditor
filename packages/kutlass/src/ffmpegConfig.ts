export interface FFmpegPaths {
  /** URL to ffmpeg-core.js (e.g. "/ffmpeg/ffmpeg-core.js") */
  coreJS: string;
  /** URL to ffmpeg-core.wasm (e.g. "/ffmpeg/ffmpeg-core.wasm") */
  coreWasm: string;
}

const config: FFmpegPaths = {
  coreJS: "/ffmpeg/ffmpeg-core.js",
  coreWasm: "/ffmpeg/ffmpeg-core.wasm",
};

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
export function setFFmpegPaths(paths: Partial<FFmpegPaths>) {
  Object.assign(config, paths);
}

export function getFFmpegPaths(): FFmpegPaths {
  return config;
}
