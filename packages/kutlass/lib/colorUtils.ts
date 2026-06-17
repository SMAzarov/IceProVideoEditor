/** Convert a hex color string to an RGB tuple */
export function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

/** Calculate relative luminance (WCAG standard) */
export function luminance(r: number, g: number, b: number) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** Derive accent CSS variable overrides from a hex color and theme */
export function deriveAccentVars(hex: string, isDark: boolean): Record<string, string> {
  const rgb = hexToRgb(hex);
  if (!rgb) return {};
  const [r, g, b] = rgb;
  const lum = luminance(r, g, b);
  const textColor = lum > 0.4 ? "#18181b" : "#ffffff";
  // Derive hover: lighten in dark mode, darken in light mode
  const factor = isDark ? 1.15 : 0.85;
  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)));
  const hoverHex = `#${[r, g, b].map((c) => clamp(c * factor).toString(16).padStart(2, "0")).join("")}`;

  return {
    "accent": hex,
    "accent-hover": hoverHex,
    "accent-text": textColor,
    "accent-subtle-bg": `rgba(${r}, ${g}, ${b}, ${isDark ? 0.15 : 0.12})`,
    "accent-subtle-border": `rgba(${r}, ${g}, ${b}, ${isDark ? 0.4 : 0.35})`,
    "accent-strong-border": `rgba(${r}, ${g}, ${b}, ${isDark ? 0.9 : 0.8})`,
  };
}
