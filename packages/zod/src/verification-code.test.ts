import { describe, expect, it, test } from "bun:test";
import {
  getVerificationCode,
  isVerificationCode,
  type VerificationCode,
  verificationCode,
} from "./verification-code";

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

    it("should handle safeParse with invalid input", () => {
      const result = validator.safeParse("invalid");
      expect(result.success).toBe(false);
      if (!result.success) {
        // The string "invalid" is 7 characters, so it fails length check first
        expect(result.error.issues.length).toBeGreaterThanOrEqual(1);
        const messages = result.error.issues.map((issue) => issue.message);
        expect(messages).toContain(
          "Verification code must be exactly 8 characters"
        );
      }
    });
  });

  describe("edge cases", () => {
    it("should reject strings with exactly 8 characters but invalid content", () => {
      // 8 spaces
      expect(() => validator.parse("        ")).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );

      // 8 special characters
      expect(() => validator.parse("!@#$%^&*")).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );

      // Mixed valid and invalid characters
      expect(() => validator.parse("ABC 1234")).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
    });

    it("should handle extreme inputs", () => {
      // Very long string
      const longString = "A".repeat(1000);
      expect(() => validator.parse(longString)).toThrow(
        "Verification code must be exactly 8 characters"
      );

      // Unicode characters
      expect(() => validator.parse("ÀÁÂÃÄÅÆÇ")).toThrow(
        "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
      );

      // Emoji
      expect(() => validator.parse("😀😀😀😀😀😀😀😀")).toThrow();
    });
  });
});

describe("isVerificationCode", () => {
  test("should return true for valid verification codes", () => {
    expect(isVerificationCode("ABCD1234")).toBe(true);
    expect(isVerificationCode("12345678")).toBe(true);
    expect(isVerificationCode("AAAAAAAA")).toBe(true);
    expect(isVerificationCode("Z9Y8X7W6")).toBe(true);
  });

  test("should return false for invalid verification codes", () => {
    expect(isVerificationCode("ABCD123")).toBe(false);
    expect(isVerificationCode("ABCD12345")).toBe(false);
    expect(isVerificationCode("abcd1234")).toBe(false);
    expect(isVerificationCode("ABCD-234")).toBe(false);
    expect(isVerificationCode("ABCD 234")).toBe(false);
    expect(isVerificationCode("")).toBe(false);
    expect(isVerificationCode("        ")).toBe(false);
  });

  test("should return false for non-string types", () => {
    expect(isVerificationCode(12_345_678)).toBe(false);
    expect(isVerificationCode(null)).toBe(false);
    expect(isVerificationCode(undefined)).toBe(false);
    expect(isVerificationCode({})).toBe(false);
    expect(isVerificationCode([])).toBe(false);
    expect(isVerificationCode(true)).toBe(false);
    expect(isVerificationCode(false)).toBe(false);
    expect(isVerificationCode(Symbol("test"))).toBe(false);
  });

  test("should work as type guard", () => {
    const value: unknown = "ABCD1234";
    if (isVerificationCode(value)) {
      // TypeScript should know value is VerificationCode here
      const code: VerificationCode = value;
      expect(code).toBe("ABCD1234");
    } else {
      throw new Error("Should have been valid");
    }
  });
});

describe("getVerificationCode", () => {
  test("should return valid verification codes", () => {
    expect(getVerificationCode("ABCD1234")).toBe("ABCD1234");
    expect(getVerificationCode("12345678")).toBe("12345678");
    expect(getVerificationCode("AAAAAAAA")).toBe("AAAAAAAA");
    expect(getVerificationCode("Z9Y8X7W6")).toBe("Z9Y8X7W6");
  });

  test("should throw for invalid verification codes", () => {
    expect(() => getVerificationCode("ABCD123")).toThrow(
      "Verification code must be exactly 8 characters"
    );
    expect(() => getVerificationCode("ABCD12345")).toThrow(
      "Verification code must be exactly 8 characters"
    );
    expect(() => getVerificationCode("")).toThrow(
      "Verification code must be exactly 8 characters"
    );
  });

  test("should throw for invalid characters", () => {
    expect(() => getVerificationCode("abcd1234")).toThrow(
      "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
    );
    expect(() => getVerificationCode("ABCD-234")).toThrow(
      "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
    );
    expect(() => getVerificationCode("ABCD 234")).toThrow(
      "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
    );
    expect(() => getVerificationCode("ABC@1234")).toThrow(
      "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
    );
  });

  test("should throw for non-string types", () => {
    expect(() => getVerificationCode(12_345_678)).toThrow();
    expect(() => getVerificationCode(null)).toThrow();
    expect(() => getVerificationCode(undefined)).toThrow();
    expect(() => getVerificationCode({})).toThrow();
    expect(() => getVerificationCode([])).toThrow();
    expect(() => getVerificationCode(true)).toThrow();
    expect(() => getVerificationCode(false)).toThrow();
  });

  test("should provide detailed error information", () => {
    try {
      getVerificationCode("abc");
      throw new Error("Should have thrown");
    } catch (error) {
      expect(error).toBeDefined();
      // Zod throws ZodError which has issues array
      if (error && typeof error === "object" && "issues" in error) {
        expect(error.issues).toBeDefined();
      }
    }
  });

  test("should return proper type", () => {
    const result: VerificationCode = getVerificationCode("ABCD1234");
    expect(result).toBe("ABCD1234");
  });
});

describe("schema metadata", () => {
  test("should have proper description", () => {
    expect(verificationCode.description).toBe("Verification code");
  });

  test("should validate boundary cases", () => {
    // All uppercase letters A-Z
    expect(verificationCode.parse("ABCDEFGH")).toBe("ABCDEFGH");
    expect(verificationCode.parse("IJKLMNOP")).toBe("IJKLMNOP");
    expect(verificationCode.parse("QRSTUVWX")).toBe("QRSTUVWX");
    expect(verificationCode.parse("YZABCDEF")).toBe("YZABCDEF");

    // All digits 0-9
    expect(verificationCode.parse("01234567")).toBe("01234567");
    expect(verificationCode.parse("89012345")).toBe("89012345");

    // Edge of valid range
    expect(verificationCode.parse("A0A0A0A0")).toBe("A0A0A0A0");
    expect(verificationCode.parse("Z9Z9Z9Z9")).toBe("Z9Z9Z9Z9");
  });
});
