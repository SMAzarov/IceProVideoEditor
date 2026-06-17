import { type FFmpegPaths } from "./ffmpegConfig";
import type { ExportSettings } from "@/types/editor";
import type { Tool } from "@/components/editor/Sidebar";
/** Override any CSS variable used by the editor. Keys are variable names without the `--kt-` prefix. */
export type KutlassColors = Partial<Record<string, string>>;
export interface KutlassProps {
    /** CSS class name for the outer container */
    className?: string;
    /** Inline styles for the outer container */
    style?: React.CSSProperties;
    /** Color theme. Defaults to "dark". */
    theme?: "light" | "dark";
    /** Primary accent color (hex). Derives hover, subtle, and text variants automatically. */
    accent?: string;
    /** Override individual CSS variables. Keys are without the `--kt-` prefix, e.g. `{ "bg-panel": "#fff" }`. */
    colors?: KutlassColors;
    /** Which tools to show in the sidebar. Defaults to all. */
    tools?: Tool[];
    /** Default export settings (format, resolution, fps, bitrate) */
    exportSettings?: Partial<ExportSettings>;
    /** Paths to the FFmpeg WASM files served from your public directory */
    ffmpegPaths?: Partial<FFmpegPaths>;
    /**
     * Called when export finishes successfully.
     * Receives the exported video as a Blob.
     */
    onExportComplete?: (blob: Blob) => void;
}
export declare function Kutlass({ className, style, theme, accent, colors, exportSettings, ffmpegPaths, onExportComplete, }: KutlassProps): import("react").JSX.Element;
//# sourceMappingURL=Kutlass.d.ts.map