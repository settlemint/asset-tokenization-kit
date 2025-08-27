/**
 * @fileoverview Test suite for basis points validation and conversion
 * 
 * This test suite validates basis points (bps) - a unit of measure for interest rates,
 * fees, and other financial percentages where 1 basis point = 0.01% = 0.0001.
 * 
 * Test Strategy:
 * - Range Validation: 0-10000 bps (0-100%) with integer constraint
 * - Financial Precision: Integer-only to prevent fractional basis points
 * - Conversion Functions: Test bps to decimal/percentage transformations
 * - Type Safety: Branded number type for type-safe financial calculations
 * - Edge Cases: Boundary values (0, 10000), negative rejection
 * - Business Logic: Common fee structures (250 bps = 2.5%)
 * 
 * FINANCIAL: Standard unit in finance - 250 bps = 2.5% management fee
 * PRECISION: Integer constraint prevents impossible fractional basis points
 */

import { describe, expect, it } from "bun:test";
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
      // WHY: Common basis point values in finance
      expect(validator.parse(0)).toBe(0); // 0% - no fee
      expect(validator.parse(100)).toBe(100); // 1% - common trading fee
      expect(validator.parse(1000)).toBe(1000); // 10% - high yield
      expect(validator.parse(5000)).toBe(5000); // 50% - profit sharing
      expect(validator.parse(10_000)).toBe(10_000); // 100% - maximum possible
    });

    it("should reject negative values", () => {
      // FINANCIAL: Negative basis points don't represent valid fees/rates
      // WHY: Fees and interest rates are non-negative by definition
      expect(() => validator.parse(-1)).toThrow("Basis points cannot be negative");
      expect(() => validator.parse(-100)).toThrow("Basis points cannot be negative");
    });

    it("should reject values above 10000", () => {
      // LOGICAL: 10000 bps = 100%, cannot exceed total amount
      // FINANCIAL: Fees/rates above 100% are economically nonsensical
      expect(() => validator.parse(10_001)).toThrow("Basis points cannot exceed 10000 (100%)");
      expect(() => validator.parse(20_000)).toThrow("Basis points cannot exceed 10000 (100%)");
    });

    it("should reject non-integer values", () => {
      // STANDARD: Basis points are always integers by financial convention
      // WHY: 0.5 basis points is not a standard unit in finance
      expect(() => validator.parse(100.5)).toThrow("Basis points must be an integer");
      expect(() => validator.parse(0.1)).toThrow("Basis points must be an integer");
      expect(() => validator.parse(999.99)).toThrow("Basis points must be an integer");
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
        // WHY: Convert bps to decimal for mathematical calculations (multiply by principal)
        expect(basisPointsToDecimal(0)).toBe(0); // 0 bps = 0.00 decimal
        expect(basisPointsToDecimal(100)).toBe(0.01); // 100 bps = 1% = 0.01 decimal
        expect(basisPointsToDecimal(250)).toBe(0.025); // 250 bps = 2.5% = 0.025 decimal
        expect(basisPointsToDecimal(1000)).toBe(0.1); // 1000 bps = 10% = 0.1 decimal
        expect(basisPointsToDecimal(5000)).toBe(0.5); // 5000 bps = 50% = 0.5 decimal
        expect(basisPointsToDecimal(10_000)).toBe(1); // 10000 bps = 100% = 1.0 decimal
      });
    });

    describe("basisPointsToPercentage", () => {
      it("should convert to percentage correctly", () => {
        // WHY: Convert bps to human-readable percentage for display
        expect(basisPointsToPercentage(0)).toBe(0); // 0 bps = 0%
        expect(basisPointsToPercentage(100)).toBe(1); // 100 bps = 1%
        expect(basisPointsToPercentage(250)).toBe(2.5); // 250 bps = 2.5% (common mgmt fee)
        expect(basisPointsToPercentage(1000)).toBe(10); // 1000 bps = 10%
        expect(basisPointsToPercentage(5000)).toBe(50); // 5000 bps = 50%
        expect(basisPointsToPercentage(10_000)).toBe(100); // 10000 bps = 100%
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
