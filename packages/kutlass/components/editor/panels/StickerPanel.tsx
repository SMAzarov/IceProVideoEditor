"use client";

import { useRef } from "react";
import { useEditorStore } from "@/store/editorStore";

const STICKER_GROUPS = [
  {
    label: "Reactions",
    emojis: ["😀", "😂", "😍", "🥰", "😎", "🤩", "😱", "🤔", "😴", "🥳"],
  },
  {
    label: "Symbols",
    emojis: ["❤️", "💯", "🔥", "⭐", "✨", "💫", "🎉", "🎊", "👍", "👎"],
  },
  {
    label: "Nature",
    emojis: ["🌟", "🌈", "☀️", "🌙", "⚡", "❄️", "🌸", "🍀", "🦋", "🐾"],
  },
  {
    label: "Objects",
    emojis: ["🎬", "📸", "🎵", "🎮", "💎", "🏆", "🎯", "🚀", "💡", "🔑"],
  },
];

export function StickerPanel() {
  const addStickerOverlay = useEditorStore((s) => s.addStickerOverlay);
  const overlays = useEditorStore((s) => s.overlays);
  const removeOverlay = useEditorStore((s) => s.removeOverlay);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const stickerOverlays = overlays.filter((o) => o.type === "sticker");

  const handleAddEmoji = (emoji: string) => {
    addStickerOverlay({ emoji, x: 0.5, y: 0.5, scale: 1 });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addStickerOverlay({
        emoji: "",
        imageUrl: reader.result as string,
        x: 0.5,
        y: 0.5,
        scale: 1,
      });
    };
    reader.readAsDataURL(file);
    // reset input so same file can be re-uploaded
    e.target.value = "";
  };

  return (
    <div
      className="shrink-0 border-t px-3 md:px-4 py-3 overflow-y-auto max-h-[160px]"
      style={{ borderColor: "var(--kt-border)", background: "var(--kt-bg-panel)" }}
    >
      <div className="flex gap-4 h-full">
        {/* Sticker grid + upload */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {/* Image upload button */}
          <div className="mb-2">
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium kt-btn-subtle border transition-colors"
              style={{ borderColor: "var(--kt-border-input)" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Upload image
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {STICKER_GROUPS.map((group) => (
            <div key={group.label} className="mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: "var(--kt-text-faint)" }}>
                {group.label}
              </span>
              <div className="flex flex-wrap gap-1">
                {group.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleAddEmoji(emoji)}
                    className="w-8 h-8 flex items-center justify-center rounded kt-emoji-btn transition-colors text-lg"
                    title={`Add ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Active stickers — hidden on mobile */}
        <div className="hidden md:flex w-36 shrink-0 flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--kt-text-muted)" }}>
            Active ({stickerOverlays.length})
          </span>
          <div className="flex flex-col gap-1 overflow-y-auto">
            {stickerOverlays.length === 0 && (
              <span className="text-[11px]" style={{ color: "var(--kt-text-faint)" }}>Click to add stickers</span>
            )}
            {stickerOverlays.map((o) => {
              if (o.type !== "sticker") return null;
              return (
                <div
                  key={o.id}
                  className="flex items-center justify-between px-2 py-1 rounded"
                  style={{ background: "var(--kt-bg-subtle)" }}
                >
                  {o.imageUrl ? (
                    <img src={o.imageUrl} alt="" className="w-6 h-6 object-cover rounded" />
                  ) : (
                    <span className="text-lg">{o.emoji}</span>
                  )}
                  <button
                    onClick={() => removeOverlay(o.id)}
                    className="transition-colors"
                    style={{ color: "var(--kt-text-faint)" }}
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
