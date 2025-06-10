import { describe, expect, it } from "bun:test";
import { decimals, getDecimals, isDecimals, type Decimals } from "./decimals";

describe("decimals", () => {
  const validator = decimals();

  describe("valid decimal values", () => {
    it("should accept zero", () => {
      expect(validator.parse(0)).toBe(getDecimals(0));
      expect(isDecimals(0)).toBe(true);
      expect(getDecimals(0)).toBe(getDecimals(0));
    });

    it("should accept common decimal values", () => {
      expect(validator.parse(2)).toBe(getDecimals(2)); // Common for fiat
      expect(validator.parse(6)).toBe(getDecimals(6)); // USDC
      expect(validator.parse(8)).toBe(getDecimals(8)); // BTC
      expect(validator.parse(18)).toBe(getDecimals(18)); // ETH and most ERC20s

      expect(isDecimals(2)).toBe(true);
      expect(isDecimals(6)).toBe(true);
      expect(isDecimals(8)).toBe(true);
      expect(isDecimals(18)).toBe(true);

      expect(getDecimals(2)).toBe(getDecimals(2));
      expect(getDecimals(6)).toBe(getDecimals(6));
      expect(getDecimals(8)).toBe(getDecimals(8));
      expect(getDecimals(18)).toBe(getDecimals(18));
    });

    it("should accept all values from 0 to 18", () => {
      for (let i = 0; i <= 18; i++) {
        expect(validator.parse(i)).toBe(getDecimals(i));
        expect(isDecimals(i)).toBe(true);
        expect(getDecimals(i)).toBe(getDecimals(i));
      }
    });
  });

  describe("invalid decimal values", () => {
    it("should reject negative numbers", () => {
      expect(() => validator.parse(-1)).toThrow("Decimals cannot be negative");
      expect(() => validator.parse(-18)).toThrow("Decimals cannot be negative");

      expect(isDecimals(-1)).toBe(false);
      expect(isDecimals(-18)).toBe(false);

      expect(() => getDecimals(-1)).toThrow("Decimals cannot be negative");
      expect(() => getDecimals(-18)).toThrow("Decimals cannot be negative");
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

      expect(isDecimals(19)).toBe(false);
      expect(isDecimals(20)).toBe(false);
      expect(isDecimals(100)).toBe(false);

      expect(() => getDecimals(19)).toThrow(
        "Decimals cannot exceed 18 (ERC20 standard maximum)"
      );
      expect(() => getDecimals(20)).toThrow(
        "Decimals cannot exceed 18 (ERC20 standard maximum)"
      );
      expect(() => getDecimals(100)).toThrow(
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

      expect(isDecimals(2.5)).toBe(false);
      expect(isDecimals(6.1)).toBe(false);
      expect(isDecimals(17.99)).toBe(false);

      expect(() => getDecimals(2.5)).toThrow(
        "Decimals must be a whole number (integer)"
      );
      expect(() => getDecimals(6.1)).toThrow(
        "Decimals must be a whole number (integer)"
      );
      expect(() => getDecimals(17.99)).toThrow(
        "Decimals must be a whole number (integer)"
      );
    });

    it("should reject non-numeric types", () => {
      expect(() => validator.parse("6")).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();

      expect(isDecimals("6")).toBe(false);
      expect(isDecimals(null)).toBe(false);
      expect(isDecimals(undefined)).toBe(false);
      expect(isDecimals({})).toBe(false);

      expect(() => getDecimals("6")).toThrow(
        "Expected number, received string"
      );
      expect(() => getDecimals(null)).toThrow("Expected number, received null");
      expect(() => getDecimals(undefined)).toThrow("Required");
      expect(() => getDecimals({})).toThrow("Expected number, received object");
    });

    it("should reject special numeric values", () => {
      expect(() => validator.parse(NaN)).toThrow();
      expect(() => validator.parse(Infinity)).toThrow();
      expect(() => validator.parse(-Infinity)).toThrow();

      expect(isDecimals(NaN)).toBe(false);
      expect(isDecimals(Infinity)).toBe(false);
      expect(isDecimals(-Infinity)).toBe(false);

      expect(() => getDecimals(NaN)).toThrow("Expected number, received nan");
      expect(() => getDecimals(Infinity)).toThrow(
        "Decimals must be a whole number (integer)"
      );
      expect(() => getDecimals(-Infinity)).toThrow(
        "Decimals cannot be negative"
      );
    });
  });

  describe("safeParse", () => {
    it("should return success for valid decimals", () => {
      const result = validator.safeParse(6);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(getDecimals(6));
      }
    });

    it("should return error for invalid decimals", () => {
      const result = validator.safeParse(19);
      expect(result.success).toBe(false);
    });
  });

  describe("helper functions", () => {
    it("isDecimals should work as type guard", () => {
      const value: unknown = 6;
      if (isDecimals(value)) {
        // TypeScript should recognize value as Decimals here
        const _typeCheck: Decimals = value;
      }
    });

    it("getDecimals should return typed value", () => {
      const result = getDecimals(8);
      // TypeScript should recognize result as Decimals
      const _typeCheck: Decimals = result;
      expect(result).toBe(getDecimals(8));
    });
  });
});
