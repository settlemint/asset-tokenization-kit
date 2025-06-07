import { describe, expect, it } from "bun:test";
import {
  fundClass,
  fundClasses,
  getFundClass,
  isFundClass,
  type FundClass,
} from "./fund-classes";

describe("fundClass", () => {
  const validator = fundClass();

  describe("valid fund classes", () => {
    it.each(fundClasses.map((c) => [c]))("should accept '%s'", (cls) => {
      expect(validator.parse(cls)).toBe(getFundClass(cls));
      expect(isFundClass(cls)).toBe(true);
      expect(getFundClass(cls)).toBe(getFundClass(cls));
    });
  });

  describe("invalid fund classes", () => {
    it("should reject invalid classes", () => {
      expect(() => validator.parse("invalid-class")).toThrow();
      expect(() => validator.parse("")).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
    });
  });

  describe("safeParse", () => {
    it("should return success for valid class", () => {
      const result = validator.safeParse("retail");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(getFundClass("retail"));
      }
    });

    it("should return error for invalid class", () => {
      const result = validator.safeParse("invalid");
      expect(result.success).toBe(false);
    });
  });

  describe("helper functions", () => {
    it("isFundClass should work as type guard", () => {
      const value: unknown = "accredited";
      if (isFundClass(value)) {
        // TypeScript should recognize value as FundClass here
        const _typeCheck: FundClass = value;
      }
    });

    it("getFundClass should return typed value", () => {
      const result = getFundClass("institutional");
      // TypeScript should recognize result as FundClass
      const _typeCheck: FundClass = result;
      expect(result).toBe(getFundClass("institutional"));
    });

    it("getFundClass should throw error for invalid fund class", () => {
      expect(() => getFundClass("invalid")).toThrow("Invalid fund class: invalid");
      expect(() => getFundClass(null)).toThrow("Invalid fund class: null");
      expect(() => getFundClass(undefined)).toThrow("Invalid fund class: undefined");
      expect(() => getFundClass(123)).toThrow("Invalid fund class: 123");
      expect(() => getFundClass({})).toThrow("Invalid fund class: [object Object]");
    });
  });
});
