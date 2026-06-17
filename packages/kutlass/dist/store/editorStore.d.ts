import { TimelineState, TimelineActions } from "./slices/timelineSlice";
import { PlaybackState, PlaybackActions } from "./slices/playbackSlice";
import { EffectsState, EffectsActions } from "./slices/effectsSlice";
import { ExportState, ExportActions } from "./slices/exportSlice";
import { OverlaysState, OverlaysActions } from "./slices/overlaysSlice";
import { DrawingState, DrawingActions } from "./slices/drawingSlice";
import { HistoryState, HistoryActions } from "./slices/historySlice";
import { FreezeState, FreezeActions } from "./slices/freezeSlice";
import { TransitionState, TransitionActions } from "./slices/transitionSlice";
import { ShapeState, ShapeActions } from "./slices/shapeSlice";
export type EditorStore = TimelineState & TimelineActions & PlaybackState & PlaybackActions & EffectsState & EffectsActions & ExportState & ExportActions & OverlaysState & OverlaysActions & DrawingState & DrawingActions & HistoryState & HistoryActions & FreezeState & FreezeActions & TransitionState & TransitionActions & ShapeState & ShapeActions;
export declare const useEditorStore: import("zustand").UseBoundStore<import("zustand").StoreApi<EditorStore>>;
//# sourceMappingURL=editorStore.d.ts.map