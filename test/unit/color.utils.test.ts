import { describe, it, expect } from "vitest";
import {
  hexToRgb,
  hsvToHex,
  hsvToRgb,
  isHexColorValid,
  oklchToRgb,
  parseColor,
  rgbToHex,
  rgbToHsv,
  rgbToOklch,
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
      expect(isHexColorValid("#12345")).toBe(false);
      expect(isHexColorValid("#1234567")).toBe(false);
    });
  });

  describe("hexToRgb", () => {
    it("should convert 6-digit hex to RGB", () => {
      expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
      expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
      expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0, a: 1 });
      expect(hexToRgb("#00000000")).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    });

    it("should convert 3-digit hex to RGB", () => {
      expect(hexToRgb("#fff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
      expect(hexToRgb("#f00")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it("should return null for invalid hex", () => {
      expect(hexToRgb("invalid")).toBeNull();
    });
  });

  describe("rgbToHex", () => {
    it("should convert RGB to hex", () => {
      expect(rgbToHex({ r: 255, g: 255, b: 255, a: 1 })).toBe("#ffffff");
      expect(rgbToHex({ r: 255, g: 0, b: 0, a: 1 })).toBe("#ff0000");
      expect(rgbToHex({ r: 0, g: 0, b: 0, a: 1 })).toBe("#000000");
    });

    it("should handle transparency", () => {
      expect(rgbToHex({ r: 255, g: 255, b: 255, a: 0 })).toBe("#00000000");
    });
  });

  describe("HSV Conversions", () => {
    it("should convert RGB to HSV", () => {
      const red = { r: 255, g: 0, b: 0, a: 1 };
      const hsv = rgbToHsv(red);
      expect(hsv.h).toBe(0);
      expect(hsv.s).toBe(1);
      expect(hsv.v).toBe(1);
    });

    it("should convert HSV to RGB", () => {
      const hsv = { h: 120, s: 1, v: 1, a: 1 }; // Pure Green
      const rgb = hsvToRgb(hsv);
      expect(rgb).toEqual({ r: 0, g: 255, b: 0, a: 1 });
    });

    it("should be reversible (RGB -> HSV -> RGB)", () => {
      const originalRgb = { r: 100, g: 150, b: 200, a: 1 };
      const hsv = rgbToHsv(originalRgb);
      const resultingRgb = hsvToRgb(hsv);
      expect(resultingRgb).toEqual(originalRgb);
    });

    it("should convert HSV to Hex", () => {
      expect(hsvToHex({ h: 0, s: 1, v: 1, a: 1 })).toBe("#ff0000");
    });
  });

  describe("OKLCH Conversions", () => {
    it("should convert RGB to OKLCH", () => {
      const white = { r: 255, g: 255, b: 255, a: 1 };
      const oklch = rgbToOklch(white);
      expect(oklch.l).toBeCloseTo(1, 4);
      expect(oklch.c).toBeCloseTo(0, 4);
    });

    it("should convert OKLCH to RGB", () => {
      const oklch = { l: 1, c: 0, h: 0, a: 1 }; // White
      const rgb = oklchToRgb(oklch);
      expect(rgb).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    });

    it("should be reversible (RGB -> OKLCH -> RGB)", () => {
      const originalRgb = { r: 200, g: 50, b: 100, a: 1 };
      const oklch = rgbToOklch(originalRgb);
      const resultingRgb = oklchToRgb(oklch);
      expect(resultingRgb.r).toBeCloseTo(originalRgb.r, 0);
      expect(resultingRgb.g).toBeCloseTo(originalRgb.g, 0);
      expect(resultingRgb.b).toBeCloseTo(originalRgb.b, 0);
    });
  });

  describe("parseColor", () => {
    it("should parse hex string", () => {
      const parsed = parseColor("#ff0000");
      expect(parsed).not.toBeNull();
      expect(parsed?.hex).toBe("#ff0000");
      expect(parsed?.rgb).toEqual({ r: 255, g: 0, b: 0, a: 1 });
      expect(parsed?.hsv).toBeDefined();
      expect(parsed?.oklch).toBeDefined();
    });

    it("should parse RGB object", () => {
      const rgb = { r: 0, g: 255, b: 0, a: 1 };
      const parsed = parseColor(rgb);
      expect(parsed?.hex).toBe("#00ff00");
      expect(parsed?.rgb).toEqual(rgb);
    });

    it("should parse HSV object", () => {
      const hsv = { h: 240, s: 1, v: 1, a: 1 }; // Blue
      const parsed = parseColor(hsv);
      expect(parsed?.hex).toBe("#0000ff");
      expect(parsed?.hsv).toEqual(hsv);
    });

    it("should parse OKLCH object", () => {
      const oklch = { l: 0.5, c: 0.1, h: 200, a: 1 };
      const parsed = parseColor(oklch);
      expect(parsed?.oklch).toEqual(oklch);
      expect(parsed?.hex).toBeDefined();
      expect(parsed?.rgb).toBeDefined();
    });

    it("should return null for invalid input", () => {
      // @ts-expect-error - testing invalid input
      expect(parseColor({ x: 1 })).toBeNull();
    });
  });
});
