import { describe, expect, it } from "vitest";
import { equityCategories, equityCategory } from "./equity-categories";

describe("equityCategory", () => {
  const validator = equityCategory();

  describe("valid equity categories", () => {
    it.each(equityCategories.map((c) => [c]))(
      "should accept '%s'",
      (category) => {
        expect(validator.parse(category)).toBe(category);
      }
    );
  });

  describe("invalid equity categories", () => {
    it("should reject invalid strings", () => {
      expect(() => validator.parse("invalid")).toThrow();
      expect(() => validator.parse("ordinary")).toThrow();
      expect(() => validator.parse("")).toThrow();
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    it("should be case-sensitive", () => {
      expect(() => validator.parse("Common")).toThrow();
      expect(() => validator.parse("PREFERRED")).toThrow();
      expect(() => validator.parse("Restricted")).toThrow();
    });

    it("should reject similar but incorrect values", () => {
      expect(() => validator.parse("commons")).toThrow();
      expect(() => validator.parse("prefer")).toThrow();
      expect(() => validator.parse("restrict")).toThrow();
    });
  });

  describe("safeParse", () => {
    it("should return success for valid category", () => {
      const result = validator.safeParse("common");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("common");
      }
    });

    it("should return error for invalid category", () => {
      const result = validator.safeParse("invalid");
      expect(result.success).toBe(false);
    });
  });

  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse("preferred");
      // Test that the type is correctly inferred
      expect(result).toBe("preferred");
    });

    it("should handle safeParse", () => {
      const result = validator.safeParse("restricted");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("restricted");
      }
    });
  });
});
