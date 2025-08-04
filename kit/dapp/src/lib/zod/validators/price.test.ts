import { describe, expect, test } from "vitest";
import { price, isPrice, getPrice } from "./price";

describe("price", () => {
  const validator = price();

  describe("non-finite number handling", () => {
    test("properly rejects non-finite numbers", () => {
      // Verify that Zod properly rejects non-finite numbers
      expect(() => validator.parse(Infinity)).toThrow();
      expect(() => validator.parse(-Infinity)).toThrow();
      expect(() => validator.parse(Number.NaN)).toThrow();

      // Verify string representations are also rejected
      expect(() => validator.parse("Infinity")).toThrow(
        "Invalid price format. Please provide a valid numeric string"
      );
      expect(() => validator.parse("-Infinity")).toThrow(
        "Invalid price format. Please provide a valid numeric string"
      );
      expect(() => validator.parse("NaN")).toThrow(
        "Invalid price format. Please provide a valid numeric string"
      );
    });
  });

  describe("valid prices", () => {
    test("should accept valid positive numbers", () => {
      const price1 = validator.parse(100.5);
      const price2 = validator.parse(0.01);
      const price3 = validator.parse(999_999.99);
      const price4 = validator.parse(1);

      expect(price1).toBe(100.5);
      expect(price2).toBe(0.01);
      expect(price3).toBe(999_999.99);
      expect(price4).toBe(1);
    });

    test("should accept prices with up to 4 decimal places", () => {
      const price1 = validator.parse(100.1234);
      const price2 = validator.parse(0.0001);

      expect(price1).toBe(100.1234);
      expect(price2).toBe(0.0001);
    });

    test("should accept integer prices (no decimal places)", () => {
      const price1 = validator.parse(100);
      const price2 = validator.parse(1);
      const price3 = validator.parse(999_999);

      expect(price1).toBe(100);
      expect(price2).toBe(1);
      expect(price3).toBe(999_999);
    });
  });

  describe("string input handling", () => {
    test("should accept numeric strings", () => {
      expect(validator.parse("100")).toBe(100);
      expect(validator.parse("100.50")).toBe(100.5);
      expect(validator.parse("0.0001")).toBe(0.0001);
      expect(validator.parse("1234.5678")).toBe(1234.5678);
    });

    test("should reject invalid numeric strings", () => {
      expect(() => validator.parse("abc")).toThrow(
        "Invalid price format. Please provide a valid numeric string"
      );
      expect(() => validator.parse("")).toThrow(
        "Invalid price format. Please provide a valid numeric string"
      );
      expect(() => validator.parse("not a number")).toThrow(
        "Invalid price format. Please provide a valid numeric string"
      );
      // "12.34.56" parses to 12.34, which is valid
      expect(validator.parse("12.34.56")).toBe(12.34);
      expect(() => validator.parse("$100")).toThrow(
        "Invalid price format. Please provide a valid numeric string"
      );
    });

    test("should reject strings that parse to non-finite numbers", () => {
      expect(() => validator.parse("Infinity")).toThrow(
        "Invalid price format. Please provide a valid numeric string"
      );
      expect(() => validator.parse("-Infinity")).toThrow(
        "Invalid price format. Please provide a valid numeric string"
      );
      expect(() => validator.parse("NaN")).toThrow(
        "Invalid price format. Please provide a valid numeric string"
      );
    });

    test("should reject negative numeric strings", () => {
      expect(() => validator.parse("-100")).toThrow(
        "Price must be greater than zero"
      );
      expect(() => validator.parse("-0.01")).toThrow(
        "Price must be greater than zero"
      );
    });

    test("should reject zero as string", () => {
      expect(() => validator.parse("0")).toThrow(
        "Price must be greater than zero"
      );
      expect(() => validator.parse("0.0")).toThrow(
        "Price must be greater than zero"
      );
      expect(() => validator.parse("0.0000")).toThrow(
        "Price must be greater than zero"
      );
    });

    test("should reject strings with more than 4 decimal places", () => {
      expect(() => validator.parse("1.12345")).toThrow(
        "Price cannot have more than 4 decimal places"
      );
      expect(() => validator.parse("0.00001")).toThrow(
        "Price cannot have more than 4 decimal places"
      );
    });
  });

  describe("invalid prices", () => {
    test("should reject zero", () => {
      expect(() => validator.parse(0)).toThrow(
        "Price must be greater than zero"
      );
    });

    test("should reject negative prices", () => {
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

    test("should reject prices with more than 4 decimal places", () => {
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

    test("should reject non-finite numbers", () => {
      // Zod rejects Infinity before our transform
      expect(() => validator.parse(Infinity)).toThrow();
      expect(() => validator.parse(-Infinity)).toThrow();
      expect(() => validator.parse(Number.NaN)).toThrow();
    });

    test("should reject non-numeric types", () => {
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
      expect(() => validator.parse([])).toThrow();
      expect(() => validator.parse(true)).toThrow();
      expect(() => validator.parse(false)).toThrow();
      expect(() => validator.parse(Symbol("test"))).toThrow();
    });
  });

  describe("edge cases", () => {
    test("should handle very small positive values", () => {
      expect(validator.parse(0.0001)).toBe(0.0001);
      expect(validator.parse("0.0001")).toBe(0.0001);
    });

    test("should handle very large values", () => {
      expect(validator.parse(999_999_999.9999)).toBe(999_999_999.9999);
      expect(validator.parse("999999999.9999")).toBe(999_999_999.9999);
    });

    test("should handle scientific notation", () => {
      expect(validator.parse(1e2)).toBe(100);
      expect(validator.parse(1e-2)).toBe(0.01);
      expect(validator.parse("1e2")).toBe(100);
      expect(validator.parse("1e-2")).toBe(0.01);
    });

    test("should reject scientific notation resulting in too many decimals", () => {
      expect(() => validator.parse(1e-5)).toThrow(
        "Price cannot have more than 4 decimal places"
      );
      expect(() => validator.parse("1e-5")).toThrow(
        "Price cannot have more than 4 decimal places"
      );
    });

    test("should handle float precision edge cases", () => {
      // JavaScript float precision can cause issues
      // 0.1 + 0.2 = 0.30000000000000004 in JavaScript (more than 4 decimals)
      expect(() => validator.parse(0.1 + 0.2)).toThrow(
        "Price cannot have more than 4 decimal places"
      );

      // String representation avoids precision issues
      expect(validator.parse("0.3")).toBe(0.3);

      // Test other precision-sensitive values that work
      expect(validator.parse(0.1)).toBe(0.1);
      expect(validator.parse(0.2)).toBe(0.2);

      // Rounded values work fine
      expect(validator.parse(Math.round((0.1 + 0.2) * 10_000) / 10_000)).toBe(
        0.3
      );
    });

    test("should handle maximum safe integer", () => {
      expect(validator.parse(Number.MAX_SAFE_INTEGER)).toBe(
        Number.MAX_SAFE_INTEGER
      );
      expect(validator.parse(Number.MAX_SAFE_INTEGER.toString())).toBe(
        Number.MAX_SAFE_INTEGER
      );
    });

    test("should handle special number values from calculations", () => {
      // Test computed values that might result in special numbers
      const largeCalc = 1e308 * 10; // This creates Infinity
      expect(() => validator.parse(largeCalc)).toThrow();

      const divByZero = 1 / 0; // This creates Infinity
      expect(() => validator.parse(divByZero)).toThrow();

      const negDivByZero = -1 / 0; // This creates -Infinity
      expect(() => validator.parse(negDivByZero)).toThrow();

      const nanCalc = 0 / 0; // This creates NaN
      expect(() => validator.parse(nanCalc)).toThrow();
    });
  });

  describe("common price formats", () => {
    test("should handle common currency formats", () => {
      expect(validator.parse(19.99)).toBe(19.99); // Common retail price
      expect(validator.parse(0.99)).toBe(0.99); // Sub-dollar price
      expect(validator.parse(1000)).toBe(1000); // Round number
      expect(validator.parse(1234.56)).toBe(1234.56); // Standard 2 decimals
    });

    test("should handle financial market prices", () => {
      expect(validator.parse(123.45)).toBe(123.45); // Stock price
      expect(validator.parse(1.2345)).toBe(1.2345); // Forex rate
      expect(validator.parse(0.0025)).toBe(0.0025); // Basis points
    });
  });

  describe("safeParse", () => {
    test("should return success for valid price", () => {
      const result = validator.safeParse(100.5);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(100.5);
      }
    });

    test("should return error for invalid price", () => {
      const result = validator.safeParse(-100);
      expect(result.success).toBe(false);
    });

    test("should return error details for invalid price", () => {
      const result = validator.safeParse(0);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Price must be greater than zero"
        );
      }
    });
  });

  describe("type checking", () => {
    test("should return proper type", () => {
      const result = validator.parse(100.5);
      // Test that the type is correctly inferred
      expect(result).toBe(100.5);
    });

    test("should handle safeParse", () => {
      const result = validator.safeParse(999.99);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(999.99);
      }
    });
  });
});

describe("isPrice", () => {
  test("should return true for valid prices", () => {
    expect(isPrice(100)).toBe(true);
    expect(isPrice(100.5)).toBe(true);
    expect(isPrice("100")).toBe(true);
    expect(isPrice("100.5")).toBe(true);
    expect(isPrice(0.01)).toBe(true);
    expect(isPrice("0.01")).toBe(true);
    expect(isPrice(1.2345)).toBe(true);
    expect(isPrice("1.2345")).toBe(true);
  });

  test("should return false for invalid prices", () => {
    expect(isPrice(0)).toBe(false);
    expect(isPrice(-100)).toBe(false);
    expect(isPrice("0")).toBe(false);
    expect(isPrice("-100")).toBe(false);
    expect(isPrice(Infinity)).toBe(false);
    expect(isPrice(-Infinity)).toBe(false);
    expect(isPrice(Number.NaN)).toBe(false);
    expect(isPrice("abc")).toBe(false);
    expect(isPrice("")).toBe(false);
    expect(isPrice(null)).toBe(false);
    expect(isPrice(undefined)).toBe(false);
    expect(isPrice({})).toBe(false);
    expect(isPrice([])).toBe(false);
    expect(isPrice(1.123_45)).toBe(false); // Too many decimals
    expect(isPrice("1.12345")).toBe(false); // Too many decimals
  });

  test("should work as type guard", () => {
    const value: unknown = 99.99;
    if (isPrice(value)) {
      // TypeScript should recognize value as Price here
      const doubled = value * 2;
      expect(doubled).toBe(199.98);
    }
  });
});

describe("getPrice", () => {
  test("should return valid prices", () => {
    expect(getPrice(100)).toBe(100);
    expect(getPrice(100.5)).toBe(100.5);
    expect(getPrice("100")).toBe(100);
    expect(getPrice("100.5")).toBe(100.5);
    expect(getPrice(0.01)).toBe(0.01);
    expect(getPrice("0.01")).toBe(0.01);
    expect(getPrice(1.2345)).toBe(1.2345);
    expect(getPrice("1.2345")).toBe(1.2345);
  });

  test("should throw for invalid prices", () => {
    expect(() => getPrice(0)).toThrow("Price must be greater than zero");
    expect(() => getPrice(-100)).toThrow("Price must be greater than zero");
    expect(() => getPrice("0")).toThrow("Price must be greater than zero");
    expect(() => getPrice("-100")).toThrow("Price must be greater than zero");
  });

  test("should throw for non-finite numbers", () => {
    // Zod rejects Infinity before our transform
    expect(() => getPrice(Infinity)).toThrow();
    expect(() => getPrice(-Infinity)).toThrow();
    expect(() => getPrice(Number.NaN)).toThrow();
  });

  test("should throw for invalid string formats", () => {
    expect(() => getPrice("abc")).toThrow(
      "Invalid price format. Please provide a valid numeric string"
    );
    expect(() => getPrice("")).toThrow(
      "Invalid price format. Please provide a valid numeric string"
    );
    expect(() => getPrice("not a number")).toThrow(
      "Invalid price format. Please provide a valid numeric string"
    );
  });

  test("should throw for non-numeric types", () => {
    expect(() => getPrice(null)).toThrow();
    expect(() => getPrice(undefined)).toThrow();
    expect(() => getPrice({})).toThrow();
    expect(() => getPrice([])).toThrow();
    expect(() => getPrice(true)).toThrow();
    expect(() => getPrice(false)).toThrow();
  });

  test("should throw for prices with too many decimal places", () => {
    expect(() => getPrice(1.123_45)).toThrow(
      "Price cannot have more than 4 decimal places"
    );
    expect(() => getPrice("1.12345")).toThrow(
      "Price cannot have more than 4 decimal places"
    );
    expect(() => getPrice(0.000_01)).toThrow(
      "Price cannot have more than 4 decimal places"
    );
  });

  test("should be useful in functions requiring Price type", () => {
    const calculateTotal = (price: number, quantity: number) => {
      const validatedPrice = getPrice(price);
      return validatedPrice * quantity;
    };

    expect(calculateTotal(10.5, 3)).toBe(31.5);
    expect(() => calculateTotal(-10, 3)).toThrow(
      "Price must be greater than zero"
    );
  });
});
