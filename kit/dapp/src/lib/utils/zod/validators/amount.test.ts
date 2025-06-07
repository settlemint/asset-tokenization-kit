import { describe, expect, it } from "bun:test";
import { amount, getAmount, isAmount } from "./amount";

describe("amount", () => {
  describe("basic validation", () => {
    const validator = amount();

    it("should accept positive numbers", () => {
      expect(validator.parse(1)).toBe(getAmount(1));
      expect(validator.parse(100)).toBe(getAmount(100));
      expect(validator.parse(999.99)).toBe(getAmount(999.99));
    });

    it("should accept very small positive numbers", () => {
      expect(validator.parse(0.000001)).toBe(getAmount(0.000001));
      expect(validator.parse(Number.EPSILON)).toBe(getAmount(Number.EPSILON));
    });

    it("should reject zero by default", () => {
      expect(() => validator.parse(0)).toThrow(
        `Amount must be at least ${Number.EPSILON}`
      );
    });

    it("should reject negative numbers", () => {
      expect(() => validator.parse(-1)).toThrow(
        `Amount must be at least ${Number.EPSILON}`
      );
      expect(() => validator.parse(-0.01)).toThrow(
        `Amount must be at least ${Number.EPSILON}`
      );
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
      expect(validator.parse(10)).toBe(getAmount(10));
      expect(validator.parse(500)).toBe(getAmount(500));
      expect(validator.parse(1000)).toBe(getAmount(1000));
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

  describe("with decimal precision", () => {
    const validator = amount({ decimals: 2 });

    it("should accept values with valid decimal places", () => {
      expect(validator.parse(10)).toBe(getAmount(10));
      expect(validator.parse(10.5)).toBe(getAmount(10.5));
      expect(validator.parse(10.99)).toBe(getAmount(10.99));
    });

    it("should reject values with too many decimal places", () => {
      expect(() => validator.parse(10.999)).toThrow(
        "Amount cannot have more than 2 decimal places"
      );
      expect(() => validator.parse(10.12345)).toThrow(
        "Amount cannot have more than 2 decimal places"
      );
    });

    it("should handle minimum based on decimals", () => {
      expect(validator.parse(0.01)).toBe(getAmount(0.01));
      expect(() => validator.parse(0.009)).toThrow(
        "Amount must be at least 0.01"
      );
    });
  });

  describe("with allowZero option", () => {
    const validator = amount({ allowZero: true });

    it("should accept zero", () => {
      expect(validator.parse(0)).toBe(getAmount(0));
    });

    it("should still accept positive numbers", () => {
      expect(validator.parse(1)).toBe(getAmount(1));
      expect(validator.parse(100)).toBe(getAmount(100));
    });

    it("should still reject negative numbers", () => {
      expect(() => validator.parse(-1)).toThrow("Amount must be at least 0");
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
