import { ExportSettings, ExportStatus } from "@/types/editor";
export interface ExportState {
    status: ExportStatus;
    progress: number;
    outputUrl: string | null;
    error: string | null;
    settings: ExportSettings;
}
export interface ExportActions {
    setExportStatus: (status: ExportStatus) => void;
    setExportProgress: (progress: number) => void;
    setOutputUrl: (url: string | null) => void;
    setExportError: (error: string | null) => void;
    updateExportSettings: (settings: Partial<ExportSettings>) => void;
    resetExport: () => void;
}
export declare const createExportSlice: (set: (fn: (state: ExportState & ExportActions) => Partial<ExportState & ExportActions>) => void) => ExportState & ExportActions;
//# sourceMappingURL=exportSlice.d.ts.map