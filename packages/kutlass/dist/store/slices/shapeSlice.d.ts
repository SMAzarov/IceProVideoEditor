import { ShapeAnnotation, ShapeType, ShapeStyle } from "@/types/editor";
export interface ShapeState {
    shapes: ShapeAnnotation[];
    selectedShapeId: string | null;
    shapeTool: ShapeType;
    shapeStyle: ShapeStyle;
    shapeColor: string;
    shapeFillColor: string;
    shapeStrokeWidth: number;
    shapeText: string;
    shapeFontSize: number;
    shapeDuration: number;
    annotateMode: "draw" | "shape";
}
export interface ShapeActions {
    addShape: (shape: Omit<ShapeAnnotation, "id" | "startTime" | "endTime">) => string;
    updateShape: (id: string, updates: Partial<ShapeAnnotation>) => void;
    removeShape: (id: string) => void;
    selectShape: (id: string | null) => void;
    clearShapes: () => void;
    setShapeTool: (tool: ShapeType) => void;
    setShapeStyle: (style: ShapeStyle) => void;
    setShapeColor: (color: string) => void;
    setShapeFillColor: (color: string) => void;
    setShapeStrokeWidth: (width: number) => void;
    setShapeText: (text: string) => void;
    setShapeFontSize: (size: number) => void;
    setShapeDuration: (duration: number) => void;
    setAnnotateMode: (mode: "draw" | "shape") => void;
}
type Set = (fn: (s: ShapeState & ShapeActions) => Partial<ShapeState & ShapeActions>) => void;
type Get = () => ShapeState & ShapeActions & {
    currentTime: number;
};
export declare const createShapeSlice: (set: Set, get: Get) => ShapeState & ShapeActions;
export {};
//# sourceMappingURL=shapeSlice.d.ts.map