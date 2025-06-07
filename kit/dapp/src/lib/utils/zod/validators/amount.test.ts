import { describe, expect, it } from "bun:test";
import { amount, getAmount, isAmount } from "./amount";

describe("amount", () => {
  describe("basic validation", () => {
    const validator = amount();

    it("should accept positive numbers", () => {
      expect(validator.parse(1)).toBe(1);
      expect(validator.parse(100)).toBe(100);
      expect(validator.parse(999.99)).toBe(999.99);
      expect(getAmount(1)).toBe(1);
      expect(getAmount(100)).toBe(100);
      expect(getAmount(999.99)).toBe(999.99);
    });

    it("should accept very small positive numbers", () => {
      expect(validator.parse(0.000001)).toBe(0.000001);
      expect(validator.parse(Number.EPSILON)).toBe(Number.EPSILON);
      expect(getAmount(0.000001)).toBe(0.000001);
      expect(getAmount(Number.EPSILON)).toBe(Number.EPSILON);
    });

    it("should accept zero by default", () => {
      expect(validator.parse(0)).toBe(0);
      expect(getAmount(0)).toBe(0);
    });

    it("should reject negative numbers", () => {
      expect(() => validator.parse(-1)).toThrow("Amount must be at least 0");
      expect(() => validator.parse(-0.01)).toThrow("Amount must be at least 0");
    });

    it("should reject non-numeric types", () => {
      expect(() => validator.parse("100")).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    it("should reject NaN", () => {
      expect(() => validator.parse(NaN)).toThrow();
    });

    it("should reject Infinity", () => {
      expect(() => validator.parse(Infinity)).toThrow();
      expect(() => validator.parse(-Infinity)).toThrow();
    });
  });

  describe("with min/max options", () => {
    const validator = amount({ min: 10, max: 1000 });

    it("should accept values within range", () => {
      expect(validator.parse(10)).toBe(10);
      expect(validator.parse(500)).toBe(500);
      expect(validator.parse(1000)).toBe(1000);
      expect(getAmount(10, { min: 10, max: 1000 })).toBe(10);
      expect(getAmount(500, { min: 10, max: 1000 })).toBe(500);
      expect(getAmount(1000, { min: 10, max: 1000 })).toBe(1000);
    });

    it("should reject values below minimum", () => {
      expect(() => validator.parse(9.99)).toThrow("Amount must be at least 10");
      expect(() => validator.parse(0)).toThrow("Amount must be at least 10");
    });

    it("should reject values above maximum", () => {
      expect(() => validator.parse(1000.01)).toThrow(
        "Amount must not exceed 1000"
      );
      expect(() => validator.parse(10000)).toThrow(
        "Amount must not exceed 1000"
      );
    });
  });

  describe("with decimals option", () => {
    const validator = amount({ decimals: 2 });

    it("should set minimum based on decimals", () => {
      expect(validator.parse(0.01)).toBe(0.01);
      expect(validator.parse(10.99)).toBe(10.99);
      expect(getAmount(0.01, { decimals: 2 })).toBe(0.01);
    });

    it("should reject values below decimal-based minimum", () => {
      expect(() => validator.parse(0.009)).toThrow(
        "Amount must be at least 0.01"
      );
      expect(() => validator.parse(0)).toThrow(
        "Amount must be at least 0.01"
      );
    });

    it("should accept any number of decimal places above minimum", () => {
      expect(validator.parse(10.999)).toBe(10.999);
      expect(validator.parse(10.12345)).toBe(10.12345);
    });
  });

});

describe("helper functions", () => {
  describe("isAmount and getAmount", () => {
    it("should correctly identify valid amounts", () => {
      expect(isAmount(100)).toBe(true);
      expect(isAmount(0.01)).toBe(true);
      expect(isAmount("not a number")).toBe(false);
      expect(isAmount(null)).toBe(false);
    });

    it("should respect options", () => {
      expect(isAmount(5, { min: 10 })).toBe(false);
      expect(isAmount(15, { min: 10 })).toBe(true);
    });

    it("should get valid amounts", () => {
      expect(getAmount(100)).toBe(100);
      expect(() => getAmount("not a number")).toThrow(
        "Expected number, received string"
      );
      expect(() => getAmount(5, { min: 10 })).toThrow(
        "Amount must be at least 10"
      );
      expect(getAmount(15, { min: 10 })).toBe(15);
    });

  });
});
