import { describe, expect, test } from "bun:test";
import { z } from "zod";
import {
  type EquityCategory,
  equityCategories,
  equityCategory,
  getEquityCategory,
  isEquityCategory,
} from "../../src/validators/equity-categories";

describe("equityCategory", () => {
  const validator = equityCategory();

  describe("valid equity categories", () => {
    test.each(equityCategories.map((c) => [c]))("should accept '%s'", (category) => {
      expect(validator.parse(category)).toBe(category);
    });
  });

  describe("invalid equity categories", () => {
    test("should reject invalid strings", () => {
      expect(() => validator.parse("invalid")).toThrow();
      expect(() => validator.parse("ordinary")).toThrow();
      expect(() => validator.parse("")).toThrow();
    });

    test("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    test("should be case-sensitive", () => {
      expect(() => validator.parse("Common")).toThrow();
      expect(() => validator.parse("PREFERRED")).toThrow();
      expect(() => validator.parse("Restricted")).toThrow();
    });

    test("should reject similar but incorrect values", () => {
      expect(() => validator.parse("commons")).toThrow();
      expect(() => validator.parse("prefer")).toThrow();
      expect(() => validator.parse("restrict")).toThrow();
    });
  });

  describe("safeParse", () => {
    test("should return success for valid category", () => {
      const result = validator.safeParse("common");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("common");
      }
    });

    test("should return error for invalid category", () => {
      const result = validator.safeParse("invalid");
      expect(result.success).toBe(false);
    });
  });

  describe("type checking", () => {
    test("should return proper type", () => {
      const result = validator.parse("preferred");
      // Test that the type is correctly inferred
      expect(result).toBe("preferred");
    });

    test("should handle safeParse", () => {
      const result = validator.safeParse("restricted");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("restricted");
      }
    });
  });

  describe("schema properties", () => {
    test("should have proper description", () => {
      expect(validator.description).toBe("Category of equity");
    });

    test("should be a ZodEnum schema", () => {
      expect(validator).toBeInstanceOf(z.ZodEnum);
    });
  });
});

describe("isEquityCategory", () => {
  describe("valid categories", () => {
    test.each(equityCategories)("should return true for '%s'", (category) => {
      expect(isEquityCategory(category)).toBe(true);
    });
  });

  describe("invalid categories", () => {
    test("should return false for invalid strings", () => {
      expect(isEquityCategory("invalid")).toBe(false);
      expect(isEquityCategory("bonds")).toBe(false);
      expect(isEquityCategory("")).toBe(false);
      expect(isEquityCategory("convertible")).toBe(false);
    });

    test("should return false for non-string types", () => {
      expect(isEquityCategory(123)).toBe(false);
      expect(isEquityCategory(null)).toBe(false);
      expect(isEquityCategory(undefined)).toBe(false);
      expect(isEquityCategory({})).toBe(false);
      expect(isEquityCategory([])).toBe(false);
      expect(isEquityCategory(true)).toBe(false);
      expect(isEquityCategory(false)).toBe(false);
    });

    test("should return false for case variations", () => {
      expect(isEquityCategory("Common")).toBe(false);
      expect(isEquityCategory("PREFERRED")).toBe(false);
      expect(isEquityCategory("Restricted")).toBe(false);
      expect(isEquityCategory("COMMON")).toBe(false);
    });
  });

  describe("type guard behavior", () => {
    test("should narrow type correctly in conditional", () => {
      const unknownValue: unknown = "preferred";
      if (isEquityCategory(unknownValue)) {
        // TypeScript should know this is EquityCategory
        const category: EquityCategory = unknownValue;
        expect(category).toBe("preferred");
      }
    });

    test("should work with filter operations", () => {
      const values: unknown[] = ["common", "invalid", "preferred", 123, null];
      const validCategories = values.filter((v) => isEquityCategory(v));
      expect(validCategories).toEqual(["common", "preferred"]);
    });
  });
});

describe("getEquityCategory", () => {
  describe("valid categories", () => {
    test.each(equityCategories)("should return '%s' when parsing '%s'", (category) => {
      expect(getEquityCategory(category)).toBe(category);
    });
  });

  describe("invalid categories", () => {
    test("should throw ZodError for invalid strings", () => {
      expect(() => getEquityCategory("invalid")).toThrow(z.ZodError);
      expect(() => getEquityCategory("options")).toThrow(z.ZodError);
      expect(() => getEquityCategory("")).toThrow(z.ZodError);
    });

    test("should throw ZodError for non-string types", () => {
      expect(() => getEquityCategory(123)).toThrow(z.ZodError);
      expect(() => getEquityCategory(null)).toThrow(z.ZodError);
      expect(() => getEquityCategory(undefined)).toThrow(z.ZodError);
      expect(() => getEquityCategory({})).toThrow(z.ZodError);
      expect(() => getEquityCategory([])).toThrow(z.ZodError);
    });

    test("should throw ZodError for case variations", () => {
      expect(() => getEquityCategory("Common")).toThrow(z.ZodError);
      expect(() => getEquityCategory("PREFERRED")).toThrow(z.ZodError);
      expect(() => getEquityCategory("restricted ")).toThrow(z.ZodError);
    });

    test("should include helpful error message", () => {
      expect(() => getEquityCategory("invalid")).toThrow(z.ZodError);

      try {
        getEquityCategory("invalid");
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues).toBeDefined();
          expect(error.issues.length).toBeGreaterThan(0);
          const firstIssue = error.issues[0];
          expect(firstIssue).toBeDefined();
          // Zod enum errors typically have a message about invalid enum value
          expect(firstIssue?.message).toBeDefined();
          expect(firstIssue?.code).toBe("invalid_value");
        }
      }
    });
  });

  describe("return type", () => {
    test("should return correctly typed value", () => {
      const result: EquityCategory = getEquityCategory("common");
      expect(result).toBe("common");
    });
  });
});

describe("EquityCategory type", () => {
  test("should be assignable from valid categories", () => {
    const common: EquityCategory = "common";
    const preferred: EquityCategory = "preferred";
    const restricted: EquityCategory = "restricted";

    expect(common).toBe("common");
    expect(preferred).toBe("preferred");
    expect(restricted).toBe("restricted");
  });

  test("should match the union of equity categories", () => {
    type ExpectedType = "common" | "preferred" | "restricted";
    type ActualType = EquityCategory;

    // This will cause a compile error if types don't match
    const typeTest: ExpectedType extends ActualType ? (ActualType extends ExpectedType ? true : false) : false = true;
    expect(typeTest).toBe(true);
  });
});

describe("equityCategories constant", () => {
  test("should contain exactly three categories", () => {
    expect(equityCategories).toHaveLength(3);
  });

  test("should contain common, preferred, and restricted", () => {
    expect(equityCategories).toContain("common");
    expect(equityCategories).toContain("preferred");
    expect(equityCategories).toContain("restricted");
  });

  test("should be a const array", () => {
    // TypeScript's 'as const' makes it readonly at compile time
    // Runtime check: ensure it's an array with expected values
    expect(Array.isArray(equityCategories)).toBe(true);
    expect(equityCategories).toEqual(["common", "preferred", "restricted"]);
  });
});
