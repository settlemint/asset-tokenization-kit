import { describe, expect, it } from "bun:test";
import { from, format, add, subtract, multiply, divide, type Dnum } from "dnum";
import { bigDecimal, isBigDecimal, getBigDecimal } from "./bigdecimal";

describe("bigDecimal", () => {
  const validator = bigDecimal();

  describe("valid decimal numbers", () => {
    it("should accept integer strings", () => {
      const result = validator.parse("123");
      expect(Array.isArray(result)).toBe(true);
      expect(format(result)).toBe("123");

      expect(isBigDecimal("123")).toBe(true);
      const getResult = getBigDecimal("123");
      expect(Array.isArray(getResult)).toBe(true);
      expect(format(getResult)).toBe("123");
    });

    it("should accept decimal strings", () => {
      const result = validator.parse("123.456");
      expect(Array.isArray(result)).toBe(true);
      expect(format(result)).toBe("123.456");

      expect(isBigDecimal("123.456")).toBe(true);
      const getResult = getBigDecimal("123.456");
      expect(Array.isArray(getResult)).toBe(true);
      expect(format(getResult)).toBe("123.456");
    });

    it("should accept negative numbers", () => {
      const result = validator.parse("-123.456");
      expect(Array.isArray(result)).toBe(true);
      expect(format(result)).toBe("-123.456");

      expect(isBigDecimal("-123.456")).toBe(true);
      const getResult = getBigDecimal("-123.456");
      expect(Array.isArray(getResult)).toBe(true);
      expect(format(getResult)).toBe("-123.456");
    });

    it("should accept very large numbers", () => {
      const largeNum =
        "123456789012345678901234567890.123456789012345678901234567890";
      const result = validator.parse(largeNum);
      expect(Array.isArray(result)).toBe(true);
      // dnum maintains precision for large numbers
      // dnum's format function may have different behavior for very large numbers
      const formatted = format(result, { digits: 30 });
      // Remove grouping separators and check the number part (precision may vary)
      const cleaned = formatted.replace(/,/g, "");
      expect(cleaned.startsWith("123456789012345678901234567890.")).toBe(true);

      expect(isBigDecimal(largeNum)).toBe(true);
      const getResult = getBigDecimal(largeNum);
      expect(Array.isArray(getResult)).toBe(true);
    });

    it("should accept scientific notation", () => {
      const result = validator.parse("1.23e+10");
      expect(Array.isArray(result)).toBe(true);
      // Remove grouping separators
      expect(format(result).replace(/,/g, "")).toBe("12300000000");

      expect(isBigDecimal("1.23e+10")).toBe(true);
      const getResult = getBigDecimal("1.23e+10");
      expect(Array.isArray(getResult)).toBe(true);
      expect(format(getResult).replace(/,/g, "")).toBe("12300000000");
    });

    it("should accept zero", () => {
      const result = validator.parse("0");
      expect(Array.isArray(result)).toBe(true);
      expect(format(result)).toBe("0");

      expect(isBigDecimal("0")).toBe(true);
      expect(format(getBigDecimal("0"))).toBe("0");
    });

    it("should accept leading zeros", () => {
      const result = validator.parse("00123.45");
      expect(Array.isArray(result)).toBe(true);
      expect(format(result)).toBe("123.45");

      expect(isBigDecimal("00123.45")).toBe(true);
      expect(format(getBigDecimal("00123.45"))).toBe("123.45");
    });

    it("should accept trailing zeros", () => {
      const result = validator.parse("123.4500");
      expect(Array.isArray(result)).toBe(true);
      expect(format(result)).toBe("123.45");

      expect(isBigDecimal("123.4500")).toBe(true);
      expect(format(getBigDecimal("123.4500"))).toBe("123.45");
    });
  });

  describe("invalid decimal numbers", () => {
    it("should reject non-numeric strings", () => {
      expect(() => validator.parse("abc")).toThrow(
        "Invalid decimal format. Please provide a valid numeric string"
      );
      expect(() => validator.parse("12a34")).toThrow(
        "Invalid decimal format. Please provide a valid numeric string"
      );
      expect(() => validator.parse("$123")).toThrow(
        "Invalid decimal format. Please provide a valid numeric string"
      );

      expect(isBigDecimal("abc")).toBe(false);
      expect(isBigDecimal("12a34")).toBe(false);
      expect(isBigDecimal("$123")).toBe(false);

      expect(() => getBigDecimal("abc")).toThrow("Invalid decimal format. Please provide a valid numeric string");
      expect(() => getBigDecimal("12a34")).toThrow("Invalid decimal format. Please provide a valid numeric string");
      expect(() => getBigDecimal("$123")).toThrow("Invalid decimal format. Please provide a valid numeric string");
    });

    it("should reject empty string", () => {
      expect(() => validator.parse("")).toThrow(
        "Invalid decimal format. Please provide a valid numeric string"
      );
      expect(isBigDecimal("")).toBe(false);
      expect(() => getBigDecimal("")).toThrow("Invalid decimal format. Please provide a valid numeric string");
    });

    it("should reject special values", () => {
      expect(() => validator.parse("NaN")).toThrow();
      expect(() => validator.parse("Infinity")).toThrow();
      expect(() => validator.parse("-Infinity")).toThrow();

      // These will be rejected by the refine check
      expect(isBigDecimal("NaN")).toBe(false);
      expect(isBigDecimal("Infinity")).toBe(false);
      expect(isBigDecimal("-Infinity")).toBe(false);

      expect(() => getBigDecimal("NaN")).toThrow("Invalid value. NaN, Infinity, and -Infinity are not allowed");
      expect(() => getBigDecimal("Infinity")).toThrow("Invalid value. NaN, Infinity, and -Infinity are not allowed");
      expect(() => getBigDecimal("-Infinity")).toThrow("Invalid value. NaN, Infinity, and -Infinity are not allowed");
    });

    it("should reject multiple decimal points", () => {
      expect(() => validator.parse("123.456.789")).toThrow(
        "Invalid decimal format. Please provide a valid numeric string"
      );
      expect(isBigDecimal("123.456.789")).toBe(false);
      expect(() => getBigDecimal("123.456.789")).toThrow("Invalid decimal format. Please provide a valid numeric string");
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();

      expect(isBigDecimal(123)).toBe(false);
      expect(isBigDecimal(null)).toBe(false);
      expect(isBigDecimal(undefined)).toBe(false);
      expect(isBigDecimal({})).toBe(false);

      expect(() => getBigDecimal(123)).toThrow("Expected string, received number");
      expect(() => getBigDecimal(null)).toThrow("Expected string, received null");
      expect(() => getBigDecimal(undefined)).toThrow("Required");
      expect(() => getBigDecimal({})).toThrow("Expected string, received object");
    });
  });

  describe("Dnum operations", () => {
    it("should support Dnum arithmetic", () => {
      const num1 = validator.parse("123.456");
      const num2 = validator.parse("100.5");

      expect(format(add(num1, num2))).toBe("223.956");
      expect(format(subtract(num1, num2))).toBe("22.956");
      expect(format(multiply(num1, num2)).replace(/,/g, "")).toBe("12407.328");
      const divResult = format(divide(num1, num2), { digits: 6 });
      // dnum may format with different precision
      expect(divResult).toMatch(/^1\.228/);
    });

    it("should maintain precision", () => {
      const result = validator.parse("0.1");
      const sum = add(add(result, result), result);
      expect(format(sum)).toBe("0.3"); // No floating point errors
    });
  });

  describe("safeParse", () => {
    it("should return success for valid decimal", () => {
      const result = validator.safeParse("123.456");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        expect(format(result.data)).toBe("123.456");
      }
    });

    it("should return error for invalid decimal", () => {
      const result = validator.safeParse("invalid");
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("helper functions", () => {
    it("isBigDecimal should work as type guard", () => {
      const value: unknown = "123.456";
      if (isBigDecimal(value)) {
        // TypeScript should recognize value as BigDecimal here
        const _typeCheck: Dnum & { __brand: "BigDecimal" } = value;
      }
    });

    it("getBigDecimal should return typed value", () => {
      const result = getBigDecimal("789.012");
      // TypeScript should recognize result as BigDecimal
      const _typeCheck: Dnum & { __brand: "BigDecimal" } = result;
      expect(format(result)).toBe("789.012");
    });
  });
});
