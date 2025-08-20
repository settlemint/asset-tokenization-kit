/**
 * @fileoverview Test suite for BigDecimal validation and precision handling
 * 
 * This test suite validates arbitrary precision decimal number handling using the dnum library,
 * ensuring accurate representation and calculation of financial amounts without floating-point errors.
 * 
 * Test Strategy:
 * - Precision Preservation: Verify large numbers maintain exact precision
 * - Format Validation: Test string, number, and Dnum input acceptance
 * - Edge Cases: Handle scientific notation, special values, boundary conditions
 * - Type Safety: Ensure proper Dnum type checking and validation
 * - Arithmetic Operations: Validate dnum operations work correctly with parsed values
 * - Serialization: Test JSON serialization/deserialization for API transport
 * 
 * CRITICAL: Financial calculations require exact precision - floating point errors are unacceptable
 * PERFORMANCE: Dnum operations are optimized for precision over speed for financial use cases
 */

import { describe, expect, it } from "bun:test";
import { add, divide, format, from, isDnum, multiply, subtract, type Dnum } from "dnum";
import { bigDecimal, bigDecimalSerializer, getBigDecimal, isBigDecimal } from "../../src/bigdecimal";

describe("bigDecimal", () => {
  const validator = bigDecimal();

  describe("valid decimal numbers", () => {
    it("should accept integer strings", () => {
      // WHY: String input preserves exact precision without JavaScript number limitations
      const result = validator.parse("123");
      expect(Array.isArray(result)).toBe(true); // Dnum is internally an array [value, decimals]
      expect(format(result)).toBe("123");
    });

    it("should accept decimal strings", () => {
      // WHY: Decimal strings avoid floating-point precision loss (0.1 + 0.2 != 0.3 problem)
      const result = validator.parse("123.456");
      expect(Array.isArray(result)).toBe(true); // Dnum structure
      expect(format(result)).toBe("123.456");
    });

    it("should accept negative numbers", () => {
      const result = validator.parse("-123.456");
      expect(Array.isArray(result)).toBe(true);
      expect(format(result)).toBe("-123.456");
    });

    it("should accept very large numbers", () => {
      // WHY: Asset values can exceed JavaScript's MAX_SAFE_INTEGER (2^53-1)
      // TRADEOFF: Use dnum for arbitrary precision at cost of performance vs native numbers
      const largeNum = "123456789012345678901234567890.123456789012345678901234567890";
      const result = validator.parse(largeNum);
      expect(Array.isArray(result)).toBe(true);
      
      // PRECISION: dnum maintains exact precision for financial calculations
      const formatted = format(result, { digits: 30 });
      const cleaned = formatted.replaceAll(",", ""); // Remove thousand separators
      expect(cleaned.startsWith("123456789012345678901234567890.")).toBe(true);
    });

    it("should accept scientific notation", () => {
      // WHY: API responses may include scientific notation for very large/small values
      const result = validator.parse("1.23e+10");
      expect(Array.isArray(result)).toBe(true);
      
      // NORMALIZATION: Scientific notation converted to standard decimal format
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
      // WHY: Pass-through optimization - already-parsed Dnum values don't need re-parsing
      // PERFORMANCE: Avoid redundant parsing when value is already in correct format
      const existingDnum = from("123.456");
      const result = validator.parse(existingDnum);
      expect(result).toBe(existingDnum); // Identity check - same object reference
      expect(format(result)).toBe("123.456");
    });
  });

  describe("invalid decimal numbers", () => {
    it("should reject non-numeric strings", () => {
      // SECURITY: Prevent injection of non-numeric data into financial calculations
      expect(() => validator.parse("abc")).toThrow("Invalid decimal format. Please provide a valid numeric string");
      expect(() => validator.parse("12a34")).toThrow("Invalid decimal format. Please provide a valid numeric string");
      expect(() => validator.parse("$123")).toThrow("Invalid decimal format. Please provide a valid numeric string");
    });

    it("should reject empty string", () => {
      expect(() => validator.parse("")).toThrow("Invalid decimal format. Please provide a valid numeric string");
    });

    it("should reject special values", () => {
      // SECURITY: NaN/Infinity values could break financial calculations
      // WHY: These values don't represent real monetary amounts
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
      // WHY: Accept native JavaScript numbers for convenience (with precision caveat)
      // TRADEOFF: Numbers > 2^53-1 may lose precision, but common for small amounts
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
      // WHY: Validate that parsed decimals work correctly with dnum arithmetic
      // CRITICAL: Financial calculations must be exact (no floating-point errors)
      const num1 = validator.parse("123.456");
      const num2 = validator.parse("100.5");

      expect(format(add(num1, num2))).toBe("223.956"); // Exact addition
      expect(format(subtract(num1, num2))).toBe("22.956"); // Exact subtraction
      expect(format(multiply(num1, num2)).replaceAll(",", "")).toBe("12407.328"); // Exact multiplication
      const divResult = format(divide(num1, num2), { digits: 6 });
      expect(divResult).toMatch(/^1\.228/); // Division with controlled precision
    });

    it("should maintain precision", () => {
      // WHY: Demonstrate the classic floating-point error is avoided
      // PROBLEM: In JavaScript: 0.1 + 0.1 + 0.1 = 0.30000000000000004
      // SOLUTION: dnum gives exact result: 0.3
      const result = validator.parse("0.1");
      const sum = add(add(result, result), result);
      expect(format(sum)).toBe("0.3"); // Exact result, no floating-point errors
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
      // SECURITY: Prevent case-insensitive special value injection
      // WHY: Attackers might try different casings to bypass validation
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

      // SECURITY: All case variations should be rejected consistently
      for (const value of specialValues) {
        expect(() => validator.parse(value)).toThrow("Invalid value. NaN, Infinity, and -Infinity are not allowed");
      }
    });
  });

  describe("edge cases", () => {
    it("should handle decimal with only decimal point", () => {
      // EDGE_CASE: Single decimal point is not a valid number
      expect(() => validator.parse(".")).toThrow("Invalid decimal format. Please provide a valid numeric string");
    });

    it("should accept decimal starting with decimal point", () => {
      // WHY: .5 is valid shorthand for 0.5 in many contexts
      const result = validator.parse(".5");
      expect(format(result)).toBe("0.5"); // Normalized to standard format
    });

    it("should reject decimal ending with decimal point", () => {
      // EDGE_CASE: Trailing decimal point without digits is invalid
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
      // WHY: dnum may be strict about scientific notation format (lowercase 'e')
      // CONSISTENCY: Enforce consistent formatting standards
      expect(() => validator.parse("1.23E+5")).toThrow("Invalid decimal format. Please provide a valid numeric string");
    });

    it("should handle whitespace", () => {
      // SECURITY: Whitespace could indicate malformed input or injection attempts
      // STRICT: No implicit trimming - values must be exact
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
      // WHY: Type guard function for conditional validation in application logic
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
      // WHY: Convenience function that throws instead of returning SafeParseResult
      const result = getBigDecimal("123.456");
      expect(isDnum(result)).toBe(true); // Verify it's a proper Dnum
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
      // WHY: ORPC serializer needs unique type ID for Dnum values in JSON transport
      expect(bigDecimalSerializer.type).toBe(31);
    });

    it("should detect Dnum values with condition", () => {
      // WHY: Serializer must distinguish Dnum from other types for correct JSON handling
      const dnum = from("123.456");
      expect(bigDecimalSerializer.condition(dnum)).toBe(true); // Dnum detected
      expect(bigDecimalSerializer.condition("123.456")).toBe(false); // String ignored
      expect(bigDecimalSerializer.condition(123)).toBe(false); // Number ignored
      expect(bigDecimalSerializer.condition(null)).toBe(false); // Null ignored
    });

    it("should serialize Dnum to string", () => {
      // WHY: Convert Dnum to JSON-safe string for API transport
      const dnum = from("123.456");
      const serialized = bigDecimalSerializer.serialize(dnum);
      expect(serialized).toBe("123.456"); // Exact string representation
    });

    it("should serialize large numbers correctly", () => {
      const dnum = from("999999999999999999999999999999.99");
      const serialized = bigDecimalSerializer.serialize(dnum);
      expect((serialized as string).replaceAll(",", "")).toBe("999999999999999999999999999999.99");
    });

    it("should deserialize string to Dnum", () => {
      // WHY: Reconstruct Dnum from JSON string during API response processing
      const deserialized = bigDecimalSerializer.deserialize("123.456");
      expect(isDnum(deserialized)).toBe(true);
      expect(format(deserialized as Dnum)).toBe("123.456");
    });

    it("should deserialize number to Dnum", () => {
      // WHY: Handle numeric JSON values (with precision limitations caveat)
      const deserialized = bigDecimalSerializer.deserialize(123.456);
      expect(isDnum(deserialized)).toBe(true);
      expect(format(deserialized as Dnum)).toBe("123.456");
    });
  });
});
