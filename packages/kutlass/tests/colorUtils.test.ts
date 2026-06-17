import { describe, it, expect } from "vitest";
import { hexToRgb, luminance, deriveAccentVars } from "@/lib/colorUtils";

describe("hexToRgb", () => {
  it("parses a valid hex color", () => {
    expect(hexToRgb("#ff8800")).toEqual([255, 136, 0]);
  });

  it("handles hex without #", () => {
    expect(hexToRgb("3b82f6")).toEqual([59, 130, 246]);
  });

  it("is case-insensitive", () => {
    expect(hexToRgb("#AABBCC")).toEqual([170, 187, 204]);
  });

  it("returns null for invalid hex", () => {
    expect(hexToRgb("not-a-color")).toBeNull();
    expect(hexToRgb("#fff")).toBeNull(); // shorthand not supported
  });
});

describe("luminance", () => {
  it("returns 0 for black", () => {
    expect(luminance(0, 0, 0)).toBe(0);
  });

  it("returns 1 for white", () => {
    expect(luminance(255, 255, 255)).toBeCloseTo(1, 2);
  });

  it("returns higher luminance for lighter colors", () => {
    expect(luminance(200, 200, 200)).toBeGreaterThan(luminance(50, 50, 50));
  });
});

describe("deriveAccentVars", () => {
  it("returns empty object for invalid hex", () => {
    expect(deriveAccentVars("invalid", true)).toEqual({});
  });

  it("derives all expected keys", () => {
    const result = deriveAccentVars("#fbbf24", true);
    expect(Object.keys(result)).toEqual([
      "accent",
      "accent-hover",
      "accent-text",
      "accent-subtle-bg",
      "accent-subtle-border",
      "accent-strong-border",
    ]);
  });

  it("passes through the original hex as accent", () => {
    expect(deriveAccentVars("#3b82f6", true).accent).toBe("#3b82f6");
  });

  it("chooses dark text for light colors", () => {
    expect(deriveAccentVars("#fbbf24", true)["accent-text"]).toBe("#18181b");
  });

  it("chooses white text for dark colors", () => {
    expect(deriveAccentVars("#1e3a5f", true)["accent-text"]).toBe("#ffffff");
  });

  it("uses different opacity for dark vs light themes", () => {
    const dark = deriveAccentVars("#3b82f6", true);
    const light = deriveAccentVars("#3b82f6", false);
    expect(dark["accent-subtle-bg"]).toContain("0.15");
    expect(light["accent-subtle-bg"]).toContain("0.12");
  });
});
