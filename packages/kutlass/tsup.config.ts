import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: false,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "framer-motion",
    "@ffmpeg/ffmpeg",
    "@ffmpeg/core",
    "@ffmpeg/util",
  ],
  banner: {
    // Preserve "use client" for Next.js consumers
    js: '"use client";',
  },
  esbuildOptions(options) {
    // Resolve the @/ path alias used throughout the codebase
    options.alias = {
      "@": ".",
    };
  },
});
