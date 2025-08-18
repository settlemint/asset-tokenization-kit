import { describe, expect, test } from "bun:test";
import { airdropType, airdropTypes, getAirdropType, isAirdropType } from "../../src/validators/airdrop-types";

describe("airdropType", () => {
  const validator = airdropType();

  describe("valid airdrop types", () => {
    test.each(airdropTypes.map((t) => [t]))("should accept '%s'", (type) => {
      expect(validator.parse(type)).toBe(type);
    });
  });

  describe("invalid airdrop types", () => {
    test("should reject invalid strings", () => {
      expect(() => validator.parse("invalid")).toThrow();
      expect(() => validator.parse("random")).toThrow();
      expect(() => validator.parse("")).toThrow();
    });

    test("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    test("should be case-sensitive", () => {
      expect(() => validator.parse("Whitelist")).toThrow();
      expect(() => validator.parse("MERKLE")).toThrow();
      expect(() => validator.parse("Claim")).toThrow();
    });
  });

  test("should have proper description", () => {
    expect(validator.description).toBe("Type of airdrop mechanism");
  });

  describe("safeParse", () => {
    test("should return success for valid type", () => {
      const result = validator.safeParse("whitelist");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("whitelist");
      }
    });

    test("should return error for invalid type", () => {
      const result = validator.safeParse("invalid");
      expect(result.success).toBe(false);
    });
  });

  describe("type checking", () => {
    test("should return proper type", () => {
      const result = validator.parse("whitelist");
      // Test that the type is correctly inferred
      expect(result).toBe("whitelist");
    });

    test("should handle safeParse", () => {
      const result = validator.safeParse("merkle");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("merkle");
      }
    });
  });
});

// Tests for isAirdropType type guard
describe("isAirdropType", () => {
  test("should return true for valid airdrop types", () => {
    expect(isAirdropType("whitelist")).toBe(true);
    expect(isAirdropType("merkle")).toBe(true);
    expect(isAirdropType("claim")).toBe(true);
  });

  test("should return false for invalid airdrop types", () => {
    expect(isAirdropType("invalid")).toBe(false);
    expect(isAirdropType("random")).toBe(false);
    expect(isAirdropType("")).toBe(false);
  });

  test("should return false for non-string types", () => {
    expect(isAirdropType(123)).toBe(false);
    expect(isAirdropType(null)).toBe(false);
    expect(isAirdropType(undefined)).toBe(false);
    expect(isAirdropType({})).toBe(false);
    expect(isAirdropType([])).toBe(false);
    expect(isAirdropType(true)).toBe(false);
  });

  test("should return false for case variations", () => {
    expect(isAirdropType("Whitelist")).toBe(false);
    expect(isAirdropType("MERKLE")).toBe(false);
    expect(isAirdropType("Claim")).toBe(false);
  });
});

// Tests for getAirdropType
describe("getAirdropType", () => {
  test("should return valid airdrop types", () => {
    expect(getAirdropType("whitelist")).toBe("whitelist");
    expect(getAirdropType("merkle")).toBe("merkle");
    expect(getAirdropType("claim")).toBe("claim");
  });

  test("should throw for invalid airdrop types", () => {
    expect(() => getAirdropType("invalid")).toThrow();
    expect(() => getAirdropType("random")).toThrow();
    expect(() => getAirdropType("")).toThrow();
  });

  test("should throw for non-string types", () => {
    expect(() => getAirdropType(123)).toThrow();
    expect(() => getAirdropType(null)).toThrow();
    expect(() => getAirdropType(undefined)).toThrow();
    expect(() => getAirdropType({})).toThrow();
    expect(() => getAirdropType([])).toThrow();
    expect(() => getAirdropType(true)).toThrow();
  });

  test("should throw for case variations", () => {
    expect(() => getAirdropType("Whitelist")).toThrow();
    expect(() => getAirdropType("MERKLE")).toThrow();
    expect(() => getAirdropType("Claim")).toThrow();
  });
});
