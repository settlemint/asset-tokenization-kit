import { describe, expect, it } from "bun:test";
import { twoFactorCode, type TwoFactorCode } from "./two-factor-code";

describe("twoFactorCode", () => {
  const validator = twoFactorCode();

  describe("valid 2FA codes", () => {
    it("should accept valid 6-digit codes", () => {
      expect(validator.parse("123456") as string).toBe("123456");
      expect(validator.parse("000000") as string).toBe("000000");
      expect(validator.parse("999999") as string).toBe("999999");
      expect(validator.parse("567890") as string).toBe("567890");
    });

    it("should accept codes with leading zeros", () => {
      expect(validator.parse("000001") as string).toBe("000001");
      expect(validator.parse("001234") as string).toBe("001234");
      expect(validator.parse("012345") as string).toBe("012345");
    });

    it("should accept various numeric combinations", () => {
      expect(validator.parse("111111") as string).toBe("111111");
      expect(validator.parse("424242") as string).toBe("424242");
      expect(validator.parse("101010") as string).toBe("101010");
    });
  });

  describe("invalid 2FA codes", () => {
    it("should reject codes with wrong length", () => {
      expect(() => validator.parse("12345")).toThrow(
        "Two-factor code must be exactly 6 digits"
      );
      expect(() => validator.parse("1234567")).toThrow(
        "Two-factor code must be exactly 6 digits"
      );
      expect(() => validator.parse("")).toThrow(
        "Two-factor code must be exactly 6 digits"
      );
      expect(() => validator.parse("1")).toThrow(
        "Two-factor code must be exactly 6 digits"
      );
    });

    it("should reject non-numeric characters", () => {
      expect(() => validator.parse("12345a")).toThrow(
        "Two-factor code must contain only numeric digits (0-9)"
      );
      expect(() => validator.parse("a23456")).toThrow(
        "Two-factor code must contain only numeric digits (0-9)"
      );
      expect(() => validator.parse("12-456")).toThrow(
        "Two-factor code must contain only numeric digits (0-9)"
      );
      expect(() => validator.parse("12 456")).toThrow(
        "Two-factor code must contain only numeric digits (0-9)"
      );
    });

    it("should reject special characters", () => {
      expect(() => validator.parse("!23456")).toThrow(
        "Two-factor code must contain only numeric digits (0-9)"
      );
      expect(() => validator.parse("12345$")).toThrow(
        "Two-factor code must contain only numeric digits (0-9)"
      );
      expect(() => validator.parse("12#456")).toThrow(
        "Two-factor code must contain only numeric digits (0-9)"
      );
      expect(() => validator.parse("12.456")).toThrow(
        "Two-factor code must contain only numeric digits (0-9)"
      );
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123456)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });
  });

  describe("edge cases", () => {
    it("should handle numeric string input only", () => {
      // Even though 123456 as number has 6 digits, we only accept strings
      expect(() => validator.parse(123456)).toThrow();

      // String representation is valid
      expect(validator.parse("123456") as string).toBe("123456");
    });

    it("should handle codes that look like other formats", () => {
      // These are valid 6-digit codes even if they might represent dates, etc.
      expect(validator.parse("012024") as string).toBe("012024"); // Could be Jan 2024
      expect(validator.parse("123123") as string).toBe("123123"); // Repeated pattern
      expect(validator.parse("000000") as string).toBe("000000"); // All zeros
    });
  });

  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse("123456");
      // Test that the type is correctly inferred
      const _typeCheck: TwoFactorCode = result;
      expect(result).toBe("123456");
    });

    it("should handle safeParse", () => {
      const result = validator.safeParse("567890");
      expect(result.success).toBe(true);
      if (result.success) {
        const _typeCheck: TwoFactorCode = result.data;
        expect(result.data).toBe("567890");
      }
    });
  });
});
