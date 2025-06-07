import { describe, expect, it } from "bun:test";
import { apiBigInt, getApiBigInt, isApiBigInt, type ApiBigInt } from "./bigint";

describe("apiBigInt", () => {
  const validator = apiBigInt;

  describe("valid inputs", () => {
    it("should parse a simple positive number string", () => {
      expect(validator.parse("123")).toBe(123n);
      expect(isApiBigInt("123")).toBe(true);
      expect(getApiBigInt("123")).toBe(123n);
    });

    it("should parse a very large number string", () => {
      const largeNum = "123456789012345678901234567890";
      expect(validator.parse(largeNum)).toBe(123456789012345678901234567890n);
      expect(isApiBigInt(largeNum)).toBe(true);
      expect(getApiBigInt(largeNum)).toBe(123456789012345678901234567890n);
    });

    it("should parse zero", () => {
      expect(validator.parse("0")).toBe(0n);
      expect(isApiBigInt("0")).toBe(true);
      expect(getApiBigInt("0")).toBe(0n);
    });

    it("should parse negative numbers", () => {
      expect(validator.parse("-123")).toBe(-123n);
      expect(validator.parse("-999999999999999999999")).toBe(
        -999999999999999999999n
      );

      expect(isApiBigInt("-123")).toBe(true);
      expect(isApiBigInt("-999999999999999999999")).toBe(true);

      expect(getApiBigInt("-123")).toBe(-123n);
      expect(getApiBigInt("-999999999999999999999")).toBe(
        -999999999999999999999n
      );
    });

    it("should handle decimal strings by truncating", () => {
      expect(validator.parse("123.456")).toBe(123n);
      expect(validator.parse("999.999")).toBe(999n);
      expect(validator.parse("-123.456")).toBe(-123n);

      expect(isApiBigInt("123.456")).toBe(true);
      expect(isApiBigInt("999.999")).toBe(true);
      expect(isApiBigInt("-123.456")).toBe(true);

      expect(getApiBigInt("123.456")).toBe(123n);
      expect(getApiBigInt("999.999")).toBe(999n);
      expect(getApiBigInt("-123.456")).toBe(-123n);
    });

    it("should parse numbers directly", () => {
      expect(validator.parse(123)).toBe(123n);
      expect(validator.parse(-456)).toBe(-456n);
      expect(validator.parse(0)).toBe(0n);

      expect(isApiBigInt(123)).toBe(true);
      expect(isApiBigInt(-456)).toBe(true);
      expect(isApiBigInt(0)).toBe(true);

      expect(getApiBigInt(123)).toBe(123n);
      expect(getApiBigInt(-456)).toBe(-456n);
      expect(getApiBigInt(0)).toBe(0n);
    });

    it("should parse bigints directly", () => {
      expect(validator.parse(123n)).toBe(123n);
      expect(validator.parse(-456n)).toBe(-456n);
      expect(validator.parse(0n)).toBe(0n);

      expect(isApiBigInt(123n)).toBe(true);
      expect(isApiBigInt(-456n)).toBe(true);
      expect(isApiBigInt(0n)).toBe(true);

      expect(getApiBigInt(123n)).toBe(123n);
      expect(getApiBigInt(-456n)).toBe(-456n);
      expect(getApiBigInt(0n)).toBe(0n);
    });

    it("should handle whitespace in strings", () => {
      expect(validator.parse("  123  ")).toBe(123n);
      expect(validator.parse("\t456\n")).toBe(456n);

      expect(isApiBigInt("  123  ")).toBe(true);
      expect(isApiBigInt("\t456\n")).toBe(true);

      expect(getApiBigInt("  123  ")).toBe(123n);
      expect(getApiBigInt("\t456\n")).toBe(456n);
    });

    it("should handle leading zeros", () => {
      expect(validator.parse("0000123")).toBe(123n);
      expect(validator.parse("-0000456")).toBe(-456n);
      expect(validator.parse("0000")).toBe(0n);

      expect(isApiBigInt("0000123")).toBe(true);
      expect(isApiBigInt("-0000456")).toBe(true);
      expect(isApiBigInt("0000")).toBe(true);

      expect(getApiBigInt("0000123")).toBe(123n);
      expect(getApiBigInt("-0000456")).toBe(-456n);
      expect(getApiBigInt("0000")).toBe(0n);
    });

    it("should handle scientific notation strings", () => {
      // Now we handle scientific notation properly
      expect(validator.parse("1e10")).toBe(10000000000n);
      expect(validator.parse("1.23e4")).toBe(12300n);
      expect(validator.parse("5e3")).toBe(5000n);
      expect(validator.parse("-2.5e6")).toBe(-2500000n);
      expect(validator.parse("1.23e-2")).toBe(0n); // 0.0123 truncates to 0

      expect(isApiBigInt("1e10")).toBe(true);
      expect(isApiBigInt("1.23e4")).toBe(true);
      expect(isApiBigInt("5e3")).toBe(true);

      expect(getApiBigInt("1e10")).toBe(10000000000n);
      expect(getApiBigInt("1.23e4")).toBe(12300n);
      expect(getApiBigInt("5e3")).toBe(5000n);
    });

    it("should handle very large scientific notation", () => {
      // Test with numbers that would exceed Number.MAX_SAFE_INTEGER
      expect(validator.parse("9e15")).toBe(9000000000000000n);
      expect(validator.parse("1.5e18")).toBe(1500000000000000000n);

      // Test with even larger numbers that exceed JavaScript's Number precision
      expect(validator.parse("1e30")).toBe(1000000000000000000000000000000n);
      expect(validator.parse("5.5e25")).toBe(55000000000000000000000000n);

      expect(isApiBigInt("9e15")).toBe(true);
      expect(isApiBigInt("1.5e18")).toBe(true);
      expect(isApiBigInt("1e30")).toBe(true);
      expect(isApiBigInt("5.5e25")).toBe(true);

      expect(getApiBigInt("9e15")).toBe(9000000000000000n);
      expect(getApiBigInt("1.5e18")).toBe(1500000000000000000n);
      expect(getApiBigInt("1e30")).toBe(1000000000000000000000000000000n);
      expect(getApiBigInt("5.5e25")).toBe(55000000000000000000000000n);
    });
  });

  describe("invalid inputs", () => {
    it("should convert empty string to 0n", () => {
      // z.coerce.bigint() converts empty strings to 0n
      expect(validator.parse("")).toBe(0n);
      expect(isApiBigInt("")).toBe(true);
      expect(getApiBigInt("")).toBe(0n);
    });

    it("should reject non-numeric strings", () => {
      expect(() => validator.parse("abc")).toThrow();
      expect(() => validator.parse("12a34")).toThrow();
      expect(() => validator.parse("$123")).toThrow();

      expect(isApiBigInt("abc")).toBe(false);
      expect(isApiBigInt("12a34")).toBe(false);
      expect(isApiBigInt("$123")).toBe(false);

      expect(() => getApiBigInt("abc")).toThrow();
      expect(() => getApiBigInt("12a34")).toThrow();
      expect(() => getApiBigInt("$123")).toThrow();
    });

    it("should handle multiple decimal points by truncating at first decimal", () => {
      // Our preprocess function only splits at the first decimal
      expect(validator.parse("123.456.789")).toBe(123n);
      expect(isApiBigInt("123.456.789")).toBe(true);
      expect(getApiBigInt("123.456.789")).toBe(123n);
    });

    it("should reject null and undefined", () => {
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();

      expect(isApiBigInt(null)).toBe(false);
      expect(isApiBigInt(undefined)).toBe(false);

      expect(() => getApiBigInt(null)).toThrow();
      expect(() => getApiBigInt(undefined)).toThrow();
    });

    it("should reject empty objects but convert empty arrays to 0n", () => {
      // z.coerce.bigint() behavior differs for objects and arrays
      expect(() => validator.parse({})).toThrow();
      expect(validator.parse([])).toBe(0n);

      expect(isApiBigInt({})).toBe(false);
      expect(isApiBigInt([])).toBe(true);

      expect(() => getApiBigInt({})).toThrow();
      expect(getApiBigInt([])).toBe(0n);
    });

    it("should reject Infinity and NaN", () => {
      expect(() => validator.parse(Infinity)).toThrow();
      expect(() => validator.parse(-Infinity)).toThrow();
      expect(() => validator.parse(NaN)).toThrow();

      expect(isApiBigInt(Infinity)).toBe(false);
      expect(isApiBigInt(-Infinity)).toBe(false);
      expect(isApiBigInt(NaN)).toBe(false);

      expect(() => getApiBigInt(Infinity)).toThrow();
      expect(() => getApiBigInt(-Infinity)).toThrow();
      expect(() => getApiBigInt(NaN)).toThrow();
    });
  });
});

describe("helper functions", () => {
  it("isApiBigInt should work as type guard", () => {
    const value: unknown = "12345";
    if (isApiBigInt(value)) {
      // Note: isApiBigInt only validates, it doesn't transform
      // The actual type is still string, but TypeScript thinks it's ApiBigInt (bigint)
      // This is a limitation of type guards - they can't transform values
      const parsed = getApiBigInt(value);
      expect(parsed).toBe(12345n);
    }
  });

  it("getApiBigInt should return typed value", () => {
    const result = getApiBigInt("67890");
    // TypeScript should recognize result as ApiBigInt
    const _typeCheck: ApiBigInt = result;
    expect(result).toBe(67890n);
  });
});
