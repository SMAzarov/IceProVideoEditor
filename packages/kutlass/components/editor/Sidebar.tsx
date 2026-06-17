"use client";

import { motion } from "framer-motion";

export type Tool = "trim" | "crop" | "finetune" | "filter" | "annotate" | "sticker" | "resize" | "voice";

interface SidebarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  /** Render as a horizontal bar (mobile) instead of a vertical sidebar */
  horizontal?: boolean;
}

/* ── Color palette for sidebar icons ── */
const C = {
  trim: "#3b82f6",       // blue
  crop: "#22c55e",       // green
  finetune: "#a855f7",   // purple
  filter: "#f43f5e",     // rose
  annotate: "#f97316",   // orange
  sticker: "#ec4899",    // pink
  resize: "#eab308",     // yellow
  voice: "#06b6d4",      // cyan
};

const TOOLS: { id: Tool; label: string; icon: (color: string) => React.ReactNode }[] = [
  {
    id: "trim",
    label: "Trim",
    icon: (c) => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
        <rect x="2" y="4" width="20" height="16" rx="2" stroke={c} strokeWidth={1.75} />
        <path strokeLinecap="round" d="M8 4v16M16 4v16" stroke={c} strokeWidth={1.75} />
        <path strokeLinecap="round" strokeWidth={1.5} d="M2 9h20M2 15h20" stroke={c} opacity="0.35" />
      </svg>
    ),
  },
  {
    id: "crop",
    label: "Crop",
    icon: (c) => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 2v14a2 2 0 002 2h14M2 6h14a2 2 0 012 2v14" stroke={c} strokeWidth={1.75} />
        <circle cx="12" cy="12" r="3" stroke={c} strokeWidth={1.5} opacity="0.45" />
      </svg>
    ),
  },
  {
    id: "finetune",
    label: "Adjust",
    icon: (c) => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" stroke={c} strokeWidth={1.75} />
        <circle cx="8" cy="6" r="2" fill={c} stroke="none" opacity="0.7" />
        <circle cx="16" cy="12" r="2" fill={c} stroke="none" opacity="0.7" />
        <circle cx="8" cy="18" r="2" fill={c} stroke="none" opacity="0.7" />
      </svg>
    ),
  },
  {
    id: "filter",
    label: "Filter",
    icon: (c) => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" stroke={c} strokeWidth={1.75} />
        <path strokeLinecap="round" d="M12 3a9 9 0 010 18M3 12h18" stroke={c} strokeWidth={1.75} />
        <circle cx="12" cy="12" r="3" stroke={c} strokeWidth={1.5} opacity="0.45" />
      </svg>
    ),
  },
  {
    id: "annotate",
    label: "Annotate",
    icon: (c) => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" stroke={c} strokeWidth={1.75} />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L13 14l-4 1 1-4 8.5-8.5z" stroke={c} strokeWidth={1.75} />
        <circle cx="16" cy="8" r="1.5" fill={c} stroke="none" opacity="0.55" />
      </svg>
    ),
  },
  {
    id: "sticker",
    label: "Sticker",
    icon: (c) => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="4" stroke={c} strokeWidth={1.75} />
        <circle cx="9" cy="9" r="1.5" fill={c} stroke="none" />
        <circle cx="15" cy="9" r="1.5" fill={c} stroke="none" />
        <path strokeLinecap="round" strokeWidth={1.5} d="M8 15s1.5 2 4 2 4-2 4-2" stroke={c} />
      </svg>
    ),
  },
  {
    id: "resize",
    label: "Resize",
    icon: (c) => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3" stroke={c} strokeWidth={1.75} />
        <path strokeLinecap="round" strokeWidth={1.5} d="M8 12h8M12 8v8" stroke={c} opacity="0.45" />
      </svg>
    ),
  },
  {
    id: "voice",
    label: "Voice",
    icon: (c) => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
        <rect x="9" y="2" width="6" height="12" rx="3" stroke={c} strokeWidth={1.75} />
        <path strokeLinecap="round" d="M5 11a7 7 0 0014 0" stroke={c} strokeWidth={1.75} />
        <path strokeLinecap="round" strokeWidth={1.5} d="M12 19v3M9 22h6" stroke={c} />
      </svg>
    ),
  },
];

export function Sidebar({ activeTool, onToolChange, horizontal }: SidebarProps) {
  if (horizontal) {
    return (
      <div className="flex shrink-0 border-t px-1 py-1 gap-0.5 overflow-x-auto" style={{ borderColor: "var(--kt-border)" }}>
        {TOOLS.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className="relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg transition-colors shrink-0 kt-tool-btn"
              style={isActive ? { color: "var(--kt-accent)", background: "var(--kt-accent-subtle-bg)" } : { color: "var(--kt-text-tertiary)" }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-h"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: "var(--kt-accent-subtle-bg)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <span className="relative z-10">{tool.icon(isActive ? "var(--kt-accent)" : C[tool.id])}</span>
              <span className="relative z-10 text-xs font-medium leading-none">{tool.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-[72px] shrink-0 border-r py-2 gap-1" style={{ borderColor: "var(--kt-border)" }}>
      {TOOLS.map((tool) => {
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className="relative flex flex-col items-center gap-1 py-2.5 mx-1.5 rounded-xl transition-colors kt-tool-btn"
            style={isActive ? { color: "var(--kt-accent)", background: "var(--kt-accent-subtle-bg)" } : { color: "var(--kt-text-tertiary)" }}
          >
            {isActive && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-xl"
                style={{ background: "var(--kt-accent-subtle-bg)" }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <span className="relative z-10">{tool.icon(isActive ? "var(--kt-accent)" : C[tool.id])}</span>
            <span className="relative z-10 text-xs font-medium leading-none">{tool.label}</span>
          </button>
        );
      })}
    </div>
  );
}
