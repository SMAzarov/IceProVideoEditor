/** Convert a hex color string to an RGB tuple */
export declare function hexToRgb(hex: string): [number, number, number] | null;
/** Calculate relative luminance (WCAG standard) */
export declare function luminance(r: number, g: number, b: number): number;
/** Derive accent CSS variable overrides from a hex color and theme */
export declare function deriveAccentVars(hex: string, isDark: boolean): Record<string, string>;
//# sourceMappingURL=colorUtils.d.ts.map