export type DrawingTool = "pen" | "eraser";

export interface Stroke {
  id: string;
  tool: DrawingTool;
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

export interface DrawingState {
  strokes: Stroke[];
  drawingTool: DrawingTool;
  drawingColor: string;
  drawingWidth: number;
}

export interface DrawingActions {
  addStroke: (stroke: Stroke) => void;
  undoStroke: () => void;
  clearStrokes: () => void;
  setDrawingTool: (tool: DrawingTool) => void;
  setDrawingColor: (color: string) => void;
  setDrawingWidth: (width: number) => void;
}

type Set = (fn: (s: DrawingState & DrawingActions) => Partial<DrawingState & DrawingActions>) => void;

export function createDrawingSlice(set: Set): DrawingState & DrawingActions {
  return {
    strokes: [],
    drawingTool: "pen",
    drawingColor: "#ff0000",
    drawingWidth: 4,

    addStroke: (stroke) => set((s) => ({ strokes: [...s.strokes, stroke] })),
    undoStroke: () => set((s) => ({ strokes: s.strokes.slice(0, -1) })),
    clearStrokes: () => set(() => ({ strokes: [] })),
    setDrawingTool: (tool) => set(() => ({ drawingTool: tool })),
    setDrawingColor: (color) => set(() => ({ drawingColor: color })),
    setDrawingWidth: (width) => set(() => ({ drawingWidth: width })),
  };
}
