import { describe, it, expect } from "vitest";
import {
  isHexColorValid,
  hexToRgb,
  hsvToRgb,
  oklchToRgb,
  rgbToHex,
  rgbToHsv,
  rgbToOklch,
  parseToRgb,
  parseColor,
} from "../../app/components/ui/color-picker/color.utils";

describe("Color Utilities", () => {
  describe("isHexColorValid", () => {
    it("should validate 6-digit hex colors", () => {
      expect(isHexColorValid("#ffffff")).toBe(true);
      expect(isHexColorValid("#FF0000")).toBe(true);
      expect(isHexColorValid("#123456")).toBe(true);
    });

    it("should validate 3-digit hex colors", () => {
      expect(isHexColorValid("#123")).toBe(true);
      expect(isHexColorValid("#fff")).toBe(true);
      expect(isHexColorValid("#f00")).toBe(true);
    });

    it("should validate 4-digit hex colors", () => {
      expect(isHexColorValid("#1234")).toBe(true);
      expect(isHexColorValid("#aaad")).toBe(true);
    });

    it("should reject invalid hex colors", () => {
      expect(isHexColorValid("ffffff")).toBe(false); // missing #
      expect(isHexColorValid("#gggggg")).toBe(false); // invalid chars
      expect(isHexColorValid("#12345")).toBe(false); // wrong length
      expect(isHexColorValid("#1234567")).toBe(false); // wrong length
      expect(isHexColorValid("Valid color")).toBe(false);
      expect(isHexColorValid("#Valid color")).toBe(false);
      expect(isHexColorValid("#1")).toBe(false);
      expect(isHexColorValid("#12")).toBe(false);
    });
  });

  describe("Color Conversion Functions", () => {
    it("should convert hex to RGB", () => {
      expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
      expect(hexToRgb("#fff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    });

    it("should convert RGB to hex", () => {
      expect(rgbToHex({ r: 0, g: 255, b: 0, a: 1 })).toBe("#00ff00");
    });

    it("should convert HSV to RGB", () => {
      const hsv = { h: 240, s: 1, v: 1, a: 1 };
      expect(hsvToRgb(hsv)).toEqual({ r: 0, g: 0, b: 255, a: 1 });
    });

    it("should convert RGB to HSV", () => {
      const rgb = { r: 0, g: 0, b: 255, a: 1 };
      expect(rgbToHsv(rgb)).toEqual({ h: 240, s: 1, v: 1, a: 1 });
    });

    it("should handle transparency in hex", () => {
      const rgb = hexToRgb("#ffffff00");
      expect(rgb?.a).toBe(0);
      expect(rgbToHex(rgb!)).toBe("#ffffff00");
    });

    it("should convert OKLCH to RGB", () => {
      const oklch = { l: 1, c: 0, h: 0, a: 1 }; // White
      expect(oklchToRgb(oklch)).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    });

    it("should be reversible (RGB -> HSV -> RGB)", () => {
      const originalRgb = { r: 100, g: 150, b: 200, a: 1 };
      const hsv = rgbToHsv(originalRgb);
      const secondRgb = hsvToRgb(hsv);
      expect(secondRgb).toEqual(originalRgb);
    });

    it("should be reversible (RGB -> OKLCH -> RGB)", () => {
      const originalRgb = { r: 200, g: 50, b: 100, a: 1 };
      const oklch = rgbToOklch(originalRgb);
      const secondRgb = oklchToRgb(oklch);
      expect(secondRgb.r).toBeCloseTo(originalRgb.r, 0);
      expect(secondRgb.g).toBeCloseTo(originalRgb.g, 0);
      expect(secondRgb.b).toBeCloseTo(originalRgb.b, 0);
    });

    it("should parse various inputs to RGB", () => {
      expect(parseToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
      expect(parseToRgb({ r: 0, g: 255, b: 0, a: 1 })).toEqual({
        r: 0,
        g: 255,
        b: 0,
        a: 1,
      });
      expect(parseToRgb({ h: 240, s: 1, v: 1, a: 1 })).toEqual({
        r: 0,
        g: 0,
        b: 255,
        a: 1,
      });
    });

    it("should return fallback for invalid color instead of throwing", () => {
      // @ts-expect-error - testing invalid input
      expect(parseToRgb({ x: 1 })).toBeNull();
    });

    it("should support parseColor convenience function", () => {
      const colorValue = parseColor("#000");
      expect(colorValue.hex).toBe("#000000");
      expect(colorValue.rgb).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    });
  });
});
