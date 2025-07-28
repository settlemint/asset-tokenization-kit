import { describe, expect, it } from "vitest";
import {
  basisPoints,
  basisPointsToDecimal,
  basisPointsToPercentage,
  getBasisPoints,
  isBasisPoints,
} from "./basis-points";

describe("basisPoints", () => {
  describe("basic validation", () => {
    const validator = basisPoints();

    it("should accept valid basis points", () => {
      expect(validator.parse(0)).toBe(0);
      expect(validator.parse(100)).toBe(100);
      expect(validator.parse(1000)).toBe(1000);
      expect(validator.parse(5000)).toBe(5000);
      expect(validator.parse(10_000)).toBe(10_000);
    });

    it("should reject negative values", () => {
      expect(() => validator.parse(-1)).toThrow(
        "Basis points cannot be negative"
      );
      expect(() => validator.parse(-100)).toThrow(
        "Basis points cannot be negative"
      );
    });

    it("should reject values above 10000", () => {
      expect(() => validator.parse(10_001)).toThrow(
        "Basis points cannot exceed 10000 (100%)"
      );
      expect(() => validator.parse(20_000)).toThrow(
        "Basis points cannot exceed 10000 (100%)"
      );
    });

    it("should reject non-integer values", () => {
      expect(() => validator.parse(100.5)).toThrow(
        "Basis points must be an integer"
      );
      expect(() => validator.parse(0.1)).toThrow(
        "Basis points must be an integer"
      );
      expect(() => validator.parse(999.99)).toThrow(
        "Basis points must be an integer"
      );
    });

    it("should reject non-numeric types", () => {
      expect(() => validator.parse("100")).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
      expect(() => validator.parse([])).toThrow();
      expect(() => validator.parse(true)).toThrow();
    });

    it("should reject NaN and Infinity", () => {
      expect(() => validator.parse(Number.NaN)).toThrow();
      expect(() => validator.parse(Infinity)).toThrow();
      expect(() => validator.parse(-Infinity)).toThrow();
    });
  });

  describe("helper functions", () => {
    describe("isBasisPoints", () => {
      it("should return true for valid basis points", () => {
        expect(isBasisPoints(0)).toBe(true);
        expect(isBasisPoints(250)).toBe(true);
        expect(isBasisPoints(10_000)).toBe(true);
      });

      it("should return false for invalid values", () => {
        expect(isBasisPoints(-1)).toBe(false);
        expect(isBasisPoints(10_001)).toBe(false);
        expect(isBasisPoints(100.5)).toBe(false);
        expect(isBasisPoints("100")).toBe(false);
        expect(isBasisPoints(null)).toBe(false);
      });
    });

    describe("getBasisPoints", () => {
      it("should return valid basis points", () => {
        expect(getBasisPoints(250)).toBe(250);
        expect(getBasisPoints(0)).toBe(0);
        expect(getBasisPoints(10_000)).toBe(10_000);
      });

      it("should throw for invalid values", () => {
        expect(() => getBasisPoints(10_001)).toThrow();
        expect(() => getBasisPoints(-1)).toThrow();
        expect(() => getBasisPoints(100.5)).toThrow();
      });
    });

    describe("basisPointsToDecimal", () => {
      it("should convert to decimal correctly", () => {
        expect(basisPointsToDecimal(0)).toBe(0);
        expect(basisPointsToDecimal(100)).toBe(0.01);
        expect(basisPointsToDecimal(250)).toBe(0.025);
        expect(basisPointsToDecimal(1000)).toBe(0.1);
        expect(basisPointsToDecimal(5000)).toBe(0.5);
        expect(basisPointsToDecimal(10_000)).toBe(1);
      });
    });

    describe("basisPointsToPercentage", () => {
      it("should convert to percentage correctly", () => {
        expect(basisPointsToPercentage(0)).toBe(0);
        expect(basisPointsToPercentage(100)).toBe(1);
        expect(basisPointsToPercentage(250)).toBe(2.5);
        expect(basisPointsToPercentage(1000)).toBe(10);
        expect(basisPointsToPercentage(5000)).toBe(50);
        expect(basisPointsToPercentage(10_000)).toBe(100);
      });
    });
  });

  describe("edge cases", () => {
    const validator = basisPoints();

    it("should handle boundary values", () => {
      expect(validator.parse(0)).toBe(0);
      expect(validator.parse(10_000)).toBe(10_000);
    });

    it("should handle safeParse", () => {
      const validResult = validator.safeParse(250);
      expect(validResult.success).toBe(true);
      if (validResult.success) {
        expect(validResult.data).toBe(250);
      }

      const invalidResult = validator.safeParse(10_001);
      expect(invalidResult.success).toBe(false);
    });
  });
});
