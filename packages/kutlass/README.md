# Kutlass

A fully client-side browser video editor React component. All video processing — decoding, effects, cropping, annotations, and encoding — runs entirely in the browser using WebCodecs and FFmpeg WASM. No server required.

[Live Demo](https://kutlass.vercel.app/) | [GitHub](https://github.com/iamTMTY/Kutlass)

## Features

- Trim, crop, and resize video
- Brightness, contrast, saturation, rotation, and opacity adjustments
- Filter presets (Vivid, Warm, Cool, B&W, Fade, Dramatic, Film, Matte)
- Freehand annotations (pen and eraser)
- Text and sticker overlays
- Undo/redo with full history
- Zoom and pan preview
- Export to MP4 or WebM
- Drag-and-drop video import
- Light and dark themes
- Customizable accent color and full color token override

## Installation

```bash
npm install kutlass
```

### Peer dependencies

```bash
npm install react react-dom framer-motion @ffmpeg/ffmpeg @ffmpeg/core @ffmpeg/util
```

## Development

Этот проект — Nx монорепозиторий. Чтобы собрать и запустить demo-приложение локально из исходников:

### 1. Установите зависимости

```bash
npm install
```

### 2. Установите Nx (если ещё не установлен)

```bash
npm install -D nx
```

### 3. Соберите библиотеку `kutlass`

Перед запуском demo библиотека должна быть собрана, чтобы пакет `kutlass` был доступен для импорта:

```bash
npm run build:lib
```

Или напрямую через Nx:

```bash
npx nx run kutlass:build
```

### 4. Запустите demo-приложение

```bash
npm run dev
```

Demo-приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000).

### Полезные команды

| Команда | Описание |
|---|---|
| `npm run build:lib` | Собрать библиотеку `kutlass` |
| `npm run build:app` | Собрать demo-приложение для продакшена |
| `npm run build` | Собрать все пакеты |
| `npm run dev` | Запустить demo-приложение в режиме разработки |
| `npm run test` | Запустить тесты библиотеки `kutlass` |
| `npm run lint` | Запустить линтер для всех пакетов |

## Quick start

```tsx
import { Kutlass, setFFmpegPaths } from "kutlass";
import "kutlass/styles.css";

setFFmpegPaths({
  coreJS: "/ffmpeg/ffmpeg-core.js",
  coreWasm: "/ffmpeg/ffmpeg-core.wasm",
});

function App() {
  return (
    <Kutlass
      style={{ width: 960, height: 640 }}
      onExportComplete={(blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "video.mp4";
        a.click();
      }}
    />
  );
}
```

## Theming

Kutlass ships with light and dark themes. Set the `theme` prop to switch:

```tsx
<Kutlass theme="light" />
<Kutlass theme="dark" />  {/* default */}
```

### Accent color

Pass a hex color to `accent` to change the primary color used for buttons, selection highlights, trim handles, and active states. Hover, subtle, and border variants are derived automatically:

```tsx
<Kutlass accent="#8b5cf6" />
<Kutlass theme="light" accent="#3b82f6" />
```

### Custom color tokens

For full control, use the `colors` prop to override any individual CSS variable. Keys are token names without the `--kt-` prefix:

```tsx
<Kutlass
  theme="dark"
  accent="#3b82f6"
  colors={{
    "bg-base": "#0f172a",
    "bg-panel": "#1e293b",
    "text-primary": "#e2e8f0",
  }}
/>
```

### Available tokens

| Token | Description |
|---|---|
| `bg-base` | Main editor background |
| `bg-panel` | Bottom panel background |
| `bg-surface` | Secondary surfaces (timeline, playback bar) |
| `bg-deep` | Deepest background |
| `bg-preview` | Video preview area |
| `bg-overlay` | Modal/export overlay |
| `bg-subtle` | Subtle interactive background |
| `bg-subtle-hover` | Subtle hover state |
| `border` | Primary borders |
| `border-strong` | Heavier borders |
| `text-primary` | Primary text |
| `text-secondary` | Secondary text |
| `text-tertiary` | Tertiary text |
| `text-muted` | Muted text |
| `text-faint` | Faintest text |
| `accent` | Primary accent color |
| `accent-hover` | Accent hover state |
| `accent-text` | Text on accent backgrounds |
| `accent-subtle-bg` | Accent at low opacity (chip backgrounds) |
| `accent-subtle-border` | Accent border at low opacity |
| `accent-strong-border` | Accent border at high opacity |
| `accent-play` | Play button color |
| `accent-play-hover` | Play button hover |
| `accent-play-bar` | Progress bar fill |
| `slider-track` | Slider track background |
| `slider-fill` | Slider fill color |
| `slider-thumb` | Slider thumb color |
| `success` | Success state color |
| `danger` | Danger/delete color |

You can also override tokens directly in CSS by targeting the `data-kt-theme` attribute:

```css
[data-kt-theme="dark"] {
  --kt-accent: #3b82f6;
  --kt-bg-base: #0f172a;
}
```

## FFmpeg WASM setup

Kutlass uses FFmpeg compiled to WebAssembly for video encoding. You need to:

1. Copy the WASM files to your public directory:

```bash
cp node_modules/kutlass/public/ffmpeg/* public/ffmpeg/
```

2. Set the required cross-origin headers. FFmpeg WASM requires `SharedArrayBuffer`, which needs these response headers on every page that loads the editor:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: cross-origin
```

How you set these depends on your setup:

**Next.js** (`next.config.ts`):

```ts
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        ],
      },
    ];
  },
};
```

**Vite** (`vite.config.ts`):

```ts
export default defineConfig({
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  },
});
```

**Nginx**:

```nginx
add_header Cross-Origin-Opener-Policy same-origin;
add_header Cross-Origin-Embedder-Policy require-corp;
add_header Cross-Origin-Resource-Policy cross-origin;
```

**Vercel** (`vercel.json`):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Resource-Policy", "value": "cross-origin" }
      ]
    }
  ]
}
```

**Netlify** (`_headers`):

```
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Resource-Policy: cross-origin
```

**Static hosting without header support** (GitHub Pages, etc.) — use [`coi-serviceworker`](https://www.npmjs.com/package/coi-serviceworker) to inject the headers client-side via a service worker. Install it with `npm install coi-serviceworker`, copy the script to your public directory, and add it before any other scripts:

```html
<script src="coi-serviceworker.js"></script>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `theme` | `"light" \| "dark"` | `"dark"` | Color theme |
| `accent` | `string` | — | Primary accent color (hex). Derives hover, subtle, and border variants. |
| `colors` | `KutlassColors` | — | Override individual color tokens (keys without `--kt-` prefix) |
| `className` | `string` | — | CSS class for the outer container |
| `style` | `CSSProperties` | — | Inline styles for the outer container |
| `tools` | `Tool[]` | all | Which tools to show (`trim`, `crop`, `finetune`, `filter`, `annotate`, `sticker`, `resize`) |
| `exportSettings` | `Partial<ExportSettings>` | — | Default export settings (`format`, `resolution`, `fps`, `bitrate`) |
| `ffmpegPaths` | `Partial<FFmpegPaths>` | — | Override FFmpeg WASM file URLs |
| `onExportComplete` | `(blob: Blob) => void` | — | Called with the exported video blob when export finishes |

## API

### `setFFmpegPaths(paths)`

Configure where the FFmpeg WASM files are served from. Must be called before the first export.

```ts
import { setFFmpegPaths } from "kutlass";

setFFmpegPaths({
  coreJS: "/vendor/ffmpeg-core.js",
  coreWasm: "/vendor/ffmpeg-core.wasm",
});
```

## License

MIT
