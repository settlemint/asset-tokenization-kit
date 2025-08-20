import { describe, expect, it } from "bun:test";
import { amount, getAmount, isAmount } from "../../src/amount";

describe("amount", () => {
  describe("basic validation", () => {
    const validator = amount();

    it("should accept positive numbers", () => {
      expect(validator.parse(1)).toBe(1);
      expect(validator.parse(100)).toBe(100);
      expect(validator.parse(999.99)).toBe(999.99);
    });

    it("should accept very small positive numbers", () => {
      expect(validator.parse(0.000_001)).toBe(0.000_001);
      expect(validator.parse(Number.EPSILON)).toBe(Number.EPSILON);
    });

    it("should accept zero by default", () => {
      expect(validator.parse(0)).toBe(0);
    });

    it("should reject negative numbers", () => {
      expect(() => validator.parse(-1)).toThrow("Amount must be at least 0");
      expect(() => validator.parse(-0.01)).toThrow("Amount must be at least 0");
    });

    it("should reject non-numeric string types", () => {
      expect(() => validator.parse("abc")).toThrow();
      expect(() => validator.parse("")).toThrow();
      expect(() => validator.parse("not a number")).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    it("should accept numeric strings", () => {
      expect(validator.parse("100")).toBe(100);
      expect(validator.parse("100.50")).toBe(100.5);
      expect(validator.parse("0")).toBe(0);
      expect(validator.parse("999.99")).toBe(999.99);
    });

    it("should reject NaN", () => {
      expect(() => validator.parse(Number.NaN)).toThrow();
    });

    it("should reject Infinity", () => {
      expect(() => validator.parse(Infinity)).toThrow();
      expect(() => validator.parse(-Infinity)).toThrow();
    });
  });

  describe("with min/max options", () => {
    const validator = amount({ min: 10, max: 1000 });

    it("should accept values within range", () => {
      expect(validator.parse(10)).toBe(10);
      expect(validator.parse(500)).toBe(500);
      expect(validator.parse(1000)).toBe(1000);
    });

    it("should reject values below minimum", () => {
      expect(() => validator.parse(9.99)).toThrow("Amount must be at least 10");
      expect(() => validator.parse(0)).toThrow("Amount must be at least 10");
    });

    it("should reject values above maximum", () => {
      expect(() => validator.parse(1000.01)).toThrow("Amount must not exceed 1000");
      expect(() => validator.parse(10_000)).toThrow("Amount must not exceed 1000");
    });
  });

  describe("with decimals option", () => {
    const validator = amount({ decimals: 2 });

    it("should set minimum based on decimals", () => {
      expect(validator.parse(0.01)).toBe(0.01);
      expect(validator.parse(10.99)).toBe(10.99);
    });

    it("should reject values below decimal-based minimum", () => {
      expect(() => validator.parse(0.009)).toThrow("Amount must be at least 0.01");
      expect(() => validator.parse(0)).toThrow("Amount must be at least 0.01");
    });

    it("should accept any number of decimal places above minimum", () => {
      expect(validator.parse(10.999)).toBe(10.999);
      expect(validator.parse(10.123_45)).toBe(10.123_45);
    });
  });

  describe("type checking", () => {
    it("should return proper type", () => {
      const validator = amount();
      const result = validator.parse(100);
      // Test that the type is correctly inferred
      expect(result).toBe(100);
    });

    it("should handle safeParse", () => {
      const validator = amount();
      const result = validator.safeParse(100);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(100);
      }
    });

    it("should handle safeParse with invalid input", () => {
      const validator = amount({ min: 10 });
      const result = validator.safeParse(5);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Amount must be at least 10");
      }
    });
  });

  describe("isAmount function", () => {
    it("should return true for valid amounts", () => {
      expect(isAmount(100)).toBe(true);
      expect(isAmount("100")).toBe(true);
      expect(isAmount(0)).toBe(true);
      expect(isAmount(0.01)).toBe(true);
      expect(isAmount(Number.MAX_SAFE_INTEGER)).toBe(true);
    });

    it("should return false for invalid amounts", () => {
      expect(isAmount(-1)).toBe(false);
      expect(isAmount("abc")).toBe(false);
      expect(isAmount(null)).toBe(false);
      expect(isAmount(undefined)).toBe(false);
      expect(isAmount({})).toBe(false);
      expect(isAmount([])).toBe(false);
      expect(isAmount(Number.NaN)).toBe(false);
      expect(isAmount(Infinity)).toBe(false);
      expect(isAmount(-Infinity)).toBe(false);
    });

    it("should respect options when validating", () => {
      // With min option
      expect(isAmount(5, { min: 10 })).toBe(false);
      expect(isAmount(10, { min: 10 })).toBe(true);
      expect(isAmount(15, { min: 10 })).toBe(true);

      // With max option
      expect(isAmount(100, { max: 50 })).toBe(false);
      expect(isAmount(50, { max: 50 })).toBe(true);
      expect(isAmount(25, { max: 50 })).toBe(true);

      // With decimals option
      expect(isAmount(0, { decimals: 2 })).toBe(false);
      expect(isAmount(0.009, { decimals: 2 })).toBe(false);
      expect(isAmount(0.01, { decimals: 2 })).toBe(true);
      expect(isAmount(10.99, { decimals: 2 })).toBe(true);

      // With combined options
      expect(isAmount(5, { min: 10, max: 100 })).toBe(false);
      expect(isAmount(50, { min: 10, max: 100 })).toBe(true);
      expect(isAmount(150, { min: 10, max: 100 })).toBe(false);
    });

    it("should handle string inputs with options", () => {
      expect(isAmount("5", { min: 10 })).toBe(false);
      expect(isAmount("10", { min: 10 })).toBe(true);
      expect(isAmount("100.5", { max: 50 })).toBe(false);
      expect(isAmount("25.75", { max: 50 })).toBe(true);
    });
  });

  describe("getAmount function", () => {
    it("should return parsed amount for valid inputs", () => {
      expect(getAmount(100)).toBe(100);
      expect(getAmount("100")).toBe(100);
      expect(getAmount(0)).toBe(0);
      expect(getAmount("0.01")).toBe(0.01);
      expect(getAmount(999.99)).toBe(999.99);
    });

    it("should throw for invalid inputs", () => {
      expect(() => getAmount(-1)).toThrow("Amount must be at least 0");
      expect(() => getAmount("abc")).toThrow("Invalid amount format");
      expect(() => getAmount(null)).toThrow();
      expect(() => getAmount(undefined)).toThrow();
      expect(() => getAmount({})).toThrow();
      expect(() => getAmount([])).toThrow();
      expect(() => getAmount(Number.NaN)).toThrow();
      expect(() => getAmount(Infinity)).toThrow();
    });

    it("should respect options when parsing", () => {
      // With min option
      expect(() => getAmount(5, { min: 10 })).toThrow("Amount must be at least 10");
      expect(getAmount(10, { min: 10 })).toBe(10);
      expect(getAmount(15, { min: 10 })).toBe(15);

      // With max option
      expect(() => getAmount(100, { max: 50 })).toThrow("Amount must not exceed 50");
      expect(getAmount(50, { max: 50 })).toBe(50);
      expect(getAmount(25, { max: 50 })).toBe(25);

      // With decimals option
      expect(() => getAmount(0, { decimals: 2 })).toThrow("Amount must be at least 0.01");
      expect(() => getAmount(0.009, { decimals: 2 })).toThrow("Amount must be at least 0.01");
      expect(getAmount(0.01, { decimals: 2 })).toBe(0.01);
      expect(getAmount(10.99, { decimals: 2 })).toBe(10.99);

      // With combined options
      expect(() => getAmount(5, { min: 10, max: 100 })).toThrow("Amount must be at least 10");
      expect(getAmount(50, { min: 10, max: 100 })).toBe(50);
      expect(() => getAmount(150, { min: 10, max: 100 })).toThrow("Amount must not exceed 100");
    });

    it("should handle string inputs with options", () => {
      expect(() => getAmount("5", { min: 10 })).toThrow("Amount must be at least 10");
      expect(getAmount("10", { min: 10 })).toBe(10);
      expect(() => getAmount("100.5", { max: 50 })).toThrow("Amount must not exceed 50");
      expect(getAmount("25.75", { max: 50 })).toBe(25.75);
    });
  });

  describe("edge cases and boundary conditions", () => {
    it("should handle decimal precision edge cases", () => {
      const validator = amount({ decimals: 6 });
      expect(validator.parse(0.000_001)).toBe(0.000_001);
      expect(() => validator.parse(0.000_000_9)).toThrow("Amount must be at least 0.000001");
    });

    it("should handle min taking precedence over decimals", () => {
      const validator = amount({ min: 100, decimals: 2 });
      // min (100) should take precedence over decimals-based min (0.01)
      expect(() => validator.parse(50)).toThrow("Amount must be at least 100");
      expect(validator.parse(100)).toBe(100);
    });

    it("should handle max as Number.MAX_SAFE_INTEGER by default", () => {
      const validator = amount();
      expect(validator.parse(Number.MAX_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER);
      expect(() => validator.parse(Number.MAX_SAFE_INTEGER + 1)).toThrow();
    });

    it("should handle very small decimals", () => {
      const validator = amount({ decimals: 10 });
      expect(validator.parse(0.000_000_000_1)).toBe(0.000_000_000_1);
      expect(() => validator.parse(0.000_000_000_09)).toThrow("Amount must be at least 1e-10");
    });

    it("should handle zero decimals", () => {
      const validator = amount({ decimals: 0 });
      // 10^-0 = 1, so minimum should be 1
      expect(() => validator.parse(0)).toThrow("Amount must be at least 1");
      expect(() => validator.parse(0.5)).toThrow("Amount must be at least 1");
      expect(validator.parse(1)).toBe(1);
      expect(validator.parse(100)).toBe(100);
    });

    it("should handle scientific notation in strings", () => {
      const validator = amount();
      expect(validator.parse("1e3")).toBe(1000);
      expect(validator.parse("1.5e2")).toBe(150);
      expect(validator.parse("1e-3")).toBe(0.001);
    });

    it("should handle leading/trailing spaces in strings", () => {
      const validator = amount();
      expect(validator.parse(" 100 ")).toBe(100);
      expect(validator.parse("  50.5  ")).toBe(50.5);
    });

    it("should reject empty strings with custom error", () => {
      const validator = amount();
      expect(() => validator.parse("")).toThrow("Invalid amount format");
    });

    it("should handle the schema description", () => {
      const validator1 = amount();
      expect(validator1.description).toBe("A positive numerical amount between 0 and 9007199254740991");

      const validator2 = amount({ min: 10, max: 100 });
      expect(validator2.description).toBe("A positive numerical amount between 10 and 100");

      const validator3 = amount({ decimals: 2 });
      expect(validator3.description).toBe("A positive numerical amount between 0.01 and 9007199254740991");
    });
  });

  describe("transform function behavior", () => {
    it("should properly transform valid string inputs", () => {
      const validator = amount();
      expect(validator.parse("123.45")).toBe(123.45);
      expect(validator.parse("0")).toBe(0);
      expect(validator.parse("999999.999999")).toBe(999_999.999_999);
    });

    it("should pass through number inputs without transformation", () => {
      const validator = amount();
      const num = 123.456;
      expect(validator.parse(num)).toBe(num);
      expect(validator.parse(0)).toBe(0);
    });

    it("should reject invalid string formats with custom message", () => {
      const validator = amount();
      expect(() => validator.parse("not-a-number")).toThrow(
        "Invalid amount format. Please provide a valid numeric string"
      );
      // "12.34.56" is parsed as 12.34 by parseFloat, so it passes validation
      expect(validator.parse("12.34.56")).toBe(12.34);
      expect(() => validator.parse("$100")).toThrow("Invalid amount format. Please provide a valid numeric string");
    });
  });

  describe("refinement order and messages", () => {
    it("should check minimum before maximum", () => {
      const validator = amount({ min: 100, max: 50 }); // Invalid range
      // Should fail on minimum check first
      expect(() => validator.parse(75)).toThrow("Amount must be at least 100");
    });

    it("should provide clear error messages for each validation", () => {
      const validator = amount({ min: 10, max: 100 });

      // Below minimum
      try {
        validator.parse(5);
      } catch (error) {
        if (error instanceof Error && "issues" in error) {
          expect((error as { issues: Array<{ message: string }> }).issues[0]?.message).toBe(
            "Amount must be at least 10"
          );
        }
      }

      // Above maximum
      try {
        validator.parse(150);
      } catch (error) {
        if (error instanceof Error && "issues" in error) {
          expect((error as { issues: Array<{ message: string }> }).issues[0]?.message).toBe(
            "Amount must not exceed 100"
          );
        }
      }
    });
  });
});
