import { describe, expect, it } from "bun:test";
import { add, divide, format, from, isDnum, multiply, subtract, type Dnum } from "dnum";
import { bigDecimal, bigDecimalSerializer, getBigDecimal, isBigDecimal } from "../../src/bigdecimal";

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
      const largeNum = "123456789012345678901234567890.123456789012345678901234567890";
      const result = validator.parse(largeNum);
      expect(Array.isArray(result)).toBe(true);
      // dnum maintains precision for large numbers
      // dnum's format function may have different behavior for very large numbers
      const formatted = format(result, { digits: 30 });
      // Remove grouping separators and check the number part (precision may vary)
      const cleaned = formatted.replaceAll(",", "");
      expect(cleaned.startsWith("123456789012345678901234567890.")).toBe(true);
    });

    it("should accept scientific notation", () => {
      const result = validator.parse("1.23e+10");
      expect(Array.isArray(result)).toBe(true);
      // Remove grouping separators
      expect(format(result).replaceAll(",", "")).toBe("12300000000");
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
      expect(() => validator.parse("abc")).toThrow("Invalid decimal format. Please provide a valid numeric string");
      expect(() => validator.parse("12a34")).toThrow("Invalid decimal format. Please provide a valid numeric string");
      expect(() => validator.parse("$123")).toThrow("Invalid decimal format. Please provide a valid numeric string");
    });

    it("should reject empty string", () => {
      expect(() => validator.parse("")).toThrow("Invalid decimal format. Please provide a valid numeric string");
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

    it("should accept numbers", () => {
      const result = validator.parse(123);
      expect(Array.isArray(result)).toBe(true);
      expect(format(result)).toBe("123");

      const decimal = validator.parse(123.456);
      expect(Array.isArray(decimal)).toBe(true);
      expect(format(decimal)).toBe("123.456");
    });

    it("should handle Infinity passed as a number", () => {
      expect(() => validator.parse(Infinity)).toThrow();
      expect(() => validator.parse(-Infinity)).toThrow();
    });

    it("should reject non-string/number types", () => {
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
      expect(format(multiply(num1, num2)).replaceAll(",", "")).toBe("12407.328");
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

  describe("special values with different cases", () => {
    it("should reject special values in various cases", () => {
      const specialValues = [
        "nan",
        "NaN",
        "NAN",
        "nAn",
        "infinity",
        "Infinity",
        "INFINITY",
        "InFiNiTy",
        "-infinity",
        "-Infinity",
        "-INFINITY",
        "-InFiNiTy",
      ];

      for (const value of specialValues) {
        expect(() => validator.parse(value)).toThrow("Invalid value. NaN, Infinity, and -Infinity are not allowed");
      }
    });
  });

  describe("edge cases", () => {
    it("should handle decimal with only decimal point", () => {
      expect(() => validator.parse(".")).toThrow("Invalid decimal format. Please provide a valid numeric string");
    });

    it("should accept decimal starting with decimal point", () => {
      const result = validator.parse(".5");
      expect(format(result)).toBe("0.5");
    });

    it("should reject decimal ending with decimal point", () => {
      expect(() => validator.parse("5.")).toThrow("Invalid decimal format. Please provide a valid numeric string");
    });

    it("should accept negative zero", () => {
      const result = validator.parse("-0");
      expect(format(result)).toBe("0");
    });

    it("should accept very small scientific notation", () => {
      const result = validator.parse("1.23e-10");
      expect(format(result)).toBe("0.000000000123");
    });

    it("should reject uppercase E in scientific notation", () => {
      expect(() => validator.parse("1.23E+5")).toThrow("Invalid decimal format. Please provide a valid numeric string");
    });

    it("should handle whitespace", () => {
      expect(() => validator.parse(" 123 ")).toThrow("Invalid decimal format. Please provide a valid numeric string");
    });

    it("should reject invalid Dnum types", () => {
      expect(() => validator.parse([123])).toThrow("Expected a Dnum value");
      expect(() => validator.parse(["123", 10])).toThrow("Expected a Dnum value");
    });

    it("should reject empty arrays", () => {
      expect(() => validator.parse([])).toThrow("Expected a Dnum value");
    });

    it("should reject boolean values", () => {
      expect(() => validator.parse(true)).toThrow();
      expect(() => validator.parse(false)).toThrow();
    });
  });

  describe("isBigDecimal", () => {
    it("should return true for valid decimal strings", () => {
      expect(isBigDecimal("123")).toBe(true);
      expect(isBigDecimal("123.456")).toBe(true);
      expect(isBigDecimal("-123.456")).toBe(true);
      expect(isBigDecimal("0")).toBe(true);
      expect(isBigDecimal("1.23e10")).toBe(true);
    });

    it("should return true for valid numbers", () => {
      expect(isBigDecimal(123)).toBe(true);
      expect(isBigDecimal(123.456)).toBe(true);
      expect(isBigDecimal(-456.789)).toBe(true);
      expect(isBigDecimal(0)).toBe(true);
    });

    it("should return true for valid Dnum values", () => {
      const dnum = from("123.456");
      expect(isBigDecimal(dnum)).toBe(true);
    });

    it("should return false for invalid values", () => {
      expect(isBigDecimal("abc")).toBe(false);
      expect(isBigDecimal("")).toBe(false);
      expect(isBigDecimal(null)).toBe(false);
      expect(isBigDecimal(undefined)).toBe(false);
      expect(isBigDecimal({})).toBe(false);
      expect(isBigDecimal([])).toBe(false);
      expect(isBigDecimal(true)).toBe(false);
    });

    it("should return false for special values", () => {
      expect(isBigDecimal("NaN")).toBe(false);
      expect(isBigDecimal("Infinity")).toBe(false);
      expect(isBigDecimal("-Infinity")).toBe(false);
      expect(isBigDecimal(Number.NaN)).toBe(false);
      expect(isBigDecimal(Number.POSITIVE_INFINITY)).toBe(false);
      expect(isBigDecimal(Number.NEGATIVE_INFINITY)).toBe(false);
    });
  });

  describe("getBigDecimal", () => {
    it("should return parsed decimal for valid strings", () => {
      const result = getBigDecimal("123.456");
      expect(isDnum(result)).toBe(true);
      expect(format(result)).toBe("123.456");
    });

    it("should return Dnum value as-is", () => {
      const dnum = from("789.012");
      const result = getBigDecimal(dnum);
      expect(result).toBe(dnum);
    });

    it("should return parsed decimal for valid numbers", () => {
      const result = getBigDecimal(123);
      expect(isDnum(result)).toBe(true);
      expect(format(result)).toBe("123");

      const decimal = getBigDecimal(456.789);
      expect(isDnum(decimal)).toBe(true);
      expect(format(decimal)).toBe("456.789");
    });

    it("should throw for invalid values", () => {
      expect(() => getBigDecimal("invalid")).toThrow("Invalid decimal format. Please provide a valid numeric string");
      expect(() => getBigDecimal(null)).toThrow();
      expect(() => getBigDecimal(undefined)).toThrow();
    });

    it("should throw for special values", () => {
      expect(() => getBigDecimal("NaN")).toThrow("Invalid value. NaN, Infinity, and -Infinity are not allowed");
      expect(() => getBigDecimal("Infinity")).toThrow("Invalid value. NaN, Infinity, and -Infinity are not allowed");
      expect(() => getBigDecimal(Number.NaN)).toThrow();
      expect(() => getBigDecimal(Number.POSITIVE_INFINITY)).toThrow();
      expect(() => getBigDecimal(Number.NEGATIVE_INFINITY)).toThrow();
    });
  });

  describe("bigDecimalSerializer", () => {
    it("should have correct type", () => {
      expect(bigDecimalSerializer.type).toBe(31);
    });

    it("should detect Dnum values with condition", () => {
      const dnum = from("123.456");
      expect(bigDecimalSerializer.condition(dnum)).toBe(true);
      expect(bigDecimalSerializer.condition("123.456")).toBe(false);
      expect(bigDecimalSerializer.condition(123)).toBe(false);
      expect(bigDecimalSerializer.condition(null)).toBe(false);
    });

    it("should serialize Dnum to string", () => {
      const dnum = from("123.456");
      const serialized = bigDecimalSerializer.serialize(dnum);
      expect(serialized).toBe("123.456");
    });

    it("should serialize large numbers correctly", () => {
      const dnum = from("999999999999999999999999999999.99");
      const serialized = bigDecimalSerializer.serialize(dnum);
      expect((serialized as string).replaceAll(",", "")).toBe("999999999999999999999999999999.99");
    });

    it("should deserialize string to Dnum", () => {
      const deserialized = bigDecimalSerializer.deserialize("123.456");
      expect(isDnum(deserialized)).toBe(true);
      expect(format(deserialized as Dnum)).toBe("123.456");
    });

    it("should deserialize number to Dnum", () => {
      const deserialized = bigDecimalSerializer.deserialize(123.456);
      expect(isDnum(deserialized)).toBe(true);
      expect(format(deserialized as Dnum)).toBe("123.456");
    });
  });
});
