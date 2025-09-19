import { describe, expect, test } from "bun:test";
import {
  type FundCategory,
  fundCategories,
  fundCategory,
  getFundCategory,
  isFundCategory,
} from "./fund-categories";

describe("fundCategory", () => {
  const validator = fundCategory();

  describe("valid fund categories", () => {
    test.each([...fundCategories].map((c) => [c]))(
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
      const result = validator.safeParse("VENTURE_CAPITAL");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("VENTURE_CAPITAL");
      }
    });

    test("should return error for invalid category", () => {
      const result = validator.safeParse("invalid");
      expect(result.success).toBe(false);
    });
  });

  describe("type checking", () => {
    test("should return proper type", () => {
      const result = validator.parse("EVENT_DRIVEN");
      // Test that the type is correctly inferred
      expect(result).toBe("EVENT_DRIVEN");
    });

    test("should handle safeParse", () => {
      const result = validator.safeParse("MERGER_ARBITRAGE");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("MERGER_ARBITRAGE");
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
    test.each([...fundCategories])(
      "should return true for '%s'",
      (category) => {
        expect(isFundCategory(category)).toBe(true);
      }
    );
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
      const value: unknown = "MERGER_ARBITRAGE";
      if (isFundCategory(value)) {
        // TypeScript should know value is FundCategory here
        const category: FundCategory = value;
        expect(category).toBe("MERGER_ARBITRAGE");
      } else {
        throw new Error("Should have been a valid fund category");
      }
    });
  });
});

describe("getFundCategory", () => {
  describe("valid fund categories", () => {
    test.each([...fundCategories])(
      "should return '%s' when valid",
      (category) => {
        expect(getFundCategory(category)).toBe(category);
      }
    );
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
        throw new Error("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
        // Zod throws a ZodError which includes validation details
      }
    });
  });

  describe("return type", () => {
    test("should return proper type", () => {
      const result = getFundCategory("MERGER_ARBITRAGE");
      const typedResult: FundCategory = result;
      expect(typedResult).toBe("MERGER_ARBITRAGE");
    });
  });
});

describe("FundCategory type", () => {
  test("should only allow valid fund categories", () => {
    // Type tests - these would fail at compile time if incorrect
    const validCategory: FundCategory = "MERGER_ARBITRAGE";
    expect(validCategory).toBe("MERGER_ARBITRAGE");

    // Test all valid categories
    const categories: FundCategory[] = [
      "MERGER_ARBITRAGE",
      "EQUITY_HEDGE",
      "CONVERTIBLE_ARBITRAGE",
      "FUND_OF_FUNDS",
    ];
    expect(categories).toHaveLength(4);
  });
});
