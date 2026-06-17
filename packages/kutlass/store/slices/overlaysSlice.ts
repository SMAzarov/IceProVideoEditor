import { nanoid } from "nanoid";
import { Overlay, TextOverlay, StickerOverlay, VoiceOverlay } from "@/types/editor";

export interface OverlaysState {
  overlays: Overlay[];
  selectedOverlayId: string | null;
  stickerDuration: number;
  freezeOnOverlay: boolean;
}

export interface OverlaysActions {
  addTextOverlay: (overlay: Omit<TextOverlay, "id" | "type" | "startTime" | "endTime">) => string;
  addStickerOverlay: (overlay: Omit<StickerOverlay, "id" | "type" | "startTime" | "endTime">) => string;
  addVoiceOverlay: (overlay: { audioUrl: string; duration: number }) => string;
  updateOverlay: (id: string, updates: Record<string, unknown>) => void;
  removeOverlay: (id: string) => void;
  selectOverlay: (id: string | null) => void;
  clearOverlays: () => void;
  setStickerDuration: (duration: number) => void;
  setFreezeOnOverlay: (value: boolean) => void;
}

export const createOverlaysSlice = (
  set: (fn: (state: OverlaysState & OverlaysActions) => Partial<OverlaysState & OverlaysActions>) => void,
  get: () => OverlaysState & OverlaysActions & { currentTime: number; duration: number; annotationDuration: number; addFreeze: (startTime: number, endTime: number) => string }
): OverlaysState & OverlaysActions => ({
  overlays: [],
  selectedOverlayId: null,
  stickerDuration: 3,
  freezeOnOverlay: true,

  addTextOverlay: (overlay) => {
    const id = nanoid();
    const currentTime = get().currentTime ?? 0;
    const annotationDuration = get().annotationDuration ?? 3;
    const endTime = currentTime + annotationDuration;
    set((state) => ({
      overlays: [...state.overlays, { ...overlay, id, type: "text", startTime: currentTime, endTime } as TextOverlay],
      selectedOverlayId: id,
    }));
    // Pause video during the text overlay so it's visible in the exported video
    if (get().freezeOnOverlay && typeof get().addFreeze === "function") {
      get().addFreeze(currentTime, endTime);
    }
    return id;
  },

  addStickerOverlay: (overlay) => {
    const id = nanoid();
    const currentTime = get().currentTime ?? 0;
    const stickerDuration = get().stickerDuration ?? 3;
    const endTime = currentTime + stickerDuration;
    set((state) => ({
      overlays: [...state.overlays, { ...overlay, id, type: "sticker", startTime: currentTime, endTime } as StickerOverlay],
      selectedOverlayId: id,
    }));
    // Pause video during the sticker overlay so it's visible in the exported video
    if (get().freezeOnOverlay && typeof get().addFreeze === "function") {
      get().addFreeze(currentTime, endTime);
    }
    return id;
  },

  addVoiceOverlay: (overlay) => {
    const id = nanoid();
    const currentTime = get().currentTime ?? 0;
    const endTime = currentTime + overlay.duration;
    set((state) => ({
      overlays: [...state.overlays, { ...overlay, id, type: "voice", startTime: currentTime, endTime } as VoiceOverlay],
      selectedOverlayId: id,
    }));
    // Also create a freeze segment for the duration of the voice recording
    // so the video pauses during the voice comment in the exported video
    if (typeof get().addFreeze === "function") {
      get().addFreeze(currentTime, endTime);
    }
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

  setStickerDuration: (duration) => set(() => ({ stickerDuration: duration })),

  setFreezeOnOverlay: (value) => set(() => ({ freezeOnOverlay: value })),
});
