import { nanoid } from "nanoid";
import { Overlay, TextOverlay, StickerOverlay } from "@/types/editor";

export interface OverlaysState {
  overlays: Overlay[];
  selectedOverlayId: string | null;
}

export interface OverlaysActions {
  addTextOverlay: (overlay: Omit<TextOverlay, "id" | "type">) => string;
  addStickerOverlay: (overlay: Omit<StickerOverlay, "id" | "type">) => string;
  updateOverlay: (id: string, updates: Partial<Omit<Overlay, "id" | "type">>) => void;
  removeOverlay: (id: string) => void;
  selectOverlay: (id: string | null) => void;
  clearOverlays: () => void;
}

export const createOverlaysSlice = (
  set: (fn: (state: OverlaysState & OverlaysActions) => Partial<OverlaysState & OverlaysActions>) => void
): OverlaysState & OverlaysActions => ({
  overlays: [],
  selectedOverlayId: null,

  addTextOverlay: (overlay) => {
    const id = nanoid();
    set((state) => ({
      overlays: [...state.overlays, { ...overlay, id, type: "text" } as TextOverlay],
      selectedOverlayId: id,
    }));
    return id;
  },

  addStickerOverlay: (overlay) => {
    const id = nanoid();
    set((state) => ({
      overlays: [...state.overlays, { ...overlay, id, type: "sticker" } as StickerOverlay],
      selectedOverlayId: id,
    }));
    return id;
  },

  updateOverlay: (id, updates) =>
    set((state) => ({
      overlays: state.overlays.map((o) =>
        o.id === id ? ({ ...o, ...updates } as Overlay) : o
      ),
    })),

  removeOverlay: (id) =>
    set((state) => ({
      overlays: state.overlays.filter((o) => o.id !== id),
      selectedOverlayId: state.selectedOverlayId === id ? null : state.selectedOverlayId,
    })),

  selectOverlay: (id) => set(() => ({ selectedOverlayId: id })),

  clearOverlays: () => set(() => ({ overlays: [], selectedOverlayId: null })),
});
