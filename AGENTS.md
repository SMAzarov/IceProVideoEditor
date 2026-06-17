# Kutlass — Agent Instructions

## Project overview

Kutlass is a fully client-side browser video editor shipped as an npm React component library (`kutlass`). All video processing runs in the browser — no server-side code exists in this project.

This is an Nx monorepo with two packages:

- **`packages/kutlass`** — the published library
- **`apps/demo`** — Next.js demo app that consumes the library

## Architecture

- **Entry point**: `packages/kutlass/src/index.ts` exports `<Kutlass />` and `setFFmpegPaths`
- **Editor shell**: `packages/kutlass/components/editor/Editor.tsx` — tool switching, export overlay, drag-and-drop
- **Preview**: `packages/kutlass/components/editor/preview/PreviewPanel.tsx` — canvas rendering, zoom, pan
- **Panels**: `packages/kutlass/components/editor/panels/` — TrimPanel, FinetunePanel, FilterPanel, CropPanel, ResizePanel, AnnotatePanel, StickerPanel
- **State**: Zustand store in `packages/kutlass/store/editorStore.ts`, slices in `packages/kutlass/store/slices/`
- **Video decoding**: `packages/kutlass/lib/webcodecs/VideoDecoder.ts` — WebCodecs via `<video>` element + `VideoFrame`
- **Frame rendering**: `packages/kutlass/lib/webcodecs/FrameRenderer.ts` — OffscreenCanvas 2D with CSS-equivalent filters
- **Export**: `packages/kutlass/lib/ffmpeg/exportPipeline.ts` — frame-by-frame canvas rendering → JPEG sequence → FFmpeg WASM encoding
- **FFmpeg**: `packages/kutlass/lib/ffmpeg/ffmpegClient.ts` — loads WASM from configurable paths (`packages/kutlass/src/ffmpegConfig.ts`)

## Key patterns

- **Zustand v5 without middleware** — use `useShallow` for array/object selectors
- **`usePlayback` hook** — RAF loop for live playback, subscription for paused renders, `trimScrub` for TrimPanel preview
- **`cropToolActive` flag** — when true, render full frame (for crop handle positioning); when false, render cropped result
- **History** — `store/slices/historySlice.ts` with `captureHistory()` called before mutations, `undo()`/`redo()` actions
- **Export cancellation** — `AbortController` at module level in `hooks/useExport.ts`, signal checked in frame loop

## Build

- `npm run build:lib` or `nx run kutlass:build` — tsup (ESM + CJS) + tsc (declarations) + Tailwind CLI (prebuilt CSS)
- `npm run dev` or `nx run kutlass-demo:dev` — Next.js demo app for local development
- `npm run build:app` or `nx run kutlass-demo:build` — Next.js demo app production build
- `npm run build` or `nx run-many -t build` — build all packages

## Rules

<!-- BEGIN:nextjs-agent-rules -->
The demo app uses Next.js 16. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any Next.js app code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

- The library source (`packages/kutlass/src/`, `components/`, `hooks/`, `lib/`, `store/`, `types/`) must remain framework-agnostic React. Do not introduce Next.js-specific APIs in library code.
- All components use `"use client"` — this is a client-only library.
- FFmpeg WASM paths are configurable via `setFFmpegPaths()` — never hardcode paths in library code.
- Consumers must set COOP/COEP/CORP headers for FFmpeg WASM to work.
- The Zustand store is a singleton — only one `<Kutlass />` instance per page is supported.
