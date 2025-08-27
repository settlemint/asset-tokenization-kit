import { describe, expect, it } from "bun:test";
import { getTwoFactorCode, isTwoFactorCode, twoFactorCode } from "./two-factor-code";

describe("twoFactorCode", () => {
  const validator = twoFactorCode();

  describe("valid 2FA codes", () => {
    it("should accept valid 6-digit codes", () => {
      expect(validator.parse("123456")).toBe("123456");
      expect(validator.parse("000000")).toBe("000000");
      expect(validator.parse("999999")).toBe("999999");
      expect(validator.parse("567890")).toBe("567890");
    });

    it("should accept codes with leading zeros", () => {
      expect(validator.parse("000001")).toBe("000001");
      expect(validator.parse("001234")).toBe("001234");
      expect(validator.parse("012345")).toBe("012345");
    });

    it("should accept various numeric combinations", () => {
      expect(validator.parse("111111")).toBe("111111");
      expect(validator.parse("424242")).toBe("424242");
      expect(validator.parse("101010")).toBe("101010");
    });
  });

  describe("invalid 2FA codes", () => {
    it("should reject codes with wrong length", () => {
      expect(() => validator.parse("12345")).toThrow("Two-factor code must be exactly 6 digits");
      expect(() => validator.parse("1234567")).toThrow("Two-factor code must be exactly 6 digits");
      expect(() => validator.parse("")).toThrow("Two-factor code must be exactly 6 digits");
      expect(() => validator.parse("1")).toThrow("Two-factor code must be exactly 6 digits");
    });

    it("should reject non-numeric characters", () => {
      expect(() => validator.parse("12345a")).toThrow("Two-factor code must contain only numeric digits (0-9)");
      expect(() => validator.parse("a23456")).toThrow("Two-factor code must contain only numeric digits (0-9)");
      expect(() => validator.parse("12-456")).toThrow("Two-factor code must contain only numeric digits (0-9)");
      expect(() => validator.parse("12 456")).toThrow("Two-factor code must contain only numeric digits (0-9)");
    });

    it("should reject special characters", () => {
      expect(() => validator.parse("!23456")).toThrow("Two-factor code must contain only numeric digits (0-9)");
      expect(() => validator.parse("12345$")).toThrow("Two-factor code must contain only numeric digits (0-9)");
      expect(() => validator.parse("12#456")).toThrow("Two-factor code must contain only numeric digits (0-9)");
      expect(() => validator.parse("12.456")).toThrow("Two-factor code must contain only numeric digits (0-9)");
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123_456)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });
  });

  describe("edge cases", () => {
    it("should handle numeric string input only", () => {
      // Even though 123456 as number has 6 digits, we only accept strings
      expect(() => validator.parse(123_456)).toThrow();

      // String representation is valid
      expect(validator.parse("123456")).toBe("123456");
    });

    it("should handle codes that look like other formats", () => {
      // These are valid 6-digit codes even if they might represent dates, etc.
      expect(validator.parse("012024")).toBe("012024"); // Could be Jan 2024
      expect(validator.parse("123123")).toBe("123123"); // Repeated pattern
      expect(validator.parse("000000")).toBe("000000"); // All zeros
    });
  });

  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse("123456");
      // Test that the type is correctly inferred
      expect(result).toBe("123456");
    });

    it("should handle safeParse", () => {
      const result = validator.safeParse("567890");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("567890");
      }
    });
  });

  describe("safeParse", () => {
    it("should return success for valid 2FA codes", () => {
      const result = validator.safeParse("123456");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("123456");
      }
    });

    it("should return error for invalid 2FA codes", () => {
      const result = validator.safeParse("12345");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Two-factor code must be exactly 6 digits");
      }
    });
  });
});

describe("isTwoFactorCode type guard", () => {
  it("should return true for valid 2FA codes", () => {
    expect(isTwoFactorCode("123456")).toBe(true);
    expect(isTwoFactorCode("000000")).toBe(true);
    expect(isTwoFactorCode("999999")).toBe(true);
    expect(isTwoFactorCode("000123")).toBe(true);
  });

  it("should return false for invalid 2FA codes", () => {
    expect(isTwoFactorCode("12345")).toBe(false);
    expect(isTwoFactorCode("1234567")).toBe(false);
    expect(isTwoFactorCode("abc123")).toBe(false);
    expect(isTwoFactorCode("123 456")).toBe(false);
    expect(isTwoFactorCode(null)).toBe(false);
    expect(isTwoFactorCode(undefined)).toBe(false);
    expect(isTwoFactorCode(123_456)).toBe(false);
    expect(isTwoFactorCode({})).toBe(false);
    expect(isTwoFactorCode([])).toBe(false);
  });

  it("should narrow type correctly in TypeScript", () => {
    const value: unknown = "123456";
    if (isTwoFactorCode(value)) {
      // TypeScript should know value is TwoFactorCode here
      expect(value).toBe("123456");
    }
  });
});

describe("getTwoFactorCode helper", () => {
  it("should return valid 2FA codes", () => {
    expect(getTwoFactorCode("123456")).toBe("123456");
    expect(getTwoFactorCode("000123")).toBe("000123");
    expect(getTwoFactorCode("999999")).toBe("999999");
  });

  it("should throw for invalid 2FA codes", () => {
    expect(() => getTwoFactorCode("12345")).toThrow("Two-factor code must be exactly 6 digits");
    expect(() => getTwoFactorCode("1234567")).toThrow("Two-factor code must be exactly 6 digits");
    expect(() => getTwoFactorCode("abc123")).toThrow();
    expect(() => getTwoFactorCode("123 456")).toThrow();
    expect(() => getTwoFactorCode(null)).toThrow();
    expect(() => getTwoFactorCode(undefined)).toThrow();
  });
});

describe("TOTP compatibility", () => {
  it("should accept codes from common authenticator apps", () => {
    // Simulate codes that would come from popular TOTP apps
    const totpCodes = ["123456", "000001", "999999", "543210"];
    totpCodes.forEach((code) => {
      expect(twoFactorCode().parse(code)).toBe(code);
    });
  });

  it("should not trim whitespace (security consideration)", () => {
    expect(() => twoFactorCode().parse(" 123456")).toThrow();
    expect(() => twoFactorCode().parse("123456 ")).toThrow();
    expect(() => twoFactorCode().parse(" 123456 ")).toThrow();
  });

  it("should not transform input (codes must be exact)", () => {
    // Ensure no transformation happens - codes must match exactly
    const code = "012345";
    const result = twoFactorCode().parse(code);
    expect(result).toBe(code);
    expect(result === code).toBe(true); // Exact reference equality
  });
});
