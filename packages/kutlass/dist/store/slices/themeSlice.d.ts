export type Theme = "dark" | "light";
export interface ThemeState {
    theme: Theme;
}
export interface ThemeActions {
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}
export declare const createThemeSlice: (set: (fn: (state: ThemeState & ThemeActions) => Partial<ThemeState & ThemeActions>) => void) => ThemeState & ThemeActions;
//# sourceMappingURL=themeSlice.d.ts.map