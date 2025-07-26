import { describe, expect, it } from "vitest";
import { airdropType, airdropTypes } from "./airdrop-types";

describe("airdropType", () => {
  const validator = airdropType();

  describe("valid airdrop types", () => {
    it.each(airdropTypes.map((t) => [t]))("should accept '%s'", (type) => {
      expect(validator.parse(type)).toBe(type);
    });
  });

  describe("invalid airdrop types", () => {
    it("should reject invalid strings", () => {
      expect(() => validator.parse("invalid")).toThrow();
      expect(() => validator.parse("random")).toThrow();
      expect(() => validator.parse("")).toThrow();
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    it("should be case-sensitive", () => {
      expect(() => validator.parse("Whitelist")).toThrow();
      expect(() => validator.parse("MERKLE")).toThrow();
      expect(() => validator.parse("Claim")).toThrow();
    });
  });

  describe("safeParse", () => {
    it("should return success for valid type", () => {
      const result = validator.safeParse("whitelist");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("whitelist");
      }
    });

    it("should return error for invalid type", () => {
      const result = validator.safeParse("invalid");
      expect(result.success).toBe(false);
    });
  });

  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse("whitelist");
      // Test that the type is correctly inferred
      expect(result).toBe("whitelist");
    });

    it("should handle safeParse", () => {
      const result = validator.safeParse("merkle");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("merkle");
      }
    });
  });
});
