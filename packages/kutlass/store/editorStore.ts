import { create } from "zustand";
import { createTimelineSlice, TimelineState, TimelineActions } from "./slices/timelineSlice";
import { createPlaybackSlice, PlaybackState, PlaybackActions } from "./slices/playbackSlice";
import { createEffectsSlice, EffectsState, EffectsActions } from "./slices/effectsSlice";
import { createExportSlice, ExportState, ExportActions } from "./slices/exportSlice";
import { createOverlaysSlice, OverlaysState, OverlaysActions } from "./slices/overlaysSlice";
import { createDrawingSlice, DrawingState, DrawingActions } from "./slices/drawingSlice";
import { createHistorySlice, HistoryState, HistoryActions } from "./slices/historySlice";

export type EditorStore = TimelineState &
  TimelineActions &
  PlaybackState &
  PlaybackActions &
  EffectsState &
  EffectsActions &
  ExportState &
  ExportActions &
  OverlaysState &
  OverlaysActions &
  DrawingState &
  DrawingActions &
  HistoryState &
  HistoryActions;

export const useEditorStore = create<EditorStore>()((set, get) => ({
  ...createTimelineSlice(set as Parameters<typeof createTimelineSlice>[0], get),
  ...createPlaybackSlice(set as Parameters<typeof createPlaybackSlice>[0]),
  ...createEffectsSlice(
    set as Parameters<typeof createEffectsSlice>[0],
    get as Parameters<typeof createEffectsSlice>[1]
  ),
  ...createExportSlice(set as Parameters<typeof createExportSlice>[0]),
  ...createOverlaysSlice(set as Parameters<typeof createOverlaysSlice>[0]),
  ...createDrawingSlice(set as Parameters<typeof createDrawingSlice>[0]),
  ...createHistorySlice(
    set as Parameters<typeof createHistorySlice>[0],
    get as Parameters<typeof createHistorySlice>[1]
  ),
}));
