import { describe, expect, it } from "bun:test";
import { verificationCode, type VerificationCode } from "./verification-code";

describe("verificationCode", () => {
  const validator = verificationCode;

  describe("valid verification codes", () => {
    it("should accept valid 8-character alphanumeric codes", () => {
      expect(validator.parse("ABCD1234") as string).toBe("ABCD1234");
      expect(validator.parse("12345678") as string).toBe("12345678");
      expect(validator.parse("AAAAAAAA") as string).toBe("AAAAAAAA");
      expect(validator.parse("A1B2C3D4") as string).toBe("A1B2C3D4");
    });

    it("should accept codes with only uppercase letters", () => {
      expect(validator.parse("ABCDEFGH") as string).toBe("ABCDEFGH");
      expect(validator.parse("XYZWQRST") as string).toBe("XYZWQRST");
      expect(validator.parse("ZZZZAAAA") as string).toBe("ZZZZAAAA");
    });

    it("should accept codes with only digits", () => {
      expect(validator.parse("00000000") as string).toBe("00000000");
      expect(validator.parse("12345678") as string).toBe("12345678");
      expect(validator.parse("99999999") as string).toBe("99999999");
    });

    it("should accept mixed alphanumeric codes", () => {
      expect(validator.parse("1A2B3C4D") as string).toBe("1A2B3C4D");
      expect(validator.parse("AAAA1111") as string).toBe("AAAA1111");
      expect(validator.parse("Z9Y8X7W6") as string).toBe("Z9Y8X7W6");
    });
  });

  describe("invalid verification codes", () => {
    it("should reject codes with wrong length", () => {
      expect(() => validator.parse("ABCD123") as string).toThrow(
        "Verification code must be exactly 8 characters"
      );
      expect(() => validator.parse("ABCD12345") as string).toThrow(
        "Verification code must be exactly 8 characters"
      );
      expect(() => validator.parse("") as string).toThrow(
        "Verification code must be exactly 8 characters"
      );
      expect(() => validator.parse("ABC") as string).toThrow(
        "Verification code must be exactly 8 characters"
      );
    });

    it("should reject lowercase letters", () => {
      expect(() => validator.parse("abcd1234") as string).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => validator.parse("ABCD12ab") as string).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => validator.parse("AbCd1234") as string).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
    });

    it("should reject special characters", () => {
      expect(() => validator.parse("ABCD-234") as string).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => validator.parse("ABCD_234") as string).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => validator.parse("ABCD.234") as string).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => validator.parse("ABCD!234") as string).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => validator.parse("ABCD 234") as string).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(12345678) as string).toThrow();
      expect(() => validator.parse(null) as string).toThrow();
      expect(() => validator.parse(undefined) as string).toThrow();
      expect(() => validator.parse({}) as string).toThrow();
    });
  });

  describe("common verification code patterns", () => {
    it("should accept common verification code formats", () => {
      // Sequential patterns
      expect(validator.parse("ABCD1234") as string).toBe("ABCD1234");

      // Repeated patterns
      expect(validator.parse("AA11BB22") as string).toBe("AA11BB22");

      // Random looking codes
      expect(validator.parse("X7K9P2M4") as string).toBe("X7K9P2M4");

      // All same character (though not secure)
      expect(validator.parse("11111111") as string).toBe("11111111");
    });
  });

  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse("ABCD1234");
      // Test that the type is correctly inferred
      const _typeCheck: VerificationCode = result;
      expect(result).toBe("ABCD1234");
    });

    it("should handle safeParse", () => {
      const result = validator.safeParse("X7K9P2M4");
      expect(result.success).toBe(true);
      if (result.success) {
        const _typeCheck: VerificationCode = result.data;
        expect(result.data).toBe("X7K9P2M4");
      }
    });
  });
});
