import { describe, expect, it } from "vitest";
import {
  verificationType,
  verificationTypes,
  isVerificationType,
  getVerificationType,
} from "./verification-type";

describe("verificationType", () => {
  const validator = verificationType;

  describe("valid verification types", () => {
    it.each(verificationTypes.map((type) => [type]))(
      "should accept '%s'",
      (type) => {
        expect(validator.parse(type)).toBe(type);
      }
    );

    it("should accept all defined verification types", () => {
      expect(validator.parse("OTP")).toBe("OTP");
      expect(validator.parse("PINCODE")).toBe("PINCODE");
      expect(validator.parse("SECRET_CODES")).toBe("SECRET_CODES");
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
      // OTP verification for account confirmation
      expect(validator.parse("OTP")).toBe("OTP");

      // Pincode verification for numeric codes
      expect(validator.parse("PINCODE")).toBe("PINCODE");

      // Secret codes verification for recovery
      expect(validator.parse("SECRET_CODES")).toBe("SECRET_CODES");
    });
  });

  describe("safeParse", () => {
    it("should return success for valid verification type", () => {
      const result = validator.safeParse("OTP");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("OTP");
      }
    });

    it("should return error for invalid verification type", () => {
      const result = validator.safeParse("invalid");
      expect(result.success).toBe(false);
    });
  });

  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse("OTP");
      // Test that the type is correctly inferred
      expect(result).toBe("OTP");
    });

    it("should handle safeParse", () => {
      const result = validator.safeParse("PINCODE");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("PINCODE");
      }
    });
  });
});

describe("isVerificationType", () => {
  it("should return true for valid verification types", () => {
    expect(isVerificationType("OTP")).toBe(true);
    expect(isVerificationType("PINCODE")).toBe(true);
    expect(isVerificationType("SECRET_CODES")).toBe(true);
  });

  it("should return false for invalid verification types", () => {
    expect(isVerificationType("email")).toBe(false);
    expect(isVerificationType("phone")).toBe(false);
    expect(isVerificationType("identity")).toBe(false);
    expect(isVerificationType("sms")).toBe(false);
    expect(isVerificationType("otp")).toBe(false);
    expect(isVerificationType("biometric")).toBe(false);
    expect(isVerificationType("")).toBe(false);
    expect(isVerificationType(null)).toBe(false);
    expect(isVerificationType(undefined)).toBe(false);
    expect(isVerificationType(123)).toBe(false);
    expect(isVerificationType({})).toBe(false);
    expect(isVerificationType([])).toBe(false);
    expect(isVerificationType("Two-Factor")).toBe(false);
    expect(isVerificationType("pincode")).toBe(false);
  });

  it("should work as a type guard", () => {
    const value: unknown = "OTP";
    if (isVerificationType(value)) {
      // TypeScript should recognize value as VerificationType here
      const validType: "OTP" | "PINCODE" | "SECRET_CODES" = value;
      expect(validType).toBe("OTP");
    }
  });
});

describe("getVerificationType", () => {
  it("should return valid verification types", () => {
    expect(getVerificationType("OTP")).toBe("OTP");
    expect(getVerificationType("PINCODE")).toBe("PINCODE");
    expect(getVerificationType("SECRET_CODES")).toBe("SECRET_CODES");
  });

  it("should throw for invalid verification types", () => {
    expect(() => getVerificationType("email")).toThrow();
    expect(() => getVerificationType("phone")).toThrow();
    expect(() => getVerificationType("identity")).toThrow();
    expect(() => getVerificationType("sms")).toThrow();
    expect(() => getVerificationType("otp")).toThrow();
    expect(() => getVerificationType("biometric")).toThrow();
    expect(() => getVerificationType("")).toThrow();
    expect(() => getVerificationType(null)).toThrow();
    expect(() => getVerificationType(undefined)).toThrow();
    expect(() => getVerificationType(123)).toThrow();
    expect(() => getVerificationType({})).toThrow();
    expect(() => getVerificationType([])).toThrow();
  });

  it("should throw for case variations", () => {
    expect(() => getVerificationType("otp")).toThrow();
    expect(() => getVerificationType("pincode")).toThrow();
    expect(() => getVerificationType("secret_codes")).toThrow();
  });

  it("should be useful in functions requiring VerificationType", () => {
    const setupVerification = (method: unknown) => {
      const validatedMethod = getVerificationType(method);
      const messages = {
        OTP: "Two-factor authentication enabled",
        PINCODE: "PIN code verification enabled",
        SECRET_CODES: "Secret code verification enabled",
      };
      return messages[validatedMethod];
    };

    expect(setupVerification("OTP")).toBe("Two-factor authentication enabled");
    expect(setupVerification("PINCODE")).toBe("PIN code verification enabled");
    expect(() => setupVerification("invalid")).toThrow();
  });
});
