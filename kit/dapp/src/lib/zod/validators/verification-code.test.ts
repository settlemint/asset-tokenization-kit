import { describe, expect, it } from "vitest";
import { verificationCode } from "./verification-code";

describe("verificationCode", () => {
  const validator = verificationCode;

  describe("valid verification codes", () => {
    it("should accept valid 8-character alphanumeric codes", () => {
      expect(validator.parse("ABCD1234")).toBe("ABCD1234");
      expect(validator.parse("12345678")).toBe("12345678");
      expect(validator.parse("AAAAAAAA")).toBe("AAAAAAAA");
      expect(validator.parse("A1B2C3D4")).toBe("A1B2C3D4");
    });

    it("should accept codes with only uppercase letters", () => {
      expect(validator.parse("ABCDEFGH")).toBe("ABCDEFGH");
      expect(validator.parse("XYZWQRST")).toBe("XYZWQRST");
      expect(validator.parse("ZZZZAAAA")).toBe("ZZZZAAAA");
    });

    it("should accept codes with only digits", () => {
      expect(validator.parse("00000000")).toBe("00000000");
      expect(validator.parse("12345678")).toBe("12345678");
      expect(validator.parse("99999999")).toBe("99999999");
    });

    it("should accept mixed alphanumeric codes", () => {
      expect(validator.parse("1A2B3C4D")).toBe("1A2B3C4D");
      expect(validator.parse("AAAA1111")).toBe("AAAA1111");
      expect(validator.parse("Z9Y8X7W6")).toBe("Z9Y8X7W6");
    });
  });

  describe("invalid verification codes", () => {
    it("should reject codes with wrong length", () => {
      expect(() => validator.parse("ABCD123")).toThrow(
        "Verification code must be exactly 8 characters"
      );
      expect(() => validator.parse("ABCD12345")).toThrow(
        "Verification code must be exactly 8 characters"
      );
      expect(() => validator.parse("")).toThrow(
        "Verification code must be exactly 8 characters"
      );
      expect(() => validator.parse("ABC")).toThrow(
        "Verification code must be exactly 8 characters"
      );
    });

    it("should reject lowercase letters", () => {
      expect(() => validator.parse("abcd1234")).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => validator.parse("ABCD12ab")).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => validator.parse("AbCd1234")).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
    });

    it("should reject special characters", () => {
      expect(() => validator.parse("ABCD-234")).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => validator.parse("ABCD_234")).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => validator.parse("ABCD.234")).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => validator.parse("ABCD!234")).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => validator.parse("ABCD 234")).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(12_345_678)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });
  });

  describe("common verification code patterns", () => {
    it("should accept common verification code formats", () => {
      // Sequential patterns
      expect(validator.parse("ABCD1234")).toBe("ABCD1234");

      // Repeated patterns
      expect(validator.parse("AA11BB22")).toBe("AA11BB22");

      // Random looking codes
      expect(validator.parse("X7K9P2M4")).toBe("X7K9P2M4");

      // All same character (though not secure)
      expect(validator.parse("11111111")).toBe("11111111");
    });
  });

  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse("ABCD1234");
      // Test that the type is correctly inferred
      expect(result).toBe("ABCD1234");
    });

    it("should handle safeParse", () => {
      const result = validator.safeParse("X7K9P2M4");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("X7K9P2M4");
      }
    });
  });
});
