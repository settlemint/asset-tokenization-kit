import { describe, expect, test } from "bun:test";
import {
  type FundClass,
  fundClass,
  fundClasses,
  getFundClass,
  isFundClass,
} from "./fund-classes";

describe("fundClass", () => {
  const validator = fundClass();

  describe("valid fund classes", () => {
    test.each([...fundClasses].map((c) => [c]))("should accept '%s'", (cls) => {
      expect(validator.parse(cls)).toBe(cls);
    });
  });

  describe("invalid fund classes", () => {
    test("should reject invalid classes", () => {
      expect(() => validator.parse("invalid-class")).toThrow();
      expect(() => validator.parse("")).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
    });
  });

  describe("safeParse", () => {
    test("should return success for valid class", () => {
      const result = validator.safeParse("ABSOLUTE_RETURN");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("ABSOLUTE_RETURN");
      }
    });

    test("should return error for invalid class", () => {
      const result = validator.safeParse("invalid");
      expect(result.success).toBe(false);
    });
  });

  describe("type checking", () => {
    test("should return proper type", () => {
      const result = validator.parse("MARKET_NEUTRAL");
      // Test that the type is correctly inferred
      expect(result).toBe("MARKET_NEUTRAL");
    });

    test("should handle safeParse", () => {
      const result = validator.safeParse("SEED_PRE_SEED");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("SEED_PRE_SEED");
      }
    });
  });

  describe("schema description", () => {
    test("should have a description", () => {
      expect(validator.description).toBe("Class of investment fund");
    });
  });
});

describe("isFundClass", () => {
  describe("valid fund classes", () => {
    test.each([...fundClasses])("should return true for '%s'", (cls) => {
      expect(isFundClass(cls)).toBe(true);
    });
  });

  describe("invalid values", () => {
    test.each([
      ["invalid-class", "string"],
      ["premium", "string"],
      ["", "empty string"],
      [null, "null"],
      [undefined, "undefined"],
      [123, "number"],
      [true, "boolean"],
      [false, "boolean"],
      [{}, "object"],
      [[], "array"],
      [Symbol("test"), "symbol"],
      [() => {}, "function"],
      [new Date(), "Date object"],
      [/regex/, "RegExp"],
      [Number.NaN, "NaN"],
      [Infinity, "Infinity"],
      [-Infinity, "-Infinity"],
      ["INSTITUTIONAL", "uppercase variant"],
      ["Retail", "capitalized variant"],
      ["  retail  ", "string with spaces"],
      ["retail\n", "string with newline"],
    ])(
      "should return false for invalid value %s - %s",
      (value, _description) => {
        expect(isFundClass(value)).toBe(false);
      }
    );
  });

  describe("type narrowing", () => {
    test("should narrow type when true", () => {
      const value: unknown = "SEED_PRE_SEED";
      if (isFundClass(value)) {
        // TypeScript should know value is FundClass here
        const fundClass: FundClass = value;
        expect(fundClass).toBe("SEED_PRE_SEED");
      } else {
        throw new Error("Should have been a valid fund class");
      }
    });

    test("should work with unknown values", () => {
      const values: unknown[] = ["SEED_PRE_SEED", "invalid", null, 123];
      const validClasses = values.filter((v) => isFundClass(v));
      expect(validClasses).toEqual(["SEED_PRE_SEED"]);
    });
  });
});

describe("getFundClass", () => {
  describe("valid fund classes", () => {
    test.each([...fundClasses])("should return '%s' for valid input", (cls) => {
      expect(getFundClass(cls)).toBe(cls);
    });
  });

  describe("invalid values", () => {
    test.each([
      ["invalid-class", "Invalid option"],
      ["premium", "Invalid option"],
      ["", "Invalid option"],
      [null, "Invalid option"],
      [undefined, "Invalid option"],
      [123, "Invalid option"],
      [true, "Invalid option"],
      [false, "Invalid option"],
      [{}, "Invalid option"],
      [[], "Invalid option"],
      [Symbol("test"), "Invalid option"],
      [() => {}, "Invalid option"],
      [new Date(), "Invalid option"],
      [/regex/, "Invalid option"],
      [Number.NaN, "Invalid option"],
      [Infinity, "Invalid option"],
      [-Infinity, "Invalid option"],
      ["INSTITUTIONAL", "Invalid option"],
      ["Retail", "Invalid option"],
      ["  retail  ", "Invalid option"],
      ["retail\n", "Invalid option"],
    ])("should throw for invalid value %s - %s", (value, _expectedError) => {
      expect(() => getFundClass(value)).toThrow();
      try {
        getFundClass(value);
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toContain("Invalid option");
          expect(error.message).toContain("INCOME_FOCUSED");
        }
      }
    });
  });

  describe("error handling", () => {
    test("should throw ZodError with detailed message", () => {
      try {
        getFundClass("vip");
        throw new Error("Should have thrown");
      } catch (error) {
        expect(error).toBeDefined();
        if (error instanceof Error) {
          expect(error.message).toContain("Invalid option");
          expect(error.message).toContain("INCOME_FOCUSED");
        }
      }
    });

    test("should throw for edge case values", () => {
      const edgeCases = [
        Object.create(null),
        { toString: () => "retail" },
        { valueOf: () => "retail" },
      ];

      edgeCases.forEach((value) => {
        expect(() => getFundClass(value)).toThrow();
      });
    });
  });

  describe("usage scenarios", () => {
    test("should work in investor onboarding flow", () => {
      const mockRequest = { investorType: "SEED_PRE_SEED" };
      const investorClass = getFundClass(mockRequest.investorType);
      expect(investorClass).toBe("SEED_PRE_SEED");
    });

    test("should handle try-catch pattern", () => {
      let result: FundClass | null = null;
      let error: Error | null = null;

      try {
        result = getFundClass("SEED_PRE_SEED");
      } catch (error_) {
        error = error_ as Error;
      }

      expect(result).toBe("SEED_PRE_SEED");
      expect(error).toBeNull();

      // Test with invalid input
      result = null;
      error = null;

      try {
        result = getFundClass("vip");
      } catch (error_) {
        error = error_ as Error;
      }

      expect(result).toBeNull();
      expect(error).not.toBeNull();
      expect(error?.message).toContain("Invalid option");
    });
  });
});

describe("FundClass type", () => {
  test("should be assignable from valid fund classes", () => {
    // Test that all valid fund classes are assignable to FundClass
    for (const cls of fundClasses) {
      // Type assertion: should not error
      const value: FundClass = cls;
      expect(value).toBe(cls);
    }
  });

  test("should work with arrays and filters", () => {
    const classes: FundClass[] = [
      "ABSOLUTE_RETURN",
      "CORE_BLEND",
      "DIVERSIFIED",
    ];
    const filtered = classes.filter((c) => c !== "CORE_BLEND");
    expect(filtered).toEqual(["ABSOLUTE_RETURN", "DIVERSIFIED"]);
  });
});
