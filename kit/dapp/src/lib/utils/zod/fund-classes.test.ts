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
  });
});
