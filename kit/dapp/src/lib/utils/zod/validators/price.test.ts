import { describe, expect, it } from "bun:test";
import { getPrice, isPrice, price, type Price } from "./price";

describe("price", () => {
  const validator = price();

  describe("valid prices", () => {
    it("should accept valid positive numbers", () => {
      const price1 = validator.parse(100.5);
      const price2 = validator.parse(0.01);
      const price3 = validator.parse(999999.99);
      const price4 = validator.parse(1);

      expect(price1).toBe(getPrice(100.5));
      expect(price2).toBe(getPrice(0.01));
      expect(price3).toBe(getPrice(999999.99));
      expect(price4).toBe(getPrice(1));
    });

    it("should accept prices with up to 4 decimal places", () => {
      const price1 = validator.parse(100.1234);
      const price2 = validator.parse(0.0001);

      expect(price1).toBe(getPrice(100.1234));
      expect(price2).toBe(getPrice(0.0001));
    });
  });

  describe("invalid prices", () => {
    it("should reject zero", () => {
      expect(() => validator.parse(0)).toThrow("Price must be greater than zero");
    });

    it("should reject negative prices", () => {
      expect(() => validator.parse(-1)).toThrow("Price must be greater than zero");
      expect(() => validator.parse(-0.01)).toThrow("Price must be greater than zero");
      expect(() => validator.parse(-999.99)).toThrow("Price must be greater than zero");
    });

    it("should reject prices with more than 4 decimal places", () => {
      expect(() => validator.parse(1.12345)).toThrow(
        "Price cannot have more than 4 decimal places"
      );
      expect(() => validator.parse(0.00001)).toThrow(
        "Price cannot have more than 4 decimal places"
      );
      expect(() => validator.parse(99.99999)).toThrow(
        "Price cannot have more than 4 decimal places"
      );
    });

    it("should reject non-finite numbers", () => {
      expect(() => validator.parse(Infinity)).toThrow();
      expect(() => validator.parse(-Infinity)).toThrow();
      expect(() => validator.parse(NaN)).toThrow();
    });

    it("should reject non-numeric types", () => {
      expect(() => validator.parse("100")).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });
  });

  describe("common price formats", () => {
    it("should handle common currency formats", () => {
      expect(validator.parse(19.99) as number).toBe(19.99); // Common retail price
      expect(validator.parse(0.99) as number).toBe(0.99); // Sub-dollar price
      expect(validator.parse(1000) as number).toBe(1000); // Round number
      expect(validator.parse(1234.56) as number).toBe(1234.56); // Standard 2 decimals
    });

    it("should handle financial market prices", () => {
      expect(validator.parse(123.45) as number).toBe(123.45); // Stock price
      expect(validator.parse(1.2345) as number).toBe(1.2345); // Forex rate
      expect(validator.parse(0.0025) as number).toBe(0.0025); // Basis points
    });
  });

  describe("safeParse", () => {
    it("should return success for valid price", () => {
      const result = validator.safeParse(100.5);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(getPrice(100.5));
      }
    });

    it("should return error for invalid price", () => {
      const result = validator.safeParse(-100);
      expect(result.success).toBe(false);
    });
  });
});

describe("helper functions", () => {
  describe("isPrice", () => {
    it("should return true for valid prices", () => {
      expect(isPrice(100.5)).toBe(true);
      expect(isPrice(0.01)).toBe(true);
      expect(isPrice(999999.99)).toBe(true);
      expect(isPrice(1)).toBe(true);
      expect(isPrice(100.1234)).toBe(true);
      expect(isPrice(0.0001)).toBe(true);
    });

    it("should return false for invalid prices", () => {
      expect(isPrice(0)).toBe(false); // zero
      expect(isPrice(-1)).toBe(false); // negative
      expect(isPrice(-0.01)).toBe(false);
      expect(isPrice(1.12345)).toBe(false); // too many decimals
      expect(isPrice(Infinity)).toBe(false);
      expect(isPrice(-Infinity)).toBe(false);
      expect(isPrice(NaN)).toBe(false);
      expect(isPrice("100")).toBe(false); // string
      expect(isPrice(null)).toBe(false);
      expect(isPrice(undefined)).toBe(false);
      expect(isPrice({})).toBe(false);
    });

    it("should return valid prices when input is valid", () => {
      const validPrice = 100.5;
      const result = getPrice(validPrice);
      expect(typeof result).toBe("number");
    });

    it("should throw for invalid prices", () => {
      expect(() => getPrice(0)).toThrow("Price must be greater than zero");
      expect(() => getPrice(-1)).toThrow("Price must be greater than zero");
      expect(() => getPrice(-0.01)).toThrow("Price must be greater than zero");
      expect(() => getPrice(1.12345)).toThrow("Price cannot have more than 4 decimal places");
      expect(() => getPrice(Infinity)).toThrow("Price must be a finite number");
      expect(() => getPrice(-Infinity)).toThrow("Price must be a finite number");
      expect(() => getPrice(NaN)).toThrow("Expected number, received nan");
      expect(() => getPrice("100")).toThrow("Expected number, received string");
      expect(() => getPrice(null)).toThrow("Expected number, received null");
      expect(() => getPrice(undefined)).toThrow("Required");
      expect(() => getPrice({})).toThrow("Expected number, received object");
    });

    it("isPrice should work as type guard", () => {
      const value: unknown = 100.5;
      if (isPrice(value)) {
        // TypeScript should recognize value as Price here
        const _typeCheck: Price = value;
      }
    });

    it("getPrice should return typed value", () => {
      const validPrice = 999.99;
      const result = getPrice(validPrice);
      // TypeScript should recognize result as Price
      const _typeCheck: Price = result;
      expect(typeof result).toBe("number");
    });
  });
});
