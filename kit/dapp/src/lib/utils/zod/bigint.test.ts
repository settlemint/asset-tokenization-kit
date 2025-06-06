import { describe, expect, it } from "bun:test";
import {
  bigIntInput,
  getBigIntInput,
  getNonNegativeBigInt,
  getPositiveBigInt,
  getStringifiedBigInt,
  isBigIntInput,
  isNonNegativeBigInt,
  isPositiveBigInt,
  isStringifiedBigInt,
  nonNegativeBigInt,
  positiveBigInt,
  stringifiedBigInt,
  type BigIntInput,
  type NonNegativeBigInt,
  type PositiveBigInt,
  type StringifiedBigInt,
} from "./bigint";

describe("stringifiedBigInt", () => {
  const validator = stringifiedBigInt();

  describe("valid inputs", () => {
    it("should parse a simple positive number", () => {
      expect(validator.parse("123")).toBe(getStringifiedBigInt("123"));
      expect(isStringifiedBigInt("123")).toBe(true);
      expect(getStringifiedBigInt("123")).toBe(getStringifiedBigInt("123"));
    });

    it("should parse a very large number", () => {
      const largeNum = "123456789012345678901234567890";
      expect(validator.parse(largeNum)).toBe(getStringifiedBigInt(largeNum));
      expect(isStringifiedBigInt(largeNum)).toBe(true);
      expect(getStringifiedBigInt(largeNum)).toBe(
        getStringifiedBigInt(largeNum)
      );
    });

    it("should parse zero", () => {
      expect(validator.parse("0")).toBe(getStringifiedBigInt("0"));
      expect(isStringifiedBigInt("0")).toBe(true);
      expect(getStringifiedBigInt("0")).toBe(getStringifiedBigInt("0"));
    });

    it("should parse negative numbers", () => {
      expect(validator.parse("-123")).toBe(getStringifiedBigInt("-123"));
      expect(validator.parse("-999999999999999999999")).toBe(
        getStringifiedBigInt("-999999999999999999999")
      );

      expect(isStringifiedBigInt("-123")).toBe(true);
      expect(isStringifiedBigInt("-999999999999999999999")).toBe(true);

      expect(getStringifiedBigInt("-123")).toBe(getStringifiedBigInt("-123"));
      expect(getStringifiedBigInt("-999999999999999999999")).toBe(
        getStringifiedBigInt("-999999999999999999999")
      );
    });

    it("should handle decimal strings by truncating", () => {
      expect(validator.parse("123.456")).toBe(getStringifiedBigInt("123.456"));
      expect(validator.parse("999.999")).toBe(getStringifiedBigInt("999.999"));
      expect(validator.parse("-123.456")).toBe(
        getStringifiedBigInt("-123.456")
      );

      expect(isStringifiedBigInt("123.456")).toBe(true);
      expect(isStringifiedBigInt("999.999")).toBe(true);
      expect(isStringifiedBigInt("-123.456")).toBe(true);

      expect(getStringifiedBigInt("123.456")).toBe(
        getStringifiedBigInt("123.456")
      );
      expect(getStringifiedBigInt("999.999")).toBe(
        getStringifiedBigInt("999.999")
      );
      expect(getStringifiedBigInt("-123.456")).toBe(
        getStringifiedBigInt("-123.456")
      );
    });

    it("should trim whitespace", () => {
      expect(validator.parse("  123  ")).toBe(getStringifiedBigInt("  123  "));
      expect(validator.parse("	456\n")).toBe(getStringifiedBigInt("	456\n"));

      expect(isStringifiedBigInt("  123  ")).toBe(true);
      expect(isStringifiedBigInt("	456\n")).toBe(true);

      expect(getStringifiedBigInt("  123  ")).toBe(
        getStringifiedBigInt("  123  ")
      );
      expect(getStringifiedBigInt("	456\n")).toBe(getStringifiedBigInt("	456\n"));
    });

    it("should normalize leading zeros", () => {
      expect(validator.parse("0000123")).toBe(getStringifiedBigInt("0000123"));
      expect(validator.parse("-0000456")).toBe(
        getStringifiedBigInt("-0000456")
      );
      expect(validator.parse("0000")).toBe(getStringifiedBigInt("0000"));

      expect(isStringifiedBigInt("0000123")).toBe(true);
      expect(isStringifiedBigInt("-0000456")).toBe(true);
      expect(isStringifiedBigInt("0000")).toBe(true);

      expect(getStringifiedBigInt("0000123")).toBe(
        getStringifiedBigInt("0000123")
      );
      expect(getStringifiedBigInt("-0000456")).toBe(
        getStringifiedBigInt("-0000456")
      );
      expect(getStringifiedBigInt("0000")).toBe(getStringifiedBigInt("0000"));
    });
  });

  describe("invalid inputs", () => {
    it("should reject empty string", () => {
      expect(() => validator.parse("")).toThrow(
        "BigInt string cannot be empty"
      );
      expect(isStringifiedBigInt("")).toBe(false);
      expect(() => getStringifiedBigInt("")).toThrow(
        "Invalid stringified bigint"
      );
    });

    it("should reject non-numeric strings", () => {
      expect(() => validator.parse("abc")).toThrow();
      expect(() => validator.parse("12a34")).toThrow();
      expect(() => validator.parse("$123")).toThrow();

      expect(isStringifiedBigInt("abc")).toBe(false);
      expect(isStringifiedBigInt("12a34")).toBe(false);
      expect(isStringifiedBigInt("$123")).toBe(false);

      expect(() => getStringifiedBigInt("abc")).toThrow(
        "Invalid stringified bigint"
      );
      expect(() => getStringifiedBigInt("12a34")).toThrow(
        "Invalid stringified bigint"
      );
      expect(() => getStringifiedBigInt("$123")).toThrow(
        "Invalid stringified bigint"
      );
    });

    it("should reject multiple decimal points", () => {
      expect(() => validator.parse("123.456.789")).toThrow();
      expect(isStringifiedBigInt("123.456.789")).toBe(false);
      expect(() => getStringifiedBigInt("123.456.789")).toThrow(
        "Invalid stringified bigint"
      );
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();

      expect(isStringifiedBigInt(123)).toBe(false);
      expect(isStringifiedBigInt(null)).toBe(false);
      expect(isStringifiedBigInt(undefined)).toBe(false);
      expect(isStringifiedBigInt({})).toBe(false);

      expect(() => getStringifiedBigInt(123)).toThrow(
        "Invalid stringified bigint"
      );
      expect(() => getStringifiedBigInt(null)).toThrow(
        "Invalid stringified bigint"
      );
      expect(() => getStringifiedBigInt(undefined)).toThrow(
        "Invalid stringified bigint"
      );
      expect(() => getStringifiedBigInt({})).toThrow(
        "Invalid stringified bigint"
      );
    });

    it("should reject scientific notation", () => {
      expect(() => validator.parse("1e10")).toThrow();
      expect(() => validator.parse("1.23e-4")).toThrow();

      expect(isStringifiedBigInt("1e10")).toBe(false);
      expect(isStringifiedBigInt("1.23e-4")).toBe(false);

      expect(() => getStringifiedBigInt("1e10")).toThrow(
        "Invalid stringified bigint"
      );
      expect(() => getStringifiedBigInt("1.23e-4")).toThrow(
        "Invalid stringified bigint"
      );
    });
  });
});

describe("bigIntInput", () => {
  const validator = bigIntInput();

  it("should accept string inputs", () => {
    expect(validator.parse("123")).toBe(getBigIntInput("123"));
    expect(isBigIntInput("123")).toBe(true);
    expect(getBigIntInput("123")).toBe(getBigIntInput("123"));
  });

  it("should accept bigint inputs", () => {
    expect(validator.parse(456n)).toBe(getBigIntInput(456n));
    expect(isBigIntInput(456n)).toBe(true);
    expect(getBigIntInput(456n)).toBe(getBigIntInput(456n));
  });

  it("should reject other types", () => {
    expect(() => validator.parse(123)).toThrow();
    expect(() => validator.parse(null)).toThrow();

    expect(isBigIntInput(123)).toBe(false);
    expect(isBigIntInput(null)).toBe(false);

    expect(() => getBigIntInput(123)).toThrow("Invalid bigint input");
    expect(() => getBigIntInput(null)).toThrow("Invalid bigint input");
  });
});

describe("positiveBigInt", () => {
  const validator = positiveBigInt();

  it("should accept positive numbers", () => {
    expect(validator.parse("1")).toBe(getPositiveBigInt("1"));
    expect(validator.parse("999999999999999999999")).toBe(
      getPositiveBigInt("999999999999999999999")
    );

    expect(isPositiveBigInt("1")).toBe(true);
    expect(isPositiveBigInt("999999999999999999999")).toBe(true);

    expect(getPositiveBigInt("1")).toBe(getPositiveBigInt("1"));
    expect(getPositiveBigInt("999999999999999999999")).toBe(
      getPositiveBigInt("999999999999999999999")
    );
  });

  it("should reject zero", () => {
    expect(() => validator.parse("0")).toThrow("BigInt must be positive");
    expect(isPositiveBigInt("0")).toBe(false);
    expect(() => getPositiveBigInt("0")).toThrow("Invalid positive bigint");
  });

  it("should reject negative numbers", () => {
    expect(() => validator.parse("-1")).toThrow("BigInt must be positive");
    expect(() => validator.parse("-999")).toThrow("BigInt must be positive");

    expect(isPositiveBigInt("-1")).toBe(false);
    expect(isPositiveBigInt("-999")).toBe(false);

    expect(() => getPositiveBigInt("-1")).toThrow("Invalid positive bigint");
    expect(() => getPositiveBigInt("-999")).toThrow("Invalid positive bigint");
  });
});

describe("nonNegativeBigInt", () => {
  const validator = nonNegativeBigInt();

  it("should accept positive numbers", () => {
    expect(validator.parse("1")).toBe(getNonNegativeBigInt("1"));
    expect(validator.parse("999999999999999999999")).toBe(
      getNonNegativeBigInt("999999999999999999999")
    );

    expect(isNonNegativeBigInt("1")).toBe(true);
    expect(isNonNegativeBigInt("999999999999999999999")).toBe(true);

    expect(getNonNegativeBigInt("1")).toBe(getNonNegativeBigInt("1"));
    expect(getNonNegativeBigInt("999999999999999999999")).toBe(
      getNonNegativeBigInt("999999999999999999999")
    );
  });

  it("should accept zero", () => {
    expect(validator.parse("0")).toBe(getNonNegativeBigInt("0"));
    expect(isNonNegativeBigInt("0")).toBe(true);
    expect(getNonNegativeBigInt("0")).toBe(getNonNegativeBigInt("0"));
  });

  it("should reject negative numbers", () => {
    expect(() => validator.parse("-1")).toThrow("BigInt must be non-negative");
    expect(() => validator.parse("-999")).toThrow(
      "BigInt must be non-negative"
    );

    expect(isNonNegativeBigInt("-1")).toBe(false);
    expect(isNonNegativeBigInt("-999")).toBe(false);

    expect(() => getNonNegativeBigInt("-1")).toThrow(
      "Invalid non-negative bigint"
    );
    expect(() => getNonNegativeBigInt("-999")).toThrow(
      "Invalid non-negative bigint"
    );
  });
});

describe("helper functions", () => {
  it("isStringifiedBigInt should work as type guard", () => {
    const value: unknown = "12345";
    if (isStringifiedBigInt(value)) {
      // TypeScript should recognize value as StringifiedBigInt here
      const _typeCheck: StringifiedBigInt = value;
    }
  });

  it("getStringifiedBigInt should return typed value", () => {
    const result = getStringifiedBigInt("67890");
    // TypeScript should recognize result as StringifiedBigInt
    const _typeCheck: StringifiedBigInt = result;
    expect(result).toBe(getStringifiedBigInt("67890"));
  });

  it("isBigIntInput should work as type guard", () => {
    const value: unknown = 123n;
    if (isBigIntInput(value)) {
      // TypeScript should recognize value as BigIntInput here
      const _typeCheck: BigIntInput = value;
    }
  });

  it("getBigIntInput should return typed value", () => {
    const result = getBigIntInput(456n);
    // TypeScript should recognize result as BigIntInput
    const _typeCheck: BigIntInput = result;
    expect(result).toBe(getBigIntInput(456n));
  });

  it("isPositiveBigInt should work as type guard", () => {
    const value: unknown = "42";
    if (isPositiveBigInt(value)) {
      // TypeScript should recognize value as PositiveBigInt here
      const _typeCheck: PositiveBigInt = value;
    }
  });

  it("getPositiveBigInt should return typed value", () => {
    const result = getPositiveBigInt("100");
    // TypeScript should recognize result as PositiveBigInt
    const _typeCheck: PositiveBigInt = result;
    expect(result).toBe(getPositiveBigInt("100"));
  });

  it("isNonNegativeBigInt should work as type guard", () => {
    const value: unknown = "0";
    if (isNonNegativeBigInt(value)) {
      // TypeScript should recognize value as NonNegativeBigInt here
      const _typeCheck: NonNegativeBigInt = value;
    }
  });

  it("getNonNegativeBigInt should return typed value", () => {
    const result = getNonNegativeBigInt("0");
    // TypeScript should recognize result as NonNegativeBigInt
    const _typeCheck: NonNegativeBigInt = result;
    expect(result).toBe(getNonNegativeBigInt("0"));
  });
});
