import React, { useEffect, useRef } from "react";
import { Kutlass, setFFmpegPaths } from "kutlass";

declare global {
  interface Window {
    electronAPI: {
      getFfmpegBasePath: () => Promise<string>;
      isPackaged: () => Promise<boolean>;
      getVersion: () => Promise<string>;
      openFile: () => Promise<string>;
      onOpenFile: (callback: (filePath: string) => void) => void;
    };
  }
}

export default function App() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Get FFmpeg paths from the main process via IPC
    window.electronAPI.getFfmpegBasePath().then((basePath: string) => {
      // Ensure trailing slash
      const normalizedPath = basePath.endsWith("/") ? basePath : `${basePath}/`;

      setFFmpegPaths({
        coreJS: `${normalizedPath}ffmpeg-core.js`,
        coreWasm: `${normalizedPath}ffmpeg-core.wasm`,
      });

      console.log("[Kutlass Desktop] FFmpeg paths set to:", normalizedPath);
    });
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Kutlass theme="dark" />
    </div>
  );
}
