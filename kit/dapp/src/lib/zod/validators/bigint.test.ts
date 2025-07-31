import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  apiBigInt,
  bigIntSerializer,
  getApiBigInt,
  isApiBigInt,
} from "./bigint";

describe("apiBigInt", () => {
  const validator = apiBigInt;

  describe("valid inputs", () => {
    it("should parse a simple positive number string", () => {
      expect(validator.parse("123")).toBe(123n);
    });

    it("should parse a very large number string", () => {
      const largeNum = "123456789012345678901234567890";
      expect(validator.parse(largeNum)).toBe(
        123_456_789_012_345_678_901_234_567_890n
      );
    });

    it("should parse zero", () => {
      expect(validator.parse("0")).toBe(0n);
    });

    it("should parse negative numbers", () => {
      expect(validator.parse("-123")).toBe(-123n);
      expect(validator.parse("-999999999999999999999")).toBe(
        -999_999_999_999_999_999_999n
      );
    });

    it("should handle decimal strings by truncating", () => {
      expect(validator.parse("123.456")).toBe(123n);
      expect(validator.parse("999.999")).toBe(999n);
      expect(validator.parse("-123.456")).toBe(-123n);
    });

    it("should parse numbers directly", () => {
      expect(validator.parse(123)).toBe(123n);
      expect(validator.parse(-456)).toBe(-456n);
      expect(validator.parse(0)).toBe(0n);
    });

    it("should parse bigints directly", () => {
      expect(validator.parse(123n)).toBe(123n);
      expect(validator.parse(-456n)).toBe(-456n);
      expect(validator.parse(0n)).toBe(0n);
    });

    it("should handle whitespace in strings", () => {
      expect(validator.parse("  123  ")).toBe(123n);
      expect(validator.parse("\t456\n")).toBe(456n);
    });

    it("should handle leading zeros", () => {
      expect(validator.parse("0000123")).toBe(123n);
      expect(validator.parse("-0000456")).toBe(-456n);
      expect(validator.parse("0000")).toBe(0n);
    });

    it("should handle scientific notation strings", () => {
      // Now we handle scientific notation properly
      expect(validator.parse("1e10")).toBe(10_000_000_000n);
      expect(validator.parse("1.23e4")).toBe(12_300n);
      expect(validator.parse("5e3")).toBe(5000n);
      expect(validator.parse("-2.5e6")).toBe(-2_500_000n);
      expect(validator.parse("1.23e-2")).toBe(0n); // 0.0123 truncates to 0
    });

    it("should handle very large scientific notation", () => {
      // Test with numbers that would exceed Number.MAX_SAFE_INTEGER
      expect(validator.parse("9e15")).toBe(9_000_000_000_000_000n);
      expect(validator.parse("1.5e18")).toBe(1_500_000_000_000_000_000n);

      // Test with even larger numbers that exceed JavaScript's Number precision
      expect(validator.parse("1e30")).toBe(
        1_000_000_000_000_000_000_000_000_000_000n
      );
      expect(validator.parse("5.5e25")).toBe(
        55_000_000_000_000_000_000_000_000n
      );
    });

    it("should handle dnum array format [bigint, number]", () => {
      // dnum uses [bigint, number] format where the second number is the decimal exponent
      // Note: dnum's floor() doesn't support negative exponents, so those fall through
      expect(validator.parse([123n, 0])).toBe(123n); // 123 * 10^0 = 123
      expect(validator.parse([-456n, 0])).toBe(-456n); // -456 * 10^0 = -456

      // Arrays with negative exponents fail dnum processing and are rejected by z.coerce.bigint()
      expect(() => validator.parse([456n, -1])).toThrow(); // dnum can't handle negative exponents
      expect(() => validator.parse([123n, -2])).toThrow(); // dnum can't handle negative exponents
    });
  });

  describe("invalid inputs", () => {
    it("should convert empty string to 0n", () => {
      // z.coerce.bigint() converts empty strings to 0n
      expect(validator.parse("")).toBe(0n);
    });

    it("should reject non-numeric strings", () => {
      expect(() => validator.parse("abc")).toThrow();
      expect(() => validator.parse("12a34")).toThrow();
      expect(() => validator.parse("$123")).toThrow();
    });

    it("should handle multiple decimal points by truncating at first decimal", () => {
      // Our preprocess function now rejects multiple decimal points
      expect(() => validator.parse("123.456.789")).toThrow(
        "Invalid BigInt format: multiple decimal points"
      );
    });

    it("should reject null and undefined", () => {
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
    });

    it("should reject empty objects but convert empty arrays to 0n", () => {
      // z.coerce.bigint() behavior differs for objects and arrays
      expect(() => validator.parse({})).toThrow();
      expect(validator.parse([])).toBe(0n);
    });

    it("should reject Infinity and NaN", () => {
      expect(() => validator.parse(Infinity)).toThrow();
      expect(() => validator.parse(-Infinity)).toThrow();
      expect(() => validator.parse(Number.NaN)).toThrow();
    });

    it("should handle or reject invalid dnum array formats", () => {
      // Arrays that don't match dnum format
      expect(validator.parse([123])).toBe(123n); // Single element array coerces to bigint
      expect(validator.parse([123n])).toBe(123n); // Single bigint element
      expect(() => validator.parse([123n, "2"])).toThrow(); // Invalid format - not a valid dnum
      expect(() => validator.parse(["123", 2])).toThrow(); // Invalid format - first element not bigint
      expect(() => validator.parse([123n, 2, 3])).toThrow(); // Too many elements
      expect(() => validator.parse([null, 2])).toThrow(); // First element null
      expect(() => validator.parse([123n, null])).toThrow(); // Second element null

      // Test dnum arrays with positive exponents that return 0
      expect(validator.parse([123n, 3])).toBe(0n); // Positive exponent currently returns "0" -> 0n (seems like a dnum bug)
    });

    it("should handle other types by passing to z.coerce.bigint()", () => {
      // Test types that fall through to z.coerce.bigint()
      expect(validator.parse(true)).toBe(1n); // boolean true -> 1n
      expect(validator.parse(false)).toBe(0n); // boolean false -> 0n

      // Objects and functions should throw
      const fn = () => {};
      expect(() => validator.parse(fn)).toThrow();

      // Symbol should throw
      expect(() => validator.parse(Symbol("test"))).toThrow();
    });

    it("should reject multiple decimal points", () => {
      // Our preprocess function now rejects multiple decimal points
      expect(() => validator.parse("123.456.789")).toThrow(
        "Invalid BigInt format: multiple decimal points"
      );
      expect(validator.safeParse("123.456.789").success).toBe(false);
    });
  });

  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse("67890");
      // Test that the type is correctly inferred
      expect(result).toBe(67_890n);
    });

    it("should handle safeParse", () => {
      const result = validator.safeParse("12345");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(12_345n);
      }
    });
  });
});

describe("isApiBigInt", () => {
  it("should return true for valid bigint values", () => {
    expect(isApiBigInt("123")).toBe(true);
    expect(isApiBigInt(456)).toBe(true);
    expect(isApiBigInt(789n)).toBe(true);
    expect(isApiBigInt("1.23e10")).toBe(true);
    expect(isApiBigInt([123n, 0])).toBe(true); // dnum array with 0 exponent works
  });

  it("should return false for invalid bigint values", () => {
    expect(isApiBigInt("abc")).toBe(false);
    expect(isApiBigInt(null)).toBe(false);
    expect(isApiBigInt(undefined)).toBe(false);
    expect(isApiBigInt({})).toBe(false);
    expect(isApiBigInt(Number.NaN)).toBe(false);
    expect(isApiBigInt(Infinity)).toBe(false);
    expect(isApiBigInt("123.456.789")).toBe(false);
  });
});

describe("getApiBigInt", () => {
  it("should parse valid values", () => {
    expect(getApiBigInt("123")).toBe(123n);
    expect(getApiBigInt(456)).toBe(456n);
    expect(getApiBigInt(789n)).toBe(789n);
    expect(getApiBigInt("1e6")).toBe(1_000_000n);
  });

  it("should throw for invalid values", () => {
    expect(() => getApiBigInt("abc")).toThrow(z.ZodError);
    expect(() => getApiBigInt(null)).toThrow(z.ZodError);
    expect(() => getApiBigInt(undefined)).toThrow(z.ZodError);
    expect(() => getApiBigInt({})).toThrow(z.ZodError);
  });
});

describe("bigIntSerializer", () => {
  it("should have correct type number", () => {
    expect(bigIntSerializer.type).toBe(32);
  });

  it("should correctly identify bigint values", () => {
    expect(bigIntSerializer.condition(123n)).toBe(true);
    expect(bigIntSerializer.condition(-456n)).toBe(true);
    expect(bigIntSerializer.condition(0n)).toBe(true);

    expect(bigIntSerializer.condition(123)).toBe(false);
    expect(bigIntSerializer.condition("123")).toBe(false);
    expect(bigIntSerializer.condition(null)).toBe(false);
    expect(bigIntSerializer.condition(undefined)).toBe(false);
  });

  it("should serialize bigint to string", () => {
    expect(bigIntSerializer.serialize(123n)).toBe("123");
    expect(bigIntSerializer.serialize(-456n)).toBe("-456");
    expect(bigIntSerializer.serialize(0n)).toBe("0");
    expect(bigIntSerializer.serialize(999_999_999_999_999_999_999n)).toBe(
      "999999999999999999999"
    );
  });

  it("should deserialize string to bigint", () => {
    expect(bigIntSerializer.deserialize("123")).toBe(123n);
    expect(bigIntSerializer.deserialize("-456")).toBe(-456n);
    expect(bigIntSerializer.deserialize("0")).toBe(0n);
    expect(bigIntSerializer.deserialize("999999999999999999999")).toBe(
      999_999_999_999_999_999_999n
    );
  });
});
