import { describe, expect, it } from "bun:test";
import { price } from "./price";

describe("price", () => {
  const validator = price();

  describe("valid prices", () => {
    it("should accept valid positive numbers", () => {
      const price1 = validator.parse(100.5);
      const price2 = validator.parse(0.01);
      const price3 = validator.parse(999_999.99);
      const price4 = validator.parse(1);

      expect(price1).toBe(100.5);
      expect(price2).toBe(0.01);
      expect(price3).toBe(999_999.99);
      expect(price4).toBe(1);
    });

    it("should accept prices with up to 4 decimal places", () => {
      const price1 = validator.parse(100.1234);
      const price2 = validator.parse(0.0001);

      expect(price1).toBe(100.1234);
      expect(price2).toBe(0.0001);
    });
  });

  describe("invalid prices", () => {
    it("should reject zero", () => {
      expect(() => validator.parse(0)).toThrow(
        "Price must be greater than zero"
      );
    });

    it("should reject negative prices", () => {
      expect(() => validator.parse(-1)).toThrow(
        "Price must be greater than zero"
      );
      expect(() => validator.parse(-0.01)).toThrow(
        "Price must be greater than zero"
      );
      expect(() => validator.parse(-999.99)).toThrow(
        "Price must be greater than zero"
      );
    });

    it("should reject prices with more than 4 decimal places", () => {
      expect(() => validator.parse(1.123_45)).toThrow(
        "Price cannot have more than 4 decimal places"
      );
      expect(() => validator.parse(0.000_01)).toThrow(
        "Price cannot have more than 4 decimal places"
      );
      expect(() => validator.parse(99.999_99)).toThrow(
        "Price cannot have more than 4 decimal places"
      );
    });

    it("should reject non-finite numbers", () => {
      expect(() => validator.parse(Infinity)).toThrow();
      expect(() => validator.parse(-Infinity)).toThrow();
      expect(() => validator.parse(Number.NaN)).toThrow();
    });

    it("should reject non-numeric string types", () => {
      expect(() => validator.parse("abc")).toThrow();
      expect(() => validator.parse("")).toThrow();
      expect(() => validator.parse("not a number")).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    it("should accept numeric strings", () => {
      expect(validator.parse("100")).toBe(100);
      expect(validator.parse("100.50")).toBe(100.5);
      expect(validator.parse("0.0001")).toBe(0.0001);
      expect(validator.parse("1234.5678")).toBe(1234.5678);
    });
  });

  describe("common price formats", () => {
    it("should handle common currency formats", () => {
      expect(validator.parse(19.99)).toBe(19.99); // Common retail price
      expect(validator.parse(0.99)).toBe(0.99); // Sub-dollar price
      expect(validator.parse(1000)).toBe(1000); // Round number
      expect(validator.parse(1234.56)).toBe(1234.56); // Standard 2 decimals
    });

    it("should handle financial market prices", () => {
      expect(validator.parse(123.45)).toBe(123.45); // Stock price
      expect(validator.parse(1.2345)).toBe(1.2345); // Forex rate
      expect(validator.parse(0.0025)).toBe(0.0025); // Basis points
    });
  });

  describe("safeParse", () => {
    it("should return success for valid price", () => {
      const result = validator.safeParse(100.5);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(100.5);
      }
    });

    it("should return error for invalid price", () => {
      const result = validator.safeParse(-100);
      expect(result.success).toBe(false);
    });
  });

  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse(100.5);
      // Test that the type is correctly inferred
      expect(result).toBe(100.5);
    });

    it("should handle safeParse", () => {
      const result = validator.safeParse(999.99);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(999.99);
      }
    });
  });
});
