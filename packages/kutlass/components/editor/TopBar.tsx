"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useExport } from "@/hooks/useExport";
import { useVideoImport } from "@/hooks/useVideoImport";

type MenuId = "file" | "edit" | "view" | "help";

const MENUS: { id: MenuId; label: string }[] = [
  { id: "file", label: "File" },
  { id: "edit", label: "Edit" },
  { id: "view", label: "View" },
  { id: "help", label: "Help" },
];

export function TopBar() {
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);
  const exportStatus = useEditorStore((s) => s.status);
  const clips = useEditorStore((s) => s.clips);
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const playbackRate = useEditorStore((s) => s.playbackRate);
  const setPlaybackRate = useEditorStore((s) => s.setPlaybackRate);
  const theme = useEditorStore((s) => s.theme);
  const toggleTheme = useEditorStore((s) => s.toggleTheme);
  const { startExport } = useExport();
  const { replaceImport } = useVideoImport();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isExporting = exportStatus === "preparing" || exportStatus === "encoding";
  const hasClips = clips.length > 0;
  const zoomPercent = Math.round((zoom / 80) * 100);

  // Close menu on outside click
  useEffect(() => {
    if (!openMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenu]);

  const toggleMenu = useCallback((id: MenuId) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  }, []);

  const handleAction = useCallback(
    (action: string) => {
      setOpenMenu(null);
      switch (action) {
        case "import":
          fileInputRef.current?.click();
          break;
        case "export":
          if (!isExporting && hasClips) {
            setPlaying(false);
            startExport();
          }
          break;
        case "undo":
          undo();
          break;
        case "redo":
          redo();
          break;
        case "toggle-theme":
          toggleTheme();
          break;
        case "zoom-in":
          setZoom(zoom * 1.25);
          break;
        case "zoom-out":
          setZoom(zoom / 1.25);
          break;
        case "zoom-reset":
          setZoom(80);
          break;
      }
    },
    [undo, redo, toggleTheme, setZoom, zoom, isExporting, hasClips, setPlaying]
  );

  return (
    <div
      ref={menuRef}
      className="flex items-center h-11 px-1 md:px-2 shrink-0 border-b select-none"
      style={{ borderColor: "var(--kt-border)" }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("video/"));
          if (files.length > 0) replaceImport(files);
          e.target.value = "";
        }}
      />

      {/* ── Menu items ── */}
      {MENUS.map((menu) => (
        <div key={menu.id} className="relative">
          <button
            onClick={() => toggleMenu(menu.id)}
            className="kt-btn-ghost px-3 h-8 rounded-lg text-sm font-medium transition-colors"
            style={{
              color: openMenu === menu.id ? "var(--kt-text-primary)" : "var(--kt-text-tertiary)",
              background: openMenu === menu.id ? "var(--kt-bg-subtle-hover)" : "transparent",
            }}
          >
            {menu.label}
          </button>

          {/* Dropdown */}
          {openMenu === menu.id && (
            <div
              className="absolute top-full left-0 mt-0.5 w-48 rounded-lg shadow-xl border z-50 py-1"
              style={{
                background: "var(--kt-bg-panel)",
                borderColor: "var(--kt-border-strong)",
              }}
            >
              {menu.id === "file" && (
                <>
                  <MenuItem label="Import Video" shortcut="⌘I" onClick={() => handleAction("import")} />
                  {hasClips && (
                    <MenuItem
                      label="Export"
                      shortcut="⌘E"
                      onClick={() => handleAction("export")}
                      disabled={isExporting}
                    />
                  )}
                  <div className="h-px my-1" style={{ background: "var(--kt-border)" }} />
                  <MenuItem label="Close" shortcut="⌘W" onClick={() => handleAction("close")} />
                </>
              )}

              {menu.id === "edit" && (
                <>
                  <MenuItem label="Undo" shortcut="⌘Z" onClick={() => handleAction("undo")} disabled={!canUndo} />
                  <MenuItem label="Redo" shortcut="⌘⇧Z" onClick={() => handleAction("redo")} disabled={!canRedo} />
                </>
              )}

              {menu.id === "view" && (
                <>
                  <MenuItem label="Zoom In" shortcut="⌘+" onClick={() => handleAction("zoom-in")} />
                  <MenuItem label="Zoom Out" shortcut="⌘-" onClick={() => handleAction("zoom-out")} />
                  <MenuItem label="Reset Zoom" shortcut="⌘0" onClick={() => handleAction("zoom-reset")} />
                  <div className="h-px my-1" style={{ background: "var(--kt-border)" }} />
                  <MenuItem
                    label={theme === "dark" ? "Light Theme" : "Dark Theme"}
                    shortcut="⌘T"
                    onClick={() => handleAction("toggle-theme")}
                    icon={
                      theme === "dark" ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="5" />
                          <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                        </svg>
                      )
                    }
                  />
                </>
              )}

              {menu.id === "help" && (
                <>
                  <MenuItem label="Keyboard Shortcuts" shortcut="?" onClick={() => handleAction("shortcuts")} />
                  <MenuItem label="About IceProVideoEditor" onClick={() => handleAction("about")} />
                </>
              )}
            </div>
          )}
        </div>
      ))}

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Zoom ── */}
      <div className="hidden md:flex items-center gap-1 mr-2">
        <button
          onClick={() => setZoom(zoom / 1.25)}
          className="kt-btn-ghost w-7 h-7 flex items-center justify-center rounded-lg transition-colors text-base leading-none"
        >
          -
        </button>
        <span className="text-xs font-medium w-10 text-center tabular-nums" style={{ color: "var(--kt-text-secondary)" }}>
          {zoomPercent}%
        </span>
        <button
          onClick={() => setZoom(zoom * 1.25)}
          className="kt-btn-ghost w-7 h-7 flex items-center justify-center rounded-lg transition-colors text-base leading-none"
        >
          +
        </button>
      </div>

      {/* ── Speed ── */}
      <div className="flex items-center gap-1 mr-2">
        <button
          onClick={() => setPlaybackRate(Math.max(0, playbackRate - 0.25))}
          className="kt-btn-ghost w-6 h-6 flex items-center justify-center rounded text-xs leading-none"
          title="Slower ([)"
        >
          −
        </button>
        <span
          className="text-xs font-mono tabular-nums min-w-[2.5ch] text-center"
          style={{ color: playbackRate !== 1 ? "var(--kt-accent)" : "var(--kt-text-muted)" }}
        >
          {playbackRate === 0 ? "❚❚" : `${playbackRate}x`}
        </span>
        <button
          onClick={() => setPlaybackRate(Math.min(2, playbackRate + 0.25))}
          className="kt-btn-ghost w-6 h-6 flex items-center justify-center rounded text-xs leading-none"
          title="Faster (])"
        >
          +
        </button>
      </div>

      {/* ── Import & Done ── */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {hasClips && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="kt-btn-import px-2 md:px-3 h-8 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5"
              title="Import new video"
            >
              <span className="hidden md:inline">Import Video</span>
              <span className="md:hidden">Import</span>
            </button>
            <button
              disabled={isExporting}
              onClick={() => { setPlaying(false); startExport(); }}
              className="kt-btn-accent px-4 h-8 rounded-lg text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Menu item component ── */
function MenuItem({
  label,
  shortcut,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  shortcut?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center w-full px-3 py-2 text-sm transition-colors"
      style={{
        color: disabled ? "var(--kt-text-faint)" : "var(--kt-text-secondary)",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "var(--kt-bg-subtle-hover)";
          e.currentTarget.style.color = "var(--kt-text-primary)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        if (!disabled) e.currentTarget.style.color = "var(--kt-text-secondary)";
      }}
    >
      {icon && <span className="mr-2">{icon}</span>}
      <span className="flex-1 text-left">{label}</span>
      {shortcut && (
        <span className="ml-4 text-[10px] tabular-nums" style={{ color: "var(--kt-text-muted)" }}>
          {shortcut}
        </span>
      )}
    </button>
  );
}
