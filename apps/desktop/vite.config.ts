import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";
import path from "path";

const root = __dirname;

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron([
      {
        entry: path.resolve(root, "src/main.ts"),
        vite: {
          build: {
            outDir: path.resolve(root, "dist"),
            rollupOptions: {
              external: ["electron"],
            },
          },
        },
      },
      {
        entry: path.resolve(root, "src/preload.ts"),
        onstart(args) {
          args.reload();
        },
        vite: {
          build: {
            outDir: path.resolve(root, "dist"),
            rollupOptions: {
              external: ["electron"],
            },
          },
        },
      },
    ]),
    renderer(),
  ],
  root: path.resolve(root, "src/renderer"),
  base: "./",
  build: {
    outDir: path.resolve(root, "dist/renderer"),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(root, "src/renderer"),
    },
  },
  server: {
    port: 5173,
  },
});
