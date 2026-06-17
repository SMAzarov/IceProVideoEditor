export type DrawingTool = "pen" | "eraser" | "arrow" | "straight" | "curved";

export interface Stroke {
  id: string;
  tool: DrawingTool;
  color: string;
  width: number;
  points: { x: number; y: number }[];
  startTime: number;
  endTime: number;
}

export interface DrawingState {
  strokes: Stroke[];
  drawingTool: DrawingTool;
  drawingColor: string;
  drawingWidth: number;
  annotationDuration: number;
}

export interface DrawingActions {
  addStroke: (stroke: Omit<Stroke, "startTime" | "endTime">) => void;
  undoStroke: () => void;
  clearStrokes: () => void;
  setDrawingTool: (tool: DrawingTool) => void;
  setDrawingColor: (color: string) => void;
  setDrawingWidth: (width: number) => void;
  setAnnotationDuration: (duration: number) => void;
}

type Set = (fn: (s: DrawingState & DrawingActions) => Partial<DrawingState & DrawingActions>) => void;
type Get = () => DrawingState & DrawingActions & { currentTime: number; duration: number; freezeOnOverlay: boolean; addFreeze: (startTime: number, endTime: number) => string };

export function createDrawingSlice(set: Set, get: Get): DrawingState & DrawingActions {
  return {
    strokes: [],
    drawingTool: "pen",
    drawingColor: "#ff0000",
    drawingWidth: 4,
    annotationDuration: 3,

    addStroke: (stroke) => {
      const currentTime = get().currentTime ?? 0;
      const annotationDuration = get().annotationDuration ?? 3;
      const endTime = currentTime + annotationDuration;
      set((s) => ({
        strokes: [
          ...s.strokes,
          { ...stroke, startTime: currentTime, endTime },
        ],
      }));
      // Pause video during the drawing overlay so it's visible in the exported video
      if (get().freezeOnOverlay && typeof get().addFreeze === "function") {
        get().addFreeze(currentTime, endTime);
      }
    },
    undoStroke: () => set((s) => ({ strokes: s.strokes.slice(0, -1) })),
    clearStrokes: () => set(() => ({ strokes: [] })),
    setDrawingTool: (tool) => set(() => ({ drawingTool: tool })),
    setDrawingColor: (color) => set(() => ({ drawingColor: color })),
    setDrawingWidth: (width) => set(() => ({ drawingWidth: width })),
    setAnnotationDuration: (duration) => set(() => ({ annotationDuration: duration })),
  };
}
