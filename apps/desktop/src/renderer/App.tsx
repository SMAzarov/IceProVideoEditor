import React, { useEffect, useRef } from "react";
import { Kutlass, setFFmpegPaths } from "kutlass";

export default function App() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // In production (packaged), FFmpeg files are in extraResources/ffmpeg
    // In development, they're in public/ffmpeg served by Vite
    const isPackaged = !("__vite_dev_server__" in window);

    if (isPackaged) {
      // In production, FFmpeg files are in the extraResources directory
      // The path is resolved relative to the app resources
      const basePath = "./ffmpeg/";
      setFFmpegPaths({
        coreJS: `${basePath}ffmpeg-core.js`,
        coreWasm: `${basePath}ffmpeg-core.wasm`,
      });
    } else {
      // In development, Vite serves public/ffmpeg from root
      setFFmpegPaths({
        coreJS: "/ffmpeg/ffmpeg-core.js",
        coreWasm: "/ffmpeg/ffmpeg-core.wasm",
      });
    }

    console.log("[Kutlass Desktop] FFmpeg paths configured");
  }, []);

  return (
    <div className="w-screen h-screen">
      <Kutlass theme="dark" />
    </div>
  );
}
