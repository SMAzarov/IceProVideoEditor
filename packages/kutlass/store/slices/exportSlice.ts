import { DEFAULT_EXPORT_SETTINGS, ExportSettings, ExportStatus } from "@/types/editor";

export interface ExportState {
  status: ExportStatus;
  progress: number; // 0-100
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

export const createExportSlice = (
  set: (fn: (state: ExportState & ExportActions) => Partial<ExportState & ExportActions>) => void
): ExportState & ExportActions => ({
  status: "idle",
  progress: 0,
  outputUrl: null,
  error: null,
  settings: DEFAULT_EXPORT_SETTINGS,

  setExportStatus: (status) => set(() => ({ status })),
  setExportProgress: (progress) => set(() => ({ progress })),
  setOutputUrl: (outputUrl) => set(() => ({ outputUrl })),
  setExportError: (error) => set(() => ({ error })),
  updateExportSettings: (settings) =>
    set((state) => ({ settings: { ...state.settings, ...settings } })),
  resetExport: () =>
    set(() => ({ status: "idle", progress: 0, outputUrl: null, error: null })),
});
