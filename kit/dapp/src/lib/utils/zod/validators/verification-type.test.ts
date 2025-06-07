import { describe, expect, it } from "bun:test";
import {
  getVerificationType,
  isVerificationType,
  verificationType,
  verificationTypes,
  type VerificationType,
} from "./verification-type";

describe("verificationType", () => {
  const validator = verificationType();

  describe("valid verification types", () => {
    it.each(verificationTypes.map((type) => [type]))(
      "should accept '%s'",
      (type) => {
        expect(validator.parse(type) as string).toBe(type);
      }
    );

    it("should accept all defined verification types", () => {
      expect(validator.parse("email") as string).toBe("email");
      expect(validator.parse("phone") as string).toBe("phone");
      expect(validator.parse("identity") as string).toBe("identity");
    });
  });

  describe("invalid verification types", () => {
    it("should reject invalid type names", () => {
      expect(() => validator.parse("sms")).toThrow();
      expect(() => validator.parse("otp")).toThrow();
      expect(() => validator.parse("biometric")).toThrow();
      expect(() => validator.parse("")).toThrow();
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
      expect(() => validator.parse([])).toThrow();
    });

    it("should be case-sensitive", () => {
      expect(() => validator.parse("Email")).toThrow();
      expect(() => validator.parse("PHONE")).toThrow();
      expect(() => validator.parse("Identity")).toThrow();
    });

    it("should reject similar but incorrect values", () => {
      expect(() => validator.parse("e-mail")).toThrow();
      expect(() => validator.parse("telephone")).toThrow();
      expect(() => validator.parse("id")).toThrow();
      expect(() => validator.parse("identification")).toThrow();
    });
  });

  describe("verification type contexts", () => {
    it("should support different verification methods", () => {
      // Email verification for account confirmation
      expect(validator.parse("email") as string).toBe("email");

      // Phone verification for 2FA or SMS codes
      expect(validator.parse("phone") as string).toBe("phone");

      // Identity verification for KYC/AML
      expect(validator.parse("identity") as string).toBe("identity");
    });
  });
});

describe("helper functions", () => {
  describe("isVerificationType", () => {
    it("should return true for valid verification types", () => {
      expect(isVerificationType("email")).toBe(true);
      expect(isVerificationType("phone")).toBe(true);
      expect(isVerificationType("identity")).toBe(true);
    });

    it("should return false for invalid verification types", () => {
      expect(isVerificationType("sms")).toBe(false);
      expect(isVerificationType("otp")).toBe(false);
      expect(isVerificationType("biometric")).toBe(false);
      expect(isVerificationType("")).toBe(false);
      expect(isVerificationType(123)).toBe(false);
      expect(isVerificationType(null)).toBe(false);
      expect(isVerificationType(undefined)).toBe(false);
      expect(isVerificationType({})).toBe(false);
      expect(isVerificationType([])).toBe(false);
      expect(isVerificationType("Email")).toBe(false); // wrong case
      expect(isVerificationType("PHONE")).toBe(false);
      expect(isVerificationType("e-mail")).toBe(false); // hyphenated
      expect(isVerificationType("telephone")).toBe(false); // synonym
      expect(isVerificationType("id")).toBe(false); // abbreviation
    });

    it("should narrow types correctly", () => {
      const value: unknown = "email";
      if (isVerificationType(value)) {
        // Type should be narrowed to VerificationType
        const type: VerificationType = value;
        expect(type as string).toBe("email");
      }
    });
  });

  describe("getVerificationType", () => {
    it("should return valid verification types", () => {
      expect(getVerificationType("email") as string).toBe("email");
      expect(getVerificationType("phone") as string).toBe("phone");
      expect(getVerificationType("identity") as string).toBe("identity");
    });

    it("should throw for invalid verification types", () => {
      expect(() => getVerificationType("sms")).toThrow();
      expect(() => getVerificationType("otp")).toThrow();
      expect(() => getVerificationType("biometric")).toThrow();
      expect(() => getVerificationType("")).toThrow();
      expect(() => getVerificationType(123)).toThrow("Expected 'email' | 'phone' | 'identity', received number");
      expect(() => getVerificationType(null)).toThrow("Expected 'email' | 'phone' | 'identity', received null");
      expect(() => getVerificationType(undefined)).toThrow("Required");
      expect(() => getVerificationType({})).toThrow("Expected 'email' | 'phone' | 'identity', received object");
      expect(() => getVerificationType("Email")).toThrow();
      expect(() => getVerificationType("e-mail")).toThrow();
    });
  });
});
