import { describe, expect, it } from "bun:test";
import { getSecretCode, isSecretCode, secretCode } from "./secret-code";

describe("secretCode", () => {
  const validator = secretCode();

  describe("valid secret codes", () => {
    it("should accept minimum length codes", () => {
      expect(validator.parse("12345678")).toBe("12345678"); // 8 chars
      expect(validator.parse("abcdefgh")).toBe("abcdefgh");
    });

    it("should accept maximum length codes", () => {
      const maxCode = "a".repeat(64);
      expect(validator.parse(maxCode)).toBe(maxCode);
    });

    it("should accept codes with various characters", () => {
      expect(validator.parse("MySecret123!")).toBe("MySecret123!");
      expect(validator.parse("p@ssw0rd_2024")).toBe("p@ssw0rd_2024");
      expect(validator.parse("UPPER-lower-123")).toBe("UPPER-lower-123");
      expect(validator.parse("with spaces here")).toBe("with spaces here");
    });

    it("should accept codes with special characters", () => {
      expect(validator.parse("!@#$%^&*()")).toBe("!@#$%^&*()");
      expect(validator.parse(String.raw`{}[]|\:;"'<>,.?/`)).toBe(String.raw`{}[]|\:;"'<>,.?/`);
      expect(validator.parse("emoji🔑code")).toBe("emoji🔑code");
    });
  });

  describe("invalid secret codes", () => {
    it("should reject codes shorter than 8 characters", () => {
      expect(() => validator.parse("1234567")).toThrow("Secret code must be at least 8 characters long");
      expect(() => validator.parse("short")).toThrow("Secret code must be at least 8 characters long");
      expect(() => validator.parse("")).toThrow("Secret code must be at least 8 characters long");
    });

    it("should reject codes longer than 64 characters", () => {
      const tooLong = "a".repeat(65);
      expect(() => validator.parse(tooLong)).toThrow("Secret code must not exceed 64 characters");
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(12_345_678)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });
  });

  describe("edge cases", () => {
    it("should accept exactly 8 characters", () => {
      expect(validator.parse("exactly8")).toBe("exactly8");
    });

    it("should accept exactly 64 characters", () => {
      const exact64 = "x".repeat(64);
      expect(validator.parse(exact64)).toBe(exact64);
    });

    it("should handle whitespace", () => {
      expect(validator.parse("        ")).toBe("        "); // 8 spaces
      expect(validator.parse("  code  ")).toBe("  code  "); // with padding
      expect(validator.parse("\t\n\r test")).toBe("\t\n\r test"); // special whitespace
    });
  });
  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse("MySecret123!");
      // Test that the type is correctly inferred
      expect(result).toBe("MySecret123!");
    });

    it("should handle safeParse", () => {
      const result = validator.safeParse("p@ssw0rd_2024");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("p@ssw0rd_2024");
      }
    });
  });
});

describe("isSecretCode", () => {
  it("should return true for valid secret codes", () => {
    expect(isSecretCode("12345678")).toBe(true);
    expect(isSecretCode("MySecret123!")).toBe(true);
    expect(isSecretCode("p@ssw0rd_2024")).toBe(true);
    expect(isSecretCode("a".repeat(64))).toBe(true);
    expect(isSecretCode("!@#$%^&*()")).toBe(true);
  });

  it("should return false for invalid secret codes", () => {
    expect(isSecretCode("1234567")).toBe(false);
    expect(isSecretCode("")).toBe(false);
    expect(isSecretCode("a".repeat(65))).toBe(false);
    expect(isSecretCode(null)).toBe(false);
    expect(isSecretCode(undefined)).toBe(false);
    expect(isSecretCode(12_345_678)).toBe(false);
    expect(isSecretCode({})).toBe(false);
    expect(isSecretCode([])).toBe(false);
  });

  it("should work as a type guard", () => {
    const value: unknown = "MySecretKey123!";
    if (isSecretCode(value)) {
      // TypeScript should recognize value as SecretCode here
      const length = value.length;
      expect(length).toBeGreaterThanOrEqual(8);
      expect(length).toBeLessThanOrEqual(64);
    }
  });
});

describe("getSecretCode", () => {
  it("should return valid secret codes", () => {
    expect(getSecretCode("12345678")).toBe("12345678");
    expect(getSecretCode("MySecret123!")).toBe("MySecret123!");
    expect(getSecretCode("p@ssw0rd_2024")).toBe("p@ssw0rd_2024");
    expect(getSecretCode("a".repeat(64))).toBe("a".repeat(64));
  });

  it("should throw for invalid secret codes", () => {
    expect(() => getSecretCode("1234567")).toThrow("Secret code must be at least 8 characters long");
    expect(() => getSecretCode("")).toThrow("Secret code must be at least 8 characters long");
    expect(() => getSecretCode("a".repeat(65))).toThrow("Secret code must not exceed 64 characters");
  });

  it("should throw for non-string types", () => {
    expect(() => getSecretCode(null)).toThrow();
    expect(() => getSecretCode(undefined)).toThrow();
    expect(() => getSecretCode(12_345_678)).toThrow();
    expect(() => getSecretCode({})).toThrow();
    expect(() => getSecretCode([])).toThrow();
  });

  it("should be useful in functions requiring SecretCode type", () => {
    const validateApiKey = (key: unknown) => {
      const validatedKey = getSecretCode(key);
      return validatedKey.length >= 8;
    };

    expect(validateApiKey("myApiKey123")).toBe(true);
    expect(() => validateApiKey("short")).toThrow();
  });
});
