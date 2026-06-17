import { nanoid } from "nanoid";
import { ShapeAnnotation, ShapeType } from "@/types/editor";

export interface ShapeState {
  shapes: ShapeAnnotation[];
  selectedShapeId: string | null;
  shapeTool: ShapeType;
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
  setShapeColor: (color: string) => void;
  setShapeFillColor: (color: string) => void;
  setShapeStrokeWidth: (width: number) => void;
  setShapeText: (text: string) => void;
  setShapeFontSize: (size: number) => void;
  setShapeDuration: (duration: number) => void;
  setAnnotateMode: (mode: "draw" | "shape") => void;
}

type Set = (fn: (s: ShapeState & ShapeActions) => Partial<ShapeState & ShapeActions>) => void;
type Get = () => ShapeState & ShapeActions & { currentTime: number };

export const createShapeSlice = (set: Set, get: Get): ShapeState & ShapeActions => ({
  shapes: [],
  selectedShapeId: null,
  shapeTool: "rectangle",
  shapeColor: "#ff0000",
  shapeFillColor: "transparent",
  shapeStrokeWidth: 3,
  shapeText: "Text",
  shapeFontSize: 32,
  shapeDuration: 3,
  annotateMode: "draw",

  setAnnotateMode: (mode) => set(() => ({ annotateMode: mode })),

  addShape: (shape) => {
    const id = nanoid();
    const currentTime = get().currentTime ?? 0;
    const duration = get().shapeDuration ?? 3;
    set((s) => ({
      shapes: [
        ...s.shapes,
        { ...shape, id, startTime: currentTime, endTime: currentTime + duration },
      ],
    }));
    return id;
  },

  updateShape: (id, updates) =>
    set((s) => ({
      shapes: s.shapes.map((sh) => (sh.id === id ? { ...sh, ...updates } : sh)),
    })),

  removeShape: (id) =>
    set((s) => ({
      shapes: s.shapes.filter((sh) => sh.id !== id),
      selectedShapeId: s.selectedShapeId === id ? null : s.selectedShapeId,
    })),

  selectShape: (id) => set(() => ({ selectedShapeId: id })),

  clearShapes: () => set(() => ({ shapes: [], selectedShapeId: null })),

  setShapeTool: (tool) => set(() => ({ shapeTool: tool })),
  setShapeColor: (color) => set(() => ({ shapeColor: color })),
  setShapeFillColor: (color) => set(() => ({ shapeFillColor: color })),
  setShapeStrokeWidth: (width) => set(() => ({ shapeStrokeWidth: width })),
  setShapeText: (text) => set(() => ({ shapeText: text })),
  setShapeFontSize: (size) => set(() => ({ shapeFontSize: size })),
  setShapeDuration: (duration) => set(() => ({ shapeDuration: duration })),
});
