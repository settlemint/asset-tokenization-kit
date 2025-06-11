import { describe, expect, it } from "bun:test";
import {
  getVerificationCode,
  isVerificationCode,
  verificationCode,
  type VerificationCode,
} from "./verification-code";

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
});

describe("helper functions", () => {
  describe("isVerificationCode", () => {
    it("should return true for valid verification codes", () => {
      expect(isVerificationCode("ABCD1234") as boolean).toBe(true);
      expect(isVerificationCode("12345678") as boolean).toBe(true);
      expect(isVerificationCode("AAAAAAAA") as boolean).toBe(true);
      expect(isVerificationCode("A1B2C3D4") as boolean).toBe(true);
      expect(isVerificationCode("ABCDEFGH") as boolean).toBe(true);
      expect(isVerificationCode("00000000") as boolean).toBe(true);
      expect(isVerificationCode("99999999") as boolean).toBe(true);
      expect(isVerificationCode("Z9Y8X7W6") as boolean).toBe(true);
    });

    it("should return false for invalid verification codes", () => {
      expect(isVerificationCode("ABCD123") as boolean).toBe(false); // too short
      expect(isVerificationCode("ABCD12345") as boolean).toBe(false); // too long
      expect(isVerificationCode("") as boolean).toBe(false);
      expect(isVerificationCode("abcd1234") as boolean).toBe(false); // lowercase
      expect(isVerificationCode("ABCD12ab") as boolean).toBe(false); // mixed case
      expect(isVerificationCode("AbCd1234") as boolean).toBe(false); // mixed case
      expect(isVerificationCode("ABCD-234") as boolean).toBe(false); // special char
      expect(isVerificationCode("ABCD_234") as boolean).toBe(false);
      expect(isVerificationCode("ABCD.234") as boolean).toBe(false);
      expect(isVerificationCode("ABCD!234") as boolean).toBe(false);
      expect(isVerificationCode("ABCD 234") as boolean).toBe(false); // space
      expect(isVerificationCode(12345678) as boolean).toBe(false); // number
      expect(isVerificationCode(null) as boolean).toBe(false);
      expect(isVerificationCode(undefined) as boolean).toBe(false);
      expect(isVerificationCode({}) as boolean).toBe(false);
    });

    it("should narrow types correctly", () => {
      const value: unknown = "ABCD1234";
      if (isVerificationCode(value)) {
        // Type should be narrowed to VerificationCode
        const code: VerificationCode = value;
        expect(code as string).toBe("ABCD1234");
      }
    });
  });

  describe("getVerificationCode", () => {
    it("should return valid verification codes", () => {
      expect(getVerificationCode("ABCD1234") as string).toBe("ABCD1234");
      expect(getVerificationCode("12345678") as string).toBe("12345678");
      expect(getVerificationCode("AAAAAAAA") as string).toBe("AAAAAAAA");
      expect(getVerificationCode("A1B2C3D4") as string).toBe("A1B2C3D4");
      expect(getVerificationCode("X7K9P2M4") as string).toBe("X7K9P2M4");
    });

    it("should throw for invalid verification codes", () => {
      expect(() => getVerificationCode("ABCD123") as string).toThrow(
        "Verification code must be exactly 8 characters"
      );
      expect(() => getVerificationCode("ABCD12345") as string).toThrow(
        "Verification code must be exactly 8 characters"
      );
      expect(() => getVerificationCode("") as string).toThrow(
        "Verification code must be exactly 8 characters"
      );
      expect(() => getVerificationCode("abcd1234") as string).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getVerificationCode("ABCD12ab") as string).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getVerificationCode("ABCD-234") as string).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getVerificationCode("ABCD 234") as string).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getVerificationCode(12345678) as string).toThrow(
        "Expected string, received number"
      );
      expect(() => getVerificationCode(null) as string).toThrow(
        "Expected string, received null"
      );
      expect(() => getVerificationCode(undefined) as string).toThrow(
        "Required"
      );
      expect(() => getVerificationCode({}) as string).toThrow(
        "Expected string, received object"
      );
    });
  });
});
