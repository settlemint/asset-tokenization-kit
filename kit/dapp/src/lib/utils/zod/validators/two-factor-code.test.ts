import { describe, expect, it } from "bun:test";
import {
  getTwoFactorCode,
  isTwoFactorCode,
  twoFactorCode,
  type TwoFactorCode,
} from "./two-factor-code";

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
});

describe("helper functions", () => {
  describe("isTwoFactorCode", () => {
    it("should return true for valid 2FA codes", () => {
      expect(isTwoFactorCode("123456")).toBe(true);
      expect(isTwoFactorCode("000000")).toBe(true);
      expect(isTwoFactorCode("999999")).toBe(true);
      expect(isTwoFactorCode("567890")).toBe(true);
      expect(isTwoFactorCode("000001")).toBe(true);
      expect(isTwoFactorCode("001234")).toBe(true);
      expect(isTwoFactorCode("012345")).toBe(true);
    });

    it("should return false for invalid 2FA codes", () => {
      expect(isTwoFactorCode("12345")).toBe(false); // too short
      expect(isTwoFactorCode("1234567")).toBe(false); // too long
      expect(isTwoFactorCode("")).toBe(false);
      expect(isTwoFactorCode("1")).toBe(false);
      expect(isTwoFactorCode("12345a")).toBe(false); // contains letter
      expect(isTwoFactorCode("a23456")).toBe(false);
      expect(isTwoFactorCode("12-456")).toBe(false); // contains dash
      expect(isTwoFactorCode("12 456")).toBe(false); // contains space
      expect(isTwoFactorCode("!23456")).toBe(false); // special character
      expect(isTwoFactorCode("12.456")).toBe(false); // contains dot
      expect(isTwoFactorCode(123456)).toBe(false); // number type
      expect(isTwoFactorCode(null)).toBe(false);
      expect(isTwoFactorCode(undefined)).toBe(false);
      expect(isTwoFactorCode({})).toBe(false);
    });

    it("should narrow types correctly", () => {
      const value: unknown = "123456";
      if (isTwoFactorCode(value)) {
        // Type should be narrowed to TwoFactorCode
        const code: TwoFactorCode = value;
        expect(code as string).toBe("123456");
      }
    });
  });

  describe("getTwoFactorCode", () => {
    it("should return valid 2FA codes", () => {
      expect(getTwoFactorCode("123456") as string).toBe("123456");
      expect(getTwoFactorCode("000000") as string).toBe("000000");
      expect(getTwoFactorCode("999999") as string).toBe("999999");
      expect(getTwoFactorCode("567890") as string).toBe("567890");
      expect(getTwoFactorCode("012024") as string).toBe("012024");
    });

    it("should throw for invalid 2FA codes", () => {
      expect(() => getTwoFactorCode("12345")).toThrow(
        "Two-factor code must be exactly 6 digits"
      );
      expect(() => getTwoFactorCode("1234567")).toThrow(
        "Two-factor code must be exactly 6 digits"
      );
      expect(() => getTwoFactorCode("")).toThrow("Two-factor code must be exactly 6 digits");
      expect(() => getTwoFactorCode("12345a")).toThrow(
        "Two-factor code must contain only numeric digits (0-9)"
      );
      expect(() => getTwoFactorCode("a23456")).toThrow(
        "Two-factor code must contain only numeric digits (0-9)"
      );
      expect(() => getTwoFactorCode("12-456")).toThrow(
        "Two-factor code must contain only numeric digits (0-9)"
      );
      expect(() => getTwoFactorCode("12 456")).toThrow(
        "Two-factor code must contain only numeric digits (0-9)"
      );
      expect(() => getTwoFactorCode("!23456")).toThrow(
        "Two-factor code must contain only numeric digits (0-9)"
      );
      expect(() => getTwoFactorCode(123456)).toThrow(
        "Expected string, received number"
      );
      expect(() => getTwoFactorCode(null)).toThrow(
        "Expected string, received null"
      );
      expect(() => getTwoFactorCode(undefined)).toThrow(
        "Required"
      );
      expect(() => getTwoFactorCode({})).toThrow(
        "Expected string, received object"
      );
    });
  });
});
