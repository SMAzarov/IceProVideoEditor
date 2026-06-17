export type DrawingTool = "pen" | "eraser" | "arrow" | "straight" | "curved";
export interface Stroke {
    id: string;
    tool: DrawingTool;
    color: string;
    width: number;
    points: {
        x: number;
        y: number;
    }[];
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
type Get = () => DrawingState & DrawingActions & {
    currentTime: number;
    duration: number;
};
export declare function createDrawingSlice(set: Set, get: Get): DrawingState & DrawingActions;
export {};
//# sourceMappingURL=drawingSlice.d.ts.map