import { Clip, EffectParams } from "@/types/editor";
import { FrameRenderer } from "./FrameRenderer";
declare const renderer: FrameRenderer;
export { renderer };
export declare function renderPreview(canvas: HTMLCanvasElement, clips: Clip[], currentTime: number, effectsMap: Record<string, EffectParams>, skipCrop?: boolean): Promise<void>;
//# sourceMappingURL=PreviewEngine.d.ts.map