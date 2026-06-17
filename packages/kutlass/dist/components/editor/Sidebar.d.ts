export type Tool = "trim" | "crop" | "finetune" | "filter" | "annotate" | "sticker" | "resize" | "voice";
interface SidebarProps {
    activeTool: Tool;
    onToolChange: (tool: Tool) => void;
    /** Render as a horizontal bar (mobile) instead of a vertical sidebar */
    horizontal?: boolean;
}
export declare function Sidebar({ activeTool, onToolChange, horizontal }: SidebarProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=Sidebar.d.ts.map