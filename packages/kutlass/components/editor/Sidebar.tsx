"use client";

import { motion } from "framer-motion";

export type Tool = "trim" | "crop" | "finetune" | "filter" | "annotate" | "sticker" | "resize";

interface SidebarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  /** Render as a horizontal bar (mobile) instead of a vertical sidebar */
  horizontal?: boolean;
}

const TOOLS: { id: Tool; label: string; icon: React.ReactNode }[] = [
  {
    id: "trim",
    label: "Trim",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="14" rx="1" />
        <path strokeLinecap="round" d="M3 9h18M3 15h18M9 5v14M15 5v14" />
      </svg>
    ),
  },
  {
    id: "crop",
    label: "Crop",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 2v14a2 2 0 002 2h14M2 6h14a2 2 0 012 2v14" />
      </svg>
    ),
  },
  {
    id: "finetune",
    label: "Finetune",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        <circle cx="9" cy="6" r="2" fill="currentColor" stroke="none" />
        <circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
        <circle cx="9" cy="18" r="2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "filter",
    label: "Filter",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M12 3a9 9 0 010 18M3 12h18" />
      </svg>
    ),
  },
  {
    id: "annotate",
    label: "Annotate",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L13 14l-4 1 1-4 8.5-8.5z" />
      </svg>
    ),
  },
  {
    id: "sticker",
    label: "Sticker",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M9 9h.01M15 9h.01M9 14s1 2 3 2 3-2 3-2" />
      </svg>
    ),
  },
  {
    id: "resize",
    label: "Resize",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3" />
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
              style={isActive ? { color: "var(--kt-text-primary)", background: "var(--kt-bg-subtle-hover)" } : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-h"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: "var(--kt-bg-subtle-hover)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <span className="relative z-10">{tool.icon}</span>
              <span className="relative z-10 text-[9px] font-medium leading-none">{tool.label}</span>
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
            style={isActive ? { color: "var(--kt-text-primary)", background: "var(--kt-bg-subtle-hover)" } : undefined}
          >
            {isActive && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-xl"
                style={{ background: "var(--kt-bg-subtle-hover)" }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <span className="relative z-10">{tool.icon}</span>
            <span className="relative z-10 text-[10px] font-medium leading-none">{tool.label}</span>
          </button>
        );
      })}
    </div>
  );
}
