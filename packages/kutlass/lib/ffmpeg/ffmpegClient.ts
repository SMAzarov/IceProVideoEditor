"use client";

import { getFFmpegPaths } from "@/src/ffmpegConfig";

let ffmpegInstance: import("@ffmpeg/ffmpeg").FFmpeg | null = null;
let initPromise: Promise<import("@ffmpeg/ffmpeg").FFmpeg> | null = null;

export async function getFFmpeg(): Promise<import("@ffmpeg/ffmpeg").FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ffmpegUtil = await import("@ffmpeg/util" as any);
    const toBlobURL: (url: string, mimeType: string) => Promise<string> = ffmpegUtil.toBlobURL;

    const ffmpeg = new FFmpeg();

    ffmpeg.on("log", ({ message }) => {
      console.log("[FFmpeg]", message);
    });

    const paths = getFFmpegPaths();
    await ffmpeg.load({
      coreURL: await toBlobURL(paths.coreJS, "text/javascript"),
      wasmURL: await toBlobURL(paths.coreWasm, "application/wasm"),
    });

    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  return initPromise;
}

export async function isFFmpegReady(): Promise<boolean> {
  try {
    await getFFmpeg();
    return true;
  } catch {
    return false;
  }
}
