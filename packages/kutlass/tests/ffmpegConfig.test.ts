import { describe, it, expect, beforeEach } from "vitest";
import { setFFmpegPaths, getFFmpegPaths } from "@/src/ffmpegConfig";

describe("ffmpegConfig", () => {
  beforeEach(() => {
    // Reset to defaults
    setFFmpegPaths({
      coreJS: "/ffmpeg/ffmpeg-core.js",
      coreWasm: "/ffmpeg/ffmpeg-core.wasm",
    });
  });

  it("returns default paths", () => {
    const paths = getFFmpegPaths();
    expect(paths.coreJS).toBe("/ffmpeg/ffmpeg-core.js");
    expect(paths.coreWasm).toBe("/ffmpeg/ffmpeg-core.wasm");
  });

  it("updates paths with setFFmpegPaths", () => {
    setFFmpegPaths({ coreJS: "/custom/core.js" });
    expect(getFFmpegPaths().coreJS).toBe("/custom/core.js");
    expect(getFFmpegPaths().coreWasm).toBe("/ffmpeg/ffmpeg-core.wasm");
  });

  it("updates both paths at once", () => {
    setFFmpegPaths({ coreJS: "/a.js", coreWasm: "/a.wasm" });
    const paths = getFFmpegPaths();
    expect(paths.coreJS).toBe("/a.js");
    expect(paths.coreWasm).toBe("/a.wasm");
  });
});
