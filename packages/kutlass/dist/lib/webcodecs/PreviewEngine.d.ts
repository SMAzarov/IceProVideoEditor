import { Clip, EffectParams, ShapeAnnotation } from "@/types/editor";
import { FrameRenderer } from "./FrameRenderer";
declare const renderer: FrameRenderer;
export { renderer };
/** Draw shape annotations onto a canvas context */
export declare function drawShapesOnCtx(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, shapes: ShapeAnnotation[], w: number, h: number): void;
export declare function renderPreview(canvas: HTMLCanvasElement, clips: Clip[], currentTime: number, effectsMap: Record<string, EffectParams>, skipCrop?: boolean, shapes?: ShapeAnnotation[]): Promise<void>;
//# sourceMappingURL=PreviewEngine.d.ts.map