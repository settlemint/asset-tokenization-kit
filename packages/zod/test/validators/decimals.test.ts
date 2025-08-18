import { describe, expect, it, test } from "bun:test";
import { decimals, getDecimals, isDecimals } from "../../src/validators/decimals";

describe("decimals", () => {
  const validator = decimals();

  describe("valid decimal values", () => {
    it("should accept zero", () => {
      expect(validator.parse(0)).toBe(0);
    });

    it("should accept common decimal values", () => {
      expect(validator.parse(2)).toBe(2); // Common for fiat
      expect(validator.parse(6)).toBe(6); // USDC
      expect(validator.parse(8)).toBe(8); // BTC
      expect(validator.parse(18)).toBe(18); // ETH and most ERC20s
    });

    it("should accept all values from 0 to 18", () => {
      for (let i = 0; i <= 18; i++) {
        expect(validator.parse(i)).toBe(i);
      }
    });
  });

  describe("string input handling", () => {
    it("should accept valid numeric strings", () => {
      expect(validator.parse("0")).toBe(0);
      expect(validator.parse("6")).toBe(6);
      expect(validator.parse("18")).toBe(18);
    });

    it("should reject strings with decimal points", () => {
      expect(() => validator.parse("2.5")).toThrow("Decimals must be a whole number (integer)");
      expect(() => validator.parse("6.0")).toThrow("Decimals must be a whole number (integer)");
      expect(() => validator.parse("17.99")).toThrow("Decimals must be a whole number (integer)");
    });

    it("should reject strings with scientific notation", () => {
      expect(() => validator.parse("1e2")).toThrow("Decimals must be a whole number (integer)");
      expect(() => validator.parse("2e1")).toThrow("Decimals must be a whole number (integer)");
      expect(() => validator.parse("1.5e1")).toThrow("Decimals must be a whole number (integer)");
    });

    it("should reject non-numeric strings", () => {
      expect(() => validator.parse("abc")).toThrow("Decimals must be a whole number (integer)");
      expect(() => validator.parse("")).toThrow("Decimals must be a whole number (integer)");
      expect(() => validator.parse(" ")).toThrow("Decimals must be a whole number (integer)");
      expect(() => validator.parse("one")).toThrow("Decimals must be a whole number (integer)");
    });

    it("should reject strings that would overflow", () => {
      expect(() => validator.parse("19")).toThrow("Decimals cannot exceed 18 (ERC20 standard maximum)");
      expect(() => validator.parse("100")).toThrow("Decimals cannot exceed 18 (ERC20 standard maximum)");
    });

    it("should reject negative numeric strings", () => {
      expect(() => validator.parse("-1")).toThrow("Decimals cannot be negative");
      expect(() => validator.parse("-10")).toThrow("Decimals cannot be negative");
    });
  });

  describe("invalid decimal values", () => {
    it("should reject negative numbers", () => {
      expect(() => validator.parse(-1)).toThrow("Decimals cannot be negative");
      expect(() => validator.parse(-18)).toThrow("Decimals cannot be negative");
    });

    it("should reject values greater than 18", () => {
      expect(() => validator.parse(19)).toThrow("Decimals cannot exceed 18 (ERC20 standard maximum)");
      expect(() => validator.parse(20)).toThrow("Decimals cannot exceed 18 (ERC20 standard maximum)");
      expect(() => validator.parse(100)).toThrow("Decimals cannot exceed 18 (ERC20 standard maximum)");
    });

    it("should reject non-integer values", () => {
      expect(() => validator.parse(2.5)).toThrow("Decimals must be a whole number (integer)");
      expect(() => validator.parse(6.1)).toThrow("Decimals must be a whole number (integer)");
      expect(() => validator.parse(17.99)).toThrow("Decimals must be a whole number (integer)");
    });

    it("should reject invalid types", () => {
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
      expect(() => validator.parse([])).toThrow();
      expect(() => validator.parse(true)).toThrow();
      expect(() => validator.parse(false)).toThrow();
    });

    it("should reject special numeric values", () => {
      expect(() => validator.parse(Number.NaN)).toThrow();
      expect(() => validator.parse(Infinity)).toThrow();
      expect(() => validator.parse(-Infinity)).toThrow();
    });
  });

  describe("safeParse", () => {
    it("should return success for valid decimals", () => {
      const result = validator.safeParse(6);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(6);
      }
    });

    it("should return error for invalid decimals", () => {
      const result = validator.safeParse(19);
      expect(result.success).toBe(false);
    });
  });

  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse(8);
      // Test that the type is correctly inferred
      expect(result).toBe(8);
    });
  });
});

describe("isDecimals", () => {
  test("should return true for valid decimals", () => {
    expect(isDecimals(0)).toBe(true);
    expect(isDecimals(6)).toBe(true);
    expect(isDecimals(18)).toBe(true);
    expect(isDecimals("0")).toBe(true);
    expect(isDecimals("6")).toBe(true);
    expect(isDecimals("18")).toBe(true);
  });

  test("should return false for invalid decimals", () => {
    expect(isDecimals(-1)).toBe(false);
    expect(isDecimals(19)).toBe(false);
    expect(isDecimals(2.5)).toBe(false);
    expect(isDecimals("abc")).toBe(false);
    expect(isDecimals("2.5")).toBe(false);
    expect(isDecimals("1e2")).toBe(false);
    expect(isDecimals(null)).toBe(false);
    expect(isDecimals(undefined)).toBe(false);
    expect(isDecimals({})).toBe(false);
    expect(isDecimals([])).toBe(false);
    expect(isDecimals(Number.NaN)).toBe(false);
    expect(isDecimals(Infinity)).toBe(false);
    expect(isDecimals(-Infinity)).toBe(false);
  });

  test("should work as type guard", () => {
    const value: unknown = 6;
    if (isDecimals(value)) {
      // TypeScript should recognize value as Decimals type here
      expect(value).toBe(6);
    } else {
      expect.fail("Should have been valid decimals");
    }
  });
});

describe("getDecimals", () => {
  test("should return parsed value for valid decimals", () => {
    expect(getDecimals(0)).toBe(0);
    expect(getDecimals(6)).toBe(6);
    expect(getDecimals(18)).toBe(18);
    expect(getDecimals("0")).toBe(0);
    expect(getDecimals("6")).toBe(6);
    expect(getDecimals("18")).toBe(18);
  });

  test("should throw for invalid decimals", () => {
    expect(() => getDecimals(-1)).toThrow("Decimals cannot be negative");
    expect(() => getDecimals(19)).toThrow("Decimals cannot exceed 18 (ERC20 standard maximum)");
    expect(() => getDecimals(2.5)).toThrow("Decimals must be a whole number (integer)");
    expect(() => getDecimals("abc")).toThrow("Decimals must be a whole number (integer)");
    expect(() => getDecimals("2.5")).toThrow("Decimals must be a whole number (integer)");
    expect(() => getDecimals("1e2")).toThrow("Decimals must be a whole number (integer)");
    expect(() => getDecimals(null)).toThrow();
    expect(() => getDecimals(undefined)).toThrow();
    expect(() => getDecimals({})).toThrow();
    expect(() => getDecimals(Number.NaN)).toThrow();
    expect(() => getDecimals(Infinity)).toThrow();
    expect(() => getDecimals(-Infinity)).toThrow();
  });

  test("should be used in token calculations", () => {
    const tokenDecimals = getDecimals(18);
    const displayAmount = 1;
    const atomicUnits = displayAmount * 10 ** tokenDecimals;
    expect(atomicUnits).toBe(1e18);
  });
});
