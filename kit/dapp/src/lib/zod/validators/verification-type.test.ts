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
      expect(validator.parse("two-factor")).toBe("two-factor");
      expect(validator.parse("pincode")).toBe("pincode");
      expect(validator.parse("secret-code")).toBe("secret-code");
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
      expect(validator.parse("two-factor")).toBe("two-factor");

      // Phone verification for 2FA or SMS codes
      expect(validator.parse("pincode")).toBe("pincode");

      // Identity verification for KYC/AML
      expect(validator.parse("secret-code")).toBe("secret-code");
    });
  });

  describe("safeParse", () => {
    it("should return success for valid verification type", () => {
      const result = validator.safeParse("two-factor");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("two-factor");
      }
    });

    it("should return error for invalid verification type", () => {
      const result = validator.safeParse("invalid");
      expect(result.success).toBe(false);
    });
  });

  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse("two-factor");
      // Test that the type is correctly inferred
      expect(result).toBe("two-factor");
    });

    it("should handle safeParse", () => {
      const result = validator.safeParse("pincode");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("pincode");
      }
    });
  });
});

describe("isVerificationType", () => {
  it("should return true for valid verification types", () => {
    expect(isVerificationType("two-factor")).toBe(true);
    expect(isVerificationType("pincode")).toBe(true);
    expect(isVerificationType("secret-code")).toBe(true);
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
    expect(isVerificationType("PINCODE")).toBe(false);
  });

  it("should work as a type guard", () => {
    const value: unknown = "two-factor";
    if (isVerificationType(value)) {
      // TypeScript should recognize value as VerificationType here
      const validType: "two-factor" | "pincode" | "secret-code" = value;
      expect(validType).toBe("two-factor");
    }
  });
});

describe("getVerificationType", () => {
  it("should return valid verification types", () => {
    expect(getVerificationType("two-factor")).toBe("two-factor");
    expect(getVerificationType("pincode")).toBe("pincode");
    expect(getVerificationType("secret-code")).toBe("secret-code");
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
    expect(() => getVerificationType("Two-Factor")).toThrow();
    expect(() => getVerificationType("PINCODE")).toThrow();
    expect(() => getVerificationType("Secret-Code")).toThrow();
  });

  it("should be useful in functions requiring VerificationType", () => {
    const setupVerification = (method: unknown) => {
      const validatedMethod = getVerificationType(method);
      const messages = {
        "two-factor": "Two-factor authentication enabled",
        pincode: "PIN code verification enabled",
        "secret-code": "Secret code verification enabled",
      };
      return messages[validatedMethod];
    };

    expect(setupVerification("two-factor")).toBe(
      "Two-factor authentication enabled"
    );
    expect(setupVerification("pincode")).toBe("PIN code verification enabled");
    expect(() => setupVerification("invalid")).toThrow();
  });
});
