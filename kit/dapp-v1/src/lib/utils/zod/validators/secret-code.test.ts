import { describe, expect, it } from "bun:test";
import { secretCode, type SecretCode } from "./secret-code";

describe("secretCode", () => {
  const validator = secretCode();

  describe("valid secret codes", () => {
    it("should accept minimum length codes", () => {
      expect(validator.parse("12345678") as string).toBe("12345678"); // 8 chars
      expect(validator.parse("abcdefgh") as string).toBe("abcdefgh");
    });

    it("should accept maximum length codes", () => {
      const maxCode = "a".repeat(64);
      expect(validator.parse(maxCode) as string).toBe(maxCode);
    });

    it("should accept codes with various characters", () => {
      expect(validator.parse("MySecret123!") as string).toBe("MySecret123!");
      expect(validator.parse("p@ssw0rd_2024") as string).toBe("p@ssw0rd_2024");
      expect(validator.parse("UPPER-lower-123") as string).toBe(
        "UPPER-lower-123"
      );
      expect(validator.parse("with spaces here") as string).toBe(
        "with spaces here"
      );
    });

    it("should accept codes with special characters", () => {
      expect(validator.parse("!@#$%^&*()") as string).toBe("!@#$%^&*()");
      expect(validator.parse("{}[]|\\:;\"'<>,.?/") as string).toBe(
        "{}[]|\\:;\"'<>,.?/"
      );
      expect(validator.parse("emoji🔑code") as string).toBe("emoji🔑code");
    });
  });

  describe("invalid secret codes", () => {
    it("should reject codes shorter than 8 characters", () => {
      expect(() => validator.parse("1234567") as string).toThrow(
        "Secret code must be at least 8 characters long"
      );
      expect(() => validator.parse("short") as string).toThrow(
        "Secret code must be at least 8 characters long"
      );
      expect(() => validator.parse("") as string).toThrow(
        "Secret code must be at least 8 characters long"
      );
    });

    it("should reject codes longer than 64 characters", () => {
      const tooLong = "a".repeat(65);
      expect(() => validator.parse(tooLong) as string).toThrow(
        "Secret code must not exceed 64 characters"
      );
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(12345678) as string).toThrow();
      expect(() => validator.parse(null) as string).toThrow();
      expect(() => validator.parse(undefined) as string).toThrow();
      expect(() => validator.parse({}) as string).toThrow();
    });
  });

  describe("edge cases", () => {
    it("should accept exactly 8 characters", () => {
      expect(validator.parse("exactly8") as string).toBe("exactly8");
    });

    it("should accept exactly 64 characters", () => {
      const exact64 = "x".repeat(64);
      expect(validator.parse(exact64) as string).toBe(exact64);
    });

    it("should handle whitespace", () => {
      expect(validator.parse("        ") as string).toBe("        "); // 8 spaces
      expect(validator.parse("  code  ") as string).toBe("  code  "); // with padding
      expect(validator.parse("\t\n\r test") as string).toBe("\t\n\r test"); // special whitespace
    });
  });
  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse("MySecret123!");
      // Test that the type is correctly inferred
      const _typeCheck: SecretCode = result;
      expect(result).toBe("MySecret123!");
    });

    it("should handle safeParse", () => {
      const result = validator.safeParse("p@ssw0rd_2024");
      expect(result.success).toBe(true);
      if (result.success) {
        const _typeCheck: SecretCode = result.data;
        expect(result.data).toBe("p@ssw0rd_2024");
      }
    });
  });
});
