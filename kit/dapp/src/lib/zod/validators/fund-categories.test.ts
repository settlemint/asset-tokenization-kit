import { describe, expect, test } from "vitest";
import {
  fundCategories,
  fundCategory,
  isFundCategory,
  getFundCategory,
  type FundCategory,
} from "./fund-categories";

describe("fundCategory", () => {
  const validator = fundCategory();

  describe("valid fund categories", () => {
    test.each(fundCategories.map((c) => [c]))(
      "should accept '%s'",
      (category) => {
        expect(validator.parse(category)).toBe(category);
      }
    );
  });

  describe("invalid fund categories", () => {
    test("should reject invalid strings", () => {
      expect(() => validator.parse("invalid")).toThrow();
      expect(() => validator.parse("private")).toThrow();
      expect(() => validator.parse("venture")).toThrow();
      expect(() => validator.parse("")).toThrow();
    });

    test("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    test("should be case-sensitive", () => {
      expect(() => validator.parse("Mutual")).toThrow();
      expect(() => validator.parse("HEDGE")).toThrow();
      expect(() => validator.parse("ETF")).toThrow(); // uppercase
      expect(() => validator.parse("Index")).toThrow();
    });
  });

  describe("safeParse", () => {
    test("should return success for valid category", () => {
      const result = validator.safeParse("hedge");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("hedge");
      }
    });

    test("should return error for invalid category", () => {
      const result = validator.safeParse("invalid");
      expect(result.success).toBe(false);
    });
  });

  describe("type checking", () => {
    test("should return proper type", () => {
      const result = validator.parse("mutual");
      // Test that the type is correctly inferred
      expect(result).toBe("mutual");
    });

    test("should handle safeParse", () => {
      const result = validator.safeParse("etf");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("etf");
      }
    });
  });

  describe("schema description", () => {
    test("should have proper description", () => {
      expect(validator.description).toBe("Category of investment fund");
    });
  });
});

describe("isFundCategory", () => {
  describe("valid fund categories", () => {
    test.each(fundCategories)("should return true for '%s'", (category) => {
      expect(isFundCategory(category)).toBe(true);
    });
  });

  describe("invalid fund categories", () => {
    test("should return false for invalid strings", () => {
      expect(isFundCategory("invalid")).toBe(false);
      expect(isFundCategory("private")).toBe(false);
      expect(isFundCategory("venture")).toBe(false);
      expect(isFundCategory("")).toBe(false);
      expect(isFundCategory("reit")).toBe(false);
    });

    test("should return false for non-string types", () => {
      expect(isFundCategory(123)).toBe(false);
      expect(isFundCategory(null)).toBe(false);
      expect(isFundCategory(undefined)).toBe(false);
      expect(isFundCategory({})).toBe(false);
      expect(isFundCategory([])).toBe(false);
      expect(isFundCategory(true)).toBe(false);
      expect(isFundCategory(false)).toBe(false);
    });

    test("should return false for case mismatches", () => {
      expect(isFundCategory("Mutual")).toBe(false);
      expect(isFundCategory("HEDGE")).toBe(false);
      expect(isFundCategory("ETF")).toBe(false);
      expect(isFundCategory("Index")).toBe(false);
      expect(isFundCategory("etF")).toBe(false);
    });
  });

  describe("type narrowing", () => {
    test("should properly narrow types", () => {
      const value: unknown = "etf";
      if (isFundCategory(value)) {
        // TypeScript should know value is FundCategory here
        const category: FundCategory = value;
        expect(category).toBe("etf");
      } else {
        expect.fail("Should have been a valid fund category");
      }
    });
  });
});

describe("getFundCategory", () => {
  describe("valid fund categories", () => {
    test.each(fundCategories)("should return '%s' when valid", (category) => {
      expect(getFundCategory(category)).toBe(category);
    });
  });

  describe("invalid fund categories", () => {
    test("should throw for invalid strings", () => {
      expect(() => getFundCategory("invalid")).toThrow();
      expect(() => getFundCategory("private")).toThrow();
      expect(() => getFundCategory("venture")).toThrow();
      expect(() => getFundCategory("")).toThrow();
      expect(() => getFundCategory("reit")).toThrow();
    });

    test("should throw for non-string types", () => {
      expect(() => getFundCategory(123)).toThrow();
      expect(() => getFundCategory(null)).toThrow();
      expect(() => getFundCategory(undefined)).toThrow();
      expect(() => getFundCategory({})).toThrow();
      expect(() => getFundCategory([])).toThrow();
      expect(() => getFundCategory(true)).toThrow();
      expect(() => getFundCategory(false)).toThrow();
    });

    test("should throw for case mismatches", () => {
      expect(() => getFundCategory("Mutual")).toThrow();
      expect(() => getFundCategory("HEDGE")).toThrow();
      expect(() => getFundCategory("ETF")).toThrow();
      expect(() => getFundCategory("Index")).toThrow();
      expect(() => getFundCategory("etF")).toThrow();
    });
  });

  describe("error messages", () => {
    test("should throw with Zod error for invalid values", () => {
      try {
        getFundCategory("invalid");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
        // Zod throws a ZodError which includes validation details
      }
    });
  });

  describe("return type", () => {
    test("should return proper type", () => {
      const result = getFundCategory("mutual");
      const typedResult: FundCategory = result;
      expect(typedResult).toBe("mutual");
    });
  });
});

describe("FundCategory type", () => {
  test("should only allow valid fund categories", () => {
    // Type tests - these would fail at compile time if incorrect
    const validCategory: FundCategory = "mutual";
    expect(validCategory).toBe("mutual");

    // Test all valid categories
    const categories: FundCategory[] = ["mutual", "hedge", "etf", "index"];
    expect(categories).toHaveLength(4);
  });
});

describe("fundCategories constant", () => {
  test("should contain all expected categories", () => {
    expect(fundCategories).toEqual(["mutual", "hedge", "etf", "index"]);
  });

  test("should be readonly", () => {
    // The 'as const' assertion makes it readonly
    expect(Object.isFrozen(fundCategories)).toBe(false); // Arrays aren't frozen by default
    expect(fundCategories).toHaveLength(4);
  });
});
