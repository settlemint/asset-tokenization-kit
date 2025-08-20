import { describe, expect, test } from "bun:test";
import { getPincode, isPincode, pincode } from "../../src/pincode";

describe("PINCODE", () => {
  const validator = pincode();

  describe("valid pincodes", () => {
    test("should accept 6-digit pincodes", () => {
      const pincode1 = validator.parse("123456");
      const pincode2 = validator.parse("000000");
      const pincode3 = validator.parse("999999");
      const pincode4 = validator.parse("567890");

      expect(pincode1).toBe("123456");
      expect(pincode2).toBe("000000");
      expect(pincode3).toBe("999999");
      expect(pincode4).toBe("567890");
    });

    test("should accept pincodes with leading zeros", () => {
      const pincode1 = validator.parse("000001");
      const pincode2 = validator.parse("001234");
      const pincode3 = validator.parse("012345");

      expect(pincode1).toBe("000001");
      expect(pincode2).toBe("001234");
      expect(pincode3).toBe("012345");
    });
  });

  describe("invalid pincodes", () => {
    test("should reject PIN codes with wrong length", () => {
      expect(() => validator.parse("12345")).toThrow("PIN code must be exactly 6 digits");
      expect(() => validator.parse("1234567")).toThrow("PIN code must be exactly 6 digits");
      expect(() => validator.parse("")).toThrow("PIN code must be exactly 6 digits");
      expect(() => validator.parse("1")).toThrow("PIN code must be exactly 6 digits");
    });

    test("should reject non-numeric characters", () => {
      expect(() => validator.parse("12345a")).toThrow("PIN code must contain only numeric digits (0-9)");
      expect(() => validator.parse("a23456")).toThrow("PIN code must contain only numeric digits (0-9)");
      expect(() => validator.parse("12-456")).toThrow("PIN code must contain only numeric digits (0-9)");
      expect(() => validator.parse("12 456")).toThrow("PIN code must contain only numeric digits (0-9)");
      expect(() => validator.parse("12.456")).toThrow("PIN code must contain only numeric digits (0-9)");
    });

    test("should reject special characters", () => {
      expect(() => validator.parse("!23456")).toThrow("PIN code must contain only numeric digits (0-9)");
      expect(() => validator.parse("12345$")).toThrow("PIN code must contain only numeric digits (0-9)");
      expect(() => validator.parse("12#456")).toThrow("PIN code must contain only numeric digits (0-9)");
      expect(() => validator.parse("@#$%^&")).toThrow("PIN code must contain only numeric digits (0-9)");
    });

    test("should reject non-string types", () => {
      expect(() => validator.parse(123_456)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
      expect(() => validator.parse([])).toThrow();
      expect(() => validator.parse(true)).toThrow();
      expect(() => validator.parse(false)).toThrow();
    });
  });

  describe("edge cases", () => {
    test("should handle numeric string input only", () => {
      // Even though 123456 as number has 6 digits, we only accept strings
      expect(() => validator.parse(123_456)).toThrow();

      // String representation is valid
      expect(validator.parse("123456")).toBe("123456");
    });
  });

  describe("safeParse", () => {
    test("should return success for valid pincode", () => {
      const result = validator.safeParse("123456");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("123456");
      }
    });

    test("should return error for invalid pincode", () => {
      const result = validator.safeParse("12345");
      expect(result.success).toBe(false);
    });
  });

  describe("type checking", () => {
    test("should return proper type", () => {
      const result = validator.parse("567890");
      // Test that the type is correctly inferred
      expect(result).toBe("567890");
    });

    test("should handle safeParse", () => {
      const result = validator.safeParse("987654");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("987654");
      }
    });
  });
});

describe("isPincode type guard", () => {
  test("should return true for valid PIN codes", () => {
    expect(isPincode("123456")).toBe(true);
    expect(isPincode("000000")).toBe(true);
    expect(isPincode("999999")).toBe(true);
    expect(isPincode("000123")).toBe(true);
  });

  test("should return false for invalid PIN codes", () => {
    expect(isPincode("12345")).toBe(false);
    expect(isPincode("1234567")).toBe(false);
    expect(isPincode("abc123")).toBe(false);
    expect(isPincode("123 456")).toBe(false);
    expect(isPincode(null)).toBe(false);
    expect(isPincode(undefined)).toBe(false);
    expect(isPincode(123_456)).toBe(false);
    expect(isPincode({})).toBe(false);
    expect(isPincode([])).toBe(false);
  });

  test("should narrow type correctly in TypeScript", () => {
    const value: unknown = "123456";
    if (isPincode(value)) {
      // TypeScript should know value is Pincode here
      expect(value).toBe("123456");
    }
  });
});

describe("getPincode helper", () => {
  test("should return valid PIN codes", () => {
    expect(getPincode("123456")).toBe("123456");
    expect(getPincode("000123")).toBe("000123");
    expect(getPincode("999999")).toBe("999999");
  });

  test("should throw for invalid PIN codes", () => {
    expect(() => getPincode("12345")).toThrow("PIN code must be exactly 6 digits");
    expect(() => getPincode("1234567")).toThrow("PIN code must be exactly 6 digits");
    expect(() => getPincode("abc123")).toThrow();
    expect(() => getPincode("123 456")).toThrow();
    expect(() => getPincode(null)).toThrow();
    expect(() => getPincode(undefined)).toThrow();
  });
});

describe("security and edge cases", () => {
  test("should not trim whitespace automatically", () => {
    expect(() => pincode().parse(" 123456")).toThrow();
    expect(() => pincode().parse("123456 ")).toThrow();
    expect(() => pincode().parse(" 123456 ")).toThrow();
    expect(() => pincode().parse("\t123456")).toThrow();
    expect(() => pincode().parse("123456\n")).toThrow();
  });

  test("should handle numeric-looking strings correctly", () => {
    expect(() => pincode().parse("1e5678")).toThrow(); // Scientific notation
    expect(() => pincode().parse("0x1234")).toThrow(); // Hex notation
    expect(() => pincode().parse("123456.0")).toThrow(); // Decimal
    expect(() => pincode().parse("123,456")).toThrow(); // Thousands separator
    expect(() => pincode().parse("ABCDEF")).toThrow(); // Uppercase hex-like
    expect(() => pincode().parse("abcdef")).toThrow(); // Lowercase hex-like
  });

  test("should not accept common weak PINs (documentation only)", () => {
    // These are valid format-wise but weak security-wise
    // This test documents that the validator only checks format, not strength
    const weakPins = ["000000", "111111", "123456", "654321", "123123"];
    weakPins.forEach((pin) => {
      const result = pincode().parse(pin);
      expect(result).toBe(pin);
    });
  });

  test("should handle unicode and emoji characters", () => {
    expect(() => pincode().parse("12345😊")).toThrow();
    expect(() => pincode().parse("１２３４５６")).toThrow(); // Full-width numbers
    expect(() => pincode().parse("¹²³⁴⁵⁶")).toThrow(); // Superscript numbers
    expect(() => pincode().parse("₁₂₃₄₅₆")).toThrow(); // Subscript numbers
  });

  test("should reject strings that look like 6 digits but aren't", () => {
    expect(() => pincode().parse("12\u200B3456")).toThrow(); // Zero-width space
    expect(() => pincode().parse("12\u00AD3456")).toThrow(); // Soft hyphen
    expect(() => pincode().parse("12\uFEFF3456")).toThrow(); // Zero-width no-break space
  });

  test("should handle empty-like values", () => {
    expect(() => pincode().parse("      ")).toThrow(); // Six spaces
    expect(() => pincode().parse("\0\0\0\0\0\0")).toThrow(); // Null characters
    expect(() => pincode().parse("\r\n\r\n\r\n")).toThrow(); // Line endings
  });
});

describe("schema metadata", () => {
  test("should have correct description", () => {
    const schema = pincode();
    expect(schema.description).toBe("6-digit PIN code");
  });

  test("should validate after multiple instantiations", () => {
    const schema1 = pincode();
    const schema2 = pincode();

    expect(schema1.parse("123456")).toBe("123456");
    expect(schema2.parse("654321")).toBe("654321");

    // Both should fail on same invalid input
    expect(() => schema1.parse("12345")).toThrow();
    expect(() => schema2.parse("12345")).toThrow();
  });
});

describe("error message validation", () => {
  test("should provide correct error message for length validation", () => {
    const result = pincode().safeParse("12345");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("PIN code must be exactly 6 digits");
      expect(result.error.issues[0]?.code).toBe("too_small");
    }
  });

  test("should provide correct error message for regex validation", () => {
    const result = pincode().safeParse("12345a");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("PIN code must contain only numeric digits (0-9)");
      expect(result.error.issues[0]?.code).toBe("invalid_format");
    }
  });

  test("should handle non-string input with appropriate error", () => {
    const result = pincode().safeParse(123_456);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.code).toBe("invalid_type");
      expect((result.error.issues[0] as { expected?: string })?.expected).toBe("string");
      // Type checking only includes the error code
    }
  });

  test("should provide error for too long PIN codes", () => {
    const result = pincode().safeParse("1234567");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("PIN code must be exactly 6 digits");
      expect(result.error.issues[0]?.code).toBe("too_big");
    }
  });
});

describe("comprehensive type validation", () => {
  test("should reject all non-string types", () => {
    const invalidInputs = [
      123_456,
      true,
      false,
      null,
      undefined,
      {},
      { value: "123456" },
      [],
      ["1", "2", "3", "4", "5", "6"],
      new Date(),
      /123456/,
      Symbol("123456"),
      BigInt(123_456),
      new Error("123456"),
      () => "123456",
    ];

    invalidInputs.forEach((input) => {
      expect(() => pincode().parse(input)).toThrow();
      expect(isPincode(input)).toBe(false);
      expect(() => getPincode(input)).toThrow();
    });
  });

  test("should handle boundary cases for safeParse", () => {
    const results = [
      pincode().safeParse(""),
      pincode().safeParse("1234567890"),
      pincode().safeParse("abcdef"),
      pincode().safeParse(" "),
    ];

    results.forEach((result) => {
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });
});

describe("parsing behavior consistency", () => {
  test("should have consistent behavior between parse and safeParse", () => {
    const validInput = "123456";
    const invalidInput = "12345";

    // Valid input should work for both
    expect(pincode().parse(validInput)).toBe(validInput);
    const safeResult = pincode().safeParse(validInput);
    expect(safeResult.success).toBe(true);
    if (safeResult.success) {
      expect(safeResult.data).toBe(validInput);
    }

    // Invalid input should fail for both
    expect(() => pincode().parse(invalidInput)).toThrow();
    const safeInvalidResult = pincode().safeParse(invalidInput);
    expect(safeInvalidResult.success).toBe(false);
  });

  test("should handle the exact boundary cases", () => {
    // Exactly 5 digits - too short
    expect(() => pincode().parse("12345")).toThrow();

    // Exactly 6 digits - valid
    expect(pincode().parse("123456")).toBe("123456");

    // Exactly 7 digits - too long
    expect(() => pincode().parse("1234567")).toThrow();
  });

  test("should validate the regex pattern after length check", () => {
    // This tests that both validations are applied
    // If it passes length but fails regex
    const sixCharNonDigit = "12345x";
    const result = pincode().safeParse(sixCharNonDigit);
    expect(result.success).toBe(false);
    if (!result.success) {
      // Should fail on regex, not length
      expect(result.error.issues[0]?.message).toBe("PIN code must contain only numeric digits (0-9)");
    }
  });
});

describe("zod schema behavior", () => {
  test("should create independent schema instances", () => {
    const schema1 = pincode();
    const schema2 = pincode();

    // They should be different instances
    expect(schema1).not.toBe(schema2);

    // But behave the same
    expect(schema1.parse("123456")).toBe("123456");
    expect(schema2.parse("123456")).toBe("123456");

    // Both should throw on same invalid input
    expect(() => schema1.parse("invalid")).toThrow();
    expect(() => schema2.parse("invalid")).toThrow();
  });

  test("should have consistent schema description", () => {
    const schema = pincode();
    expect(schema.description).toBe("6-digit PIN code");

    // Description should be the same for all instances
    const schema2 = pincode();
    expect(schema2.description).toBe("6-digit PIN code");
  });

  test("should validate consistently across multiple calls", () => {
    const schema = pincode();

    // Multiple calls with same input should produce same result
    expect(schema.parse("123456")).toBe("123456");
    expect(schema.parse("123456")).toBe("123456");
    expect(schema.parse("123456")).toBe("123456");

    // Multiple failures should be consistent
    expect(() => schema.parse("abc")).toThrow();
    expect(() => schema.parse("abc")).toThrow();
  });
});
