import { describe, expect, it } from "bun:test";
import {
  airdropType,
  airdropTypes,
  getAirdropType,
  isAirdropType,
} from "./airdrop-types";

describe("airdropType", () => {
  const validator = airdropType();

  describe("valid airdrop types", () => {
    it.each(airdropTypes.map((t) => [t]))("should accept '%s'", (type) => {
      expect(validator.parse(type)).toBe(getAirdropType(type));
      expect(isAirdropType(type)).toBe(true);
      expect(getAirdropType(type)).toBe(getAirdropType(type));
    });
  });

  describe("invalid airdrop types", () => {
    it("should reject invalid strings", () => {
      expect(() => validator.parse("invalid")).toThrow();
      expect(() => validator.parse("random")).toThrow();
      expect(() => validator.parse("")).toThrow();

      expect(isAirdropType("invalid")).toBe(false);
      expect(isAirdropType("random")).toBe(false);
      expect(isAirdropType("")).toBe(false);

      expect(() => getAirdropType("invalid")).toThrow();
      expect(() => getAirdropType("random")).toThrow();
      expect(() => getAirdropType("")).toThrow();
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();

      expect(isAirdropType(123)).toBe(false);
      expect(isAirdropType(null)).toBe(false);
      expect(isAirdropType(undefined)).toBe(false);
      expect(isAirdropType({})).toBe(false);
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
        expect(result.data).toBe(getAirdropType("whitelist"));
      }
    });

    it("should return error for invalid type", () => {
      const result = validator.safeParse("invalid");
      expect(result.success).toBe(false);
    });
  });

  describe("helper functions", () => {
    it("isAirdropType should work as type guard", () => {
      const value: unknown = "whitelist";
      if (isAirdropType(value)) {
        // TypeScript should recognize value as AirdropType here
        const _typeCheck: "whitelist" | "merkle" | "claim" = value;
      }
    });

    it("getAirdropType should return typed value", () => {
      const result = getAirdropType("merkle");
      // TypeScript should recognize result as AirdropType
      const _typeCheck: "whitelist" | "merkle" | "claim" = result;
      expect(result).toBe(getAirdropType("merkle"));
    });
  });
});
