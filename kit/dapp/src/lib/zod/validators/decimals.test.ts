import { describe, expect, it } from "bun:test";
import { decimals } from "./decimals";

describe("decimals", () => {
  const validator = decimals();

  describe("valid decimal values", () => {
    it("should accept zero", () => {
      expect(validator.parse(0)).toBe(0);
    });

    it("should accept common decimal values", () => {
      expect(validator.parse(2)).toBe(2); // Common for fiat
      expect(validator.parse(6)).toBe(6); // USDC
      expect(validator.parse(8)).toBe(8); // BTC
      expect(validator.parse(18)).toBe(18); // ETH and most ERC20s
    });

    it("should accept all values from 0 to 18", () => {
      for (let i = 0; i <= 18; i++) {
        expect(validator.parse(i)).toBe(i);
      }
    });
  });

  describe("invalid decimal values", () => {
    it("should reject negative numbers", () => {
      expect(() => validator.parse(-1)).toThrow("Decimals cannot be negative");
      expect(() => validator.parse(-18)).toThrow("Decimals cannot be negative");
    });

    it("should reject values greater than 18", () => {
      expect(() => validator.parse(19)).toThrow(
        "Decimals cannot exceed 18 (ERC20 standard maximum)"
      );
      expect(() => validator.parse(20)).toThrow(
        "Decimals cannot exceed 18 (ERC20 standard maximum)"
      );
      expect(() => validator.parse(100)).toThrow(
        "Decimals cannot exceed 18 (ERC20 standard maximum)"
      );
    });

    it("should reject non-integer values", () => {
      expect(() => validator.parse(2.5)).toThrow(
        "Decimals must be a whole number (integer)"
      );
      expect(() => validator.parse(6.1)).toThrow(
        "Decimals must be a whole number (integer)"
      );
      expect(() => validator.parse(17.99)).toThrow(
        "Decimals must be a whole number (integer)"
      );
    });

    it("should reject non-numeric string types", () => {
      expect(() => validator.parse("abc")).toThrow();
      expect(() => validator.parse("")).toThrow();
      expect(() => validator.parse("2.5")).toThrow();
      expect(() => validator.parse("1e2")).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    it("should accept numeric strings", () => {
      expect(validator.parse("0")).toBe(0);
      expect(validator.parse("6")).toBe(6);
      expect(validator.parse("18")).toBe(18);
    });

    it("should reject special numeric values", () => {
      expect(() => validator.parse(Number.NaN)).toThrow();
      expect(() => validator.parse(Infinity)).toThrow();
      expect(() => validator.parse(-Infinity)).toThrow();
    });
  });

  describe("safeParse", () => {
    it("should return success for valid decimals", () => {
      const result = validator.safeParse(6);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(6);
      }
    });

    it("should return error for invalid decimals", () => {
      const result = validator.safeParse(19);
      expect(result.success).toBe(false);
    });
  });

  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse(8);
      // Test that the type is correctly inferred
      expect(result).toBe(8);
    });
  });
});
