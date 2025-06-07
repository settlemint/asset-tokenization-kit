import { describe, expect, it } from "bun:test";
import {
  equityCategories,
  equityCategory,
  getEquityCategory,
  isEquityCategory,
} from "./equity-categories";

describe("equityCategory", () => {
  const validator = equityCategory();

  describe("valid equity categories", () => {
    it.each(equityCategories.map((c) => [c]))(
      "should accept '%s'",
      (category) => {
        expect(validator.parse(category)).toBe(getEquityCategory(category));
        expect(isEquityCategory(category)).toBe(true);
        expect(getEquityCategory(category)).toBe(getEquityCategory(category));
      }
    );
  });

  describe("invalid equity categories", () => {
    it("should reject invalid strings", () => {
      expect(() => validator.parse("invalid")).toThrow();
      expect(() => validator.parse("ordinary")).toThrow();
      expect(() => validator.parse("")).toThrow();

      expect(isEquityCategory("invalid")).toBe(false);
      expect(isEquityCategory("ordinary")).toBe(false);
      expect(isEquityCategory("")).toBe(false);

      expect(() => getEquityCategory("invalid")).toThrow();
      expect(() => getEquityCategory("ordinary")).toThrow();
      expect(() => getEquityCategory("")).toThrow();
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();

      expect(isEquityCategory(123)).toBe(false);
      expect(isEquityCategory(null)).toBe(false);
      expect(isEquityCategory(undefined)).toBe(false);
      expect(isEquityCategory({})).toBe(false);

      expect(() => getEquityCategory(123)).toThrow("Expected 'common' | 'preferred' | 'restricted', received number");
      expect(() => getEquityCategory(null)).toThrow("Expected 'common' | 'preferred' | 'restricted', received null");
      expect(() => getEquityCategory(undefined)).toThrow("Required");
      expect(() => getEquityCategory({})).toThrow("Expected 'common' | 'preferred' | 'restricted', received object");
    });

    it("should be case-sensitive", () => {
      expect(() => validator.parse("Common")).toThrow();
      expect(() => validator.parse("PREFERRED")).toThrow();
      expect(() => validator.parse("Restricted")).toThrow();

      expect(isEquityCategory("Common")).toBe(false);
      expect(isEquityCategory("PREFERRED")).toBe(false);
      expect(isEquityCategory("Restricted")).toBe(false);

      expect(() => getEquityCategory("Common")).toThrow();
      expect(() => getEquityCategory("PREFERRED")).toThrow();
      expect(() => getEquityCategory("Restricted")).toThrow();
    });

    it("should reject similar but incorrect values", () => {
      expect(() => validator.parse("commons")).toThrow();
      expect(() => validator.parse("prefer")).toThrow();
      expect(() => validator.parse("restrict")).toThrow();

      expect(isEquityCategory("commons")).toBe(false);
      expect(isEquityCategory("prefer")).toBe(false);
      expect(isEquityCategory("restrict")).toBe(false);

      expect(() => getEquityCategory("commons")).toThrow();
      expect(() => getEquityCategory("prefer")).toThrow();
      expect(() => getEquityCategory("restrict")).toThrow();
    });
  });

  describe("safeParse", () => {
    it("should return success for valid category", () => {
      const result = validator.safeParse("common");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(getEquityCategory("common"));
      }
    });

    it("should return error for invalid category", () => {
      const result = validator.safeParse("invalid");
      expect(result.success).toBe(false);
    });
  });

  describe("helper functions", () => {
    it("isEquityCategory should work as type guard", () => {
      const value: unknown = "preferred";
      if (isEquityCategory(value)) {
        // TypeScript should recognize value as EquityCategory here
        const _typeCheck: "common" | "preferred" | "restricted" = value;
      }
    });

    it("getEquityCategory should return typed value", () => {
      const result = getEquityCategory("restricted");
      // TypeScript should recognize result as EquityCategory
      const _typeCheck: "common" | "preferred" | "restricted" = result;
      expect(result).toBe(getEquityCategory("restricted"));
    });
  });
});
