import { describe, expect, it } from "bun:test";
import {
  fundCategories,
  fundCategory,
  getFundCategory,
  isFundCategory,
  type FundCategory,
} from "./fund-categories";

describe("fundCategory", () => {
  const validator = fundCategory();

  describe("valid fund categories", () => {
    it.each(fundCategories.map((c) => [c]))(
      "should accept '%s'",
      (category) => {
        expect(validator.parse(category)).toBe(getFundCategory(category));
        expect(isFundCategory(category)).toBe(true);
        expect(getFundCategory(category)).toBe(getFundCategory(category));
      }
    );
  });

  describe("invalid fund categories", () => {
    it("should reject invalid strings", () => {
      expect(() => validator.parse("invalid")).toThrow();
      expect(() => validator.parse("private")).toThrow();
      expect(() => validator.parse("venture")).toThrow();
      expect(() => validator.parse("")).toThrow();

      expect(isFundCategory("invalid")).toBe(false);
      expect(isFundCategory("private")).toBe(false);
      expect(isFundCategory("venture")).toBe(false);
      expect(isFundCategory("")).toBe(false);

      expect(() => getFundCategory("invalid")).toThrow();
      expect(() => getFundCategory("private")).toThrow();
      expect(() => getFundCategory("venture")).toThrow();
      expect(() => getFundCategory("")).toThrow();
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();

      expect(isFundCategory(123)).toBe(false);
      expect(isFundCategory(null)).toBe(false);
      expect(isFundCategory(undefined)).toBe(false);
      expect(isFundCategory({})).toBe(false);

      expect(() => getFundCategory(123)).toThrow("Expected 'mutual' | 'hedge' | 'etf' | 'index', received number");
      expect(() => getFundCategory(null)).toThrow("Expected 'mutual' | 'hedge' | 'etf' | 'index', received null");
      expect(() => getFundCategory(undefined)).toThrow("Required");
      expect(() => getFundCategory({})).toThrow("Expected 'mutual' | 'hedge' | 'etf' | 'index', received object");
    });

    it("should be case-sensitive", () => {
      expect(() => validator.parse("Mutual")).toThrow();
      expect(() => validator.parse("HEDGE")).toThrow();
      expect(() => validator.parse("ETF")).toThrow(); // uppercase
      expect(() => validator.parse("Index")).toThrow();

      expect(isFundCategory("Mutual")).toBe(false);
      expect(isFundCategory("HEDGE")).toBe(false);
      expect(isFundCategory("ETF")).toBe(false);
      expect(isFundCategory("Index")).toBe(false);

      expect(() => getFundCategory("Mutual")).toThrow();
      expect(() => getFundCategory("HEDGE")).toThrow();
      expect(() => getFundCategory("ETF")).toThrow();
      expect(() => getFundCategory("Index")).toThrow();
    });
  });

  describe("safeParse", () => {
    it("should return success for valid category", () => {
      const result = validator.safeParse("hedge");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(getFundCategory("hedge"));
      }
    });

    it("should return error for invalid category", () => {
      const result = validator.safeParse("invalid");
      expect(result.success).toBe(false);
    });
  });

  describe("helper functions", () => {
    it("isFundCategory should work as type guard", () => {
      const value: unknown = "private-equity";
      if (isFundCategory(value)) {
        // TypeScript should recognize value as FundCategory here
        const _typeCheck: FundCategory = value;
      }
    });

    it("getFundCategory should return typed value", () => {
      const result = getFundCategory("mutual");
      // TypeScript should recognize result as FundCategory
      const _typeCheck: FundCategory = result;
      expect(result).toBe(getFundCategory("mutual"));
    });
  });
});
