import { Overlay, TextOverlay, StickerOverlay } from "@/types/editor";
export interface OverlaysState {
    overlays: Overlay[];
    selectedOverlayId: string | null;
    stickerDuration: number;
}
export interface OverlaysActions {
    addTextOverlay: (overlay: Omit<TextOverlay, "id" | "type" | "startTime" | "endTime">) => string;
    addStickerOverlay: (overlay: Omit<StickerOverlay, "id" | "type" | "startTime" | "endTime">) => string;
    addVoiceOverlay: (overlay: {
        audioUrl: string;
        duration: number;
    }) => string;
    updateOverlay: (id: string, updates: Record<string, unknown>) => void;
    removeOverlay: (id: string) => void;
    selectOverlay: (id: string | null) => void;
    clearOverlays: () => void;
    setStickerDuration: (duration: number) => void;
}
export declare const createOverlaysSlice: (set: (fn: (state: OverlaysState & OverlaysActions) => Partial<OverlaysState & OverlaysActions>) => void, get: () => OverlaysState & OverlaysActions & {
    currentTime: number;
    duration: number;
    annotationDuration: number;
}) => OverlaysState & OverlaysActions;
//# sourceMappingURL=overlaysSlice.d.ts.map