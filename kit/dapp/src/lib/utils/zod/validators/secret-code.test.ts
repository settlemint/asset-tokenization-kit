import { describe, expect, it } from "bun:test";
import {
  getSecretCode,
  isSecretCode,
  secretCode,
  type SecretCode,
} from "./secret-code";

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
        "Secret code must be at least 8 characters"
      );
      expect(() => validator.parse("short") as string).toThrow(
        "Secret code must be at least 8 characters"
      );
      expect(() => validator.parse("") as string).toThrow(
        "Secret code must be at least 8 characters"
      );
    });

    it("should reject codes longer than 64 characters", () => {
      const tooLong = "a".repeat(65);
      expect(() => validator.parse(tooLong) as string).toThrow(
        "Secret code must be at most 64 characters"
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
});

describe("helper functions", () => {
  describe("isSecretCode", () => {
    it("should return true for valid secret codes", () => {
      expect(isSecretCode("12345678") as boolean).toBe(true);
      expect(isSecretCode("abcdefgh") as boolean).toBe(true);
      expect(isSecretCode("a".repeat(64)) as boolean).toBe(true);
      expect(isSecretCode("MySecret123!") as boolean).toBe(true);
      expect(isSecretCode("p@ssw0rd_2024") as boolean).toBe(true);
      expect(isSecretCode("UPPER-lower-123") as boolean).toBe(true);
      expect(isSecretCode("with spaces here") as boolean).toBe(true);
      expect(isSecretCode("!@#$%^&*()") as boolean).toBe(true);
      expect(isSecretCode("emoji🔑code") as boolean).toBe(true);
    });

    it("should return false for invalid secret codes", () => {
      expect(isSecretCode("1234567") as boolean).toBe(false); // too short
      expect(isSecretCode("short") as boolean).toBe(false);
      expect(isSecretCode("") as boolean).toBe(false);
      expect(isSecretCode("a".repeat(65)) as boolean).toBe(false); // too long
      expect(isSecretCode(12345678) as boolean).toBe(false); // number
      expect(isSecretCode(null) as boolean).toBe(false);
      expect(isSecretCode(undefined) as boolean).toBe(false);
      expect(isSecretCode({}) as boolean).toBe(false);
    });

    it("should narrow types correctly", () => {
      const value: unknown = "MySecret123!";
      if (isSecretCode(value)) {
        // Type should be narrowed to SecretCode
        const code: SecretCode = value;
        expect(code as string).toBe("MySecret123!");
      }
    });
  });

  describe("getSecretCode", () => {
    it("should return valid secret codes", () => {
      expect(getSecretCode("12345678") as string).toBe("12345678");
      expect(getSecretCode("abcdefgh") as string).toBe("abcdefgh");
      expect(getSecretCode("MySecret123!") as string).toBe("MySecret123!");
      expect(getSecretCode("p@ssw0rd_2024") as string).toBe("p@ssw0rd_2024");
      expect(getSecretCode("        ") as string).toBe("        ");
    });

    it("should throw for invalid secret codes", () => {
      expect(() => getSecretCode("1234567") as string).toThrow(
        "Invalid secret code: 1234567"
      );
      expect(() => getSecretCode("short") as string).toThrow(
        "Invalid secret code: short"
      );
      expect(() => getSecretCode("") as string).toThrow(
        "Invalid secret code: "
      );
      expect(() => getSecretCode("a".repeat(65)) as string).toThrow(
        "Invalid secret code: " + "a".repeat(65)
      );
      expect(() => getSecretCode(12345678) as string).toThrow(
        "Invalid secret code: 12345678"
      );
      expect(() => getSecretCode(null) as string).toThrow(
        "Invalid secret code: null"
      );
      expect(() => getSecretCode(undefined) as string).toThrow(
        "Invalid secret code: undefined"
      );
      expect(() => getSecretCode({}) as string).toThrow(
        "Invalid secret code: [object Object]"
      );
    });
  });
});
