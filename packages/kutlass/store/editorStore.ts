import { create } from "zustand";
import { createTimelineSlice, TimelineState, TimelineActions } from "./slices/timelineSlice";
import { createPlaybackSlice, PlaybackState, PlaybackActions } from "./slices/playbackSlice";
import { createEffectsSlice, EffectsState, EffectsActions } from "./slices/effectsSlice";
import { createExportSlice, ExportState, ExportActions } from "./slices/exportSlice";
import { createOverlaysSlice, OverlaysState, OverlaysActions } from "./slices/overlaysSlice";
import { createDrawingSlice, DrawingState, DrawingActions } from "./slices/drawingSlice";
import { createHistorySlice, HistoryState, HistoryActions } from "./slices/historySlice";
import { createFreezeSlice, FreezeState, FreezeActions } from "./slices/freezeSlice";
import { createTransitionSlice, TransitionState, TransitionActions } from "./slices/transitionSlice";
import { createShapeSlice, ShapeState, ShapeActions } from "./slices/shapeSlice";

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
  HistoryActions &
  FreezeState &
  FreezeActions &
  TransitionState &
  TransitionActions &
  ShapeState &
  ShapeActions;

export const useEditorStore = create<EditorStore>()((set, get) => ({
  ...createTimelineSlice(set as Parameters<typeof createTimelineSlice>[0], get),
  ...createPlaybackSlice(set as Parameters<typeof createPlaybackSlice>[0]),
  ...createEffectsSlice(
    set as Parameters<typeof createEffectsSlice>[0],
    get as Parameters<typeof createEffectsSlice>[1]
  ),
  ...createExportSlice(set as Parameters<typeof createExportSlice>[0]),
  ...createOverlaysSlice(
    set as Parameters<typeof createOverlaysSlice>[0],
    get as Parameters<typeof createOverlaysSlice>[1]
  ),
  ...createDrawingSlice(
    set as Parameters<typeof createDrawingSlice>[0],
    get as Parameters<typeof createDrawingSlice>[1]
  ),
  ...createHistorySlice(
    set as Parameters<typeof createHistorySlice>[0],
    get as Parameters<typeof createHistorySlice>[1]
  ),
  ...createFreezeSlice(set as Parameters<typeof createFreezeSlice>[0]),
  ...createTransitionSlice(
    set as unknown as Parameters<typeof createTransitionSlice>[0],
    get as unknown as Parameters<typeof createTransitionSlice>[1]
  ),
  ...createShapeSlice(
    set as unknown as Parameters<typeof createShapeSlice>[0],
    get as unknown as Parameters<typeof createShapeSlice>[1]
  ),
}));
