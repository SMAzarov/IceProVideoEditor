"use client";

import { useState } from "react";
import { EditorDemo } from "./EditorDemo";

const FEATURES = [
  { title: "Trim", desc: "Frame-accurate handles" },
  { title: "Crop", desc: "Any aspect ratio" },
  { title: "Filters", desc: "8 cinematic presets" },
  { title: "Effects", desc: "Brightness, contrast, more" },
  { title: "Annotate", desc: "Freehand drawing" },
  { title: "Stickers", desc: "Emoji & image overlays" },
  { title: "Resize", desc: "1080p, 720p, 480p" },
  { title: "Export", desc: "MP4 & WebM via WASM" },
];

const CODE = `import { Kutlass } from "kutlass";
import "kutlass/styles.css";

export default function App() {
  return <Kutlass onExportComplete={(blob) => {
    // do whatever you want with the video blob
  }} />;
}`;

function ThemeToggle({ theme, onToggle }: { theme: "dark" | "light"; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-center w-7 h-7 rounded-md transition-colors"
      style={{
        background: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        color: theme === "dark" ? "#a1a1aa" : "#52525b",
      }}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");
  const d = theme === "dark";

  return (
    <div className="min-h-screen transition-colors duration-200" style={{ background: d ? "#09090b" : "#fafafa", color: d ? "#ffffff" : "#18181b" }}>
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b transition-colors duration-200" style={{ background: d ? "rgba(9,9,11,0.8)" : "rgba(250,250,250,0.8)", borderColor: d ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between h-12 px-4">
          <span className="text-base font-bold tracking-tight">KUTLASS</span>
          <div className="flex items-center gap-3 text-sm" style={{ color: d ? "#a1a1aa" : "#52525b" }}>
            <a href="https://www.npmjs.com/package/kutlass" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">NPM</a>
            <a href="https://github.com/iamTMTY/Kutlass" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">GitHub</a>
            <ThemeToggle theme={theme} onToggle={toggle} />
            <a href="#demo" className="px-2.5 py-1 rounded-md font-semibold transition-colors" style={{ background: d ? "#fbbf24" : "#f59e0b", color: d ? "#18181b" : "#ffffff" }}>Try it</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-10 md:pb-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm font-medium mb-3 tracking-wide uppercase" style={{ color: d ? "#fbbf24" : "#d97706" }}>100% client-side</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-4">
            A video editor that lives<br className="hidden md:block" /> inside your React app
          </h1>
          <p className="text-base md:text-lg mb-6 max-w-lg mx-auto" style={{ color: d ? "#a1a1aa" : "#52525b" }}>
            Drop-in component. No backend. Trim, crop, filter, annotate, export — all in the browser.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md border font-mono text-sm" style={{ background: d ? "#18181b" : "#ffffff", borderColor: d ? "#27272a" : "#e4e4e7", color: d ? "#a1a1aa" : "#52525b" }}>
            <span className="select-none" style={{ color: d ? "#3f3f46" : "#a1a1aa" }}>$</span> npm install kutlass
          </div>
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="px-4 pb-16 md:pb-20 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <EditorDemo theme={theme} />
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-16 md:pb-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-base font-semibold uppercase tracking-wider mb-4 text-center" style={{ color: d ? "#fbbf24" : "#d97706" }}>Features</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="px-3 py-2.5 rounded-lg border" style={{ background: d ? "rgba(24,24,27,0.6)" : "#ffffff", borderColor: d ? "rgba(39,39,42,0.5)" : "#e4e4e7" }}>
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="text-xs mt-0.5" style={{ color: d ? "#a1a1aa" : "#71717a" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code */}
      <section className="px-4 pb-16 md:pb-20">
        <div className="max-w-xl mx-auto">
          <h2 className="text-base font-semibold uppercase tracking-wider mb-4 text-center" style={{ color: d ? "#fbbf24" : "#d97706" }}>Quick start</h2>
          <div className="rounded-lg border overflow-hidden" style={{ background: d ? "#18181b" : "#ffffff", borderColor: d ? "#27272a" : "#e4e4e7" }}>
            <div className="flex items-center gap-1.5 px-3 py-2 border-b" style={{ borderColor: d ? "rgba(39,39,42,0.6)" : "#e4e4e7" }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
              <span className="text-xs ml-1.5" style={{ color: d ? "#52525b" : "#a1a1aa" }}>App.tsx</span>
            </div>
            <pre className="p-4 md:p-5 overflow-x-auto text-sm leading-relaxed">
              <code style={{ color: d ? "#a1a1aa" : "#52525b" }}>{CODE}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Tech */}
      <section className="px-4 pb-16 md:pb-20">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-sm leading-relaxed" style={{ color: d ? "#a1a1aa" : "#71717a" }}>
            Built on <span style={{ color: d ? "#d4d4d8" : "#3f3f46" }}>WebCodecs</span> for decoding, <span style={{ color: d ? "#d4d4d8" : "#3f3f46" }}>FFmpeg WASM</span> for encoding, <span style={{ color: d ? "#d4d4d8" : "#3f3f46" }}>OffscreenCanvas</span> for rendering, and <span style={{ color: d ? "#d4d4d8" : "#3f3f46" }}>Zustand</span> for state. Works in any React 18+ app.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 px-4 transition-colors duration-200" style={{ borderColor: d ? "rgba(39,39,42,0.4)" : "#e4e4e7" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm" style={{ color: d ? "#a1a1aa" : "#71717a" }}>
          <span>KUTLASS — MIT</span>
          <div className="flex gap-3">
            <a href="https://www.npmjs.com/package/kutlass" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">NPM</a>
            <a href="https://github.com/iamTMTY/Kutlass" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
