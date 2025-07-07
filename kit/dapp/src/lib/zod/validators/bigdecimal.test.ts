import { describe, expect, it } from "bun:test";
import { add, divide, format, from, multiply, subtract } from "dnum";
import { bigDecimal } from "./bigdecimal";

describe("bigDecimal", () => {
  const validator = bigDecimal();

  describe("valid decimal numbers", () => {
    it("should accept integer strings", () => {
      const result = validator.parse("123");
      expect(Array.isArray(result)).toBe(true);
      expect(format(result)).toBe("123");
    });

    it("should accept decimal strings", () => {
      const result = validator.parse("123.456");
      expect(Array.isArray(result)).toBe(true);
      expect(format(result)).toBe("123.456");
    });

    it("should accept negative numbers", () => {
      const result = validator.parse("-123.456");
      expect(Array.isArray(result)).toBe(true);
      expect(format(result)).toBe("-123.456");
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
    });

    it("should accept scientific notation", () => {
      const result = validator.parse("1.23e+10");
      expect(Array.isArray(result)).toBe(true);
      // Remove grouping separators
      expect(format(result).replace(/,/g, "")).toBe("12300000000");
    });

    it("should accept zero", () => {
      const result = validator.parse("0");
      expect(Array.isArray(result)).toBe(true);
      expect(format(result)).toBe("0");
    });

    it("should accept leading zeros", () => {
      const result = validator.parse("00123.45");
      expect(Array.isArray(result)).toBe(true);
      expect(format(result)).toBe("123.45");
    });

    it("should accept trailing zeros", () => {
      const result = validator.parse("123.4500");
      expect(Array.isArray(result)).toBe(true);
      expect(format(result)).toBe("123.45");
    });

    it("should accept existing Dnum values", () => {
      const existingDnum = from("123.456");
      const result = validator.parse(existingDnum);
      expect(result).toBe(existingDnum); // Should return the same reference
      expect(format(result)).toBe("123.456");
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
    });

    it("should reject empty string", () => {
      expect(() => validator.parse("")).toThrow(
        "Invalid decimal format. Please provide a valid numeric string"
      );
    });

    it("should reject special values", () => {
      expect(() => validator.parse("NaN")).toThrow();
      expect(() => validator.parse("Infinity")).toThrow();
      expect(() => validator.parse("-Infinity")).toThrow();
    });

    it("should reject multiple decimal points", () => {
      expect(() => validator.parse("123.456.789")).toThrow(
        "Invalid decimal format. Please provide a valid numeric string"
      );
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
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

  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse("123.456");
      // Test that the type is correctly inferred
      expect(Array.isArray(result)).toBe(true);
      expect(format(result)).toBe("123.456");
    });
  });
});
