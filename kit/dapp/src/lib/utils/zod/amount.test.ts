import { describe, expect, it } from "bun:test";
import {
  amount,
  cryptoAmount,
  getAmount,
  getCryptoAmount,
  getMonetaryAmount,
  getPercentage,
  getWholeAmount,
  isAmount,
  isCryptoAmount,
  isMonetaryAmount,
  isPercentage,
  isWholeAmount,
  monetaryAmount,
  percentage,
  wholeAmount,
} from "./amount";

describe("amount", () => {
  describe("basic validation", () => {
    const validator = amount();

    it("should accept positive numbers", () => {
      expect(validator.parse(1)).toBe(getAmount(1));
      expect(validator.parse(100)).toBe(getAmount(100));
      expect(validator.parse(999.99)).toBe(getAmount(999.99));
    });

    it("should accept very small positive numbers", () => {
      expect(validator.parse(0.000001)).toBe(getAmount(0.000001));
      expect(validator.parse(Number.EPSILON)).toBe(getAmount(Number.EPSILON));
    });

    it("should reject zero by default", () => {
      expect(() => validator.parse(0)).toThrow("Amount must be at least");
    });

    it("should reject negative numbers", () => {
      expect(() => validator.parse(-1)).toThrow("Amount must be at least");
      expect(() => validator.parse(-0.01)).toThrow("Amount must be at least");
    });

    it("should reject non-numeric types", () => {
      expect(() => validator.parse("100")).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    it("should reject NaN", () => {
      expect(() => validator.parse(NaN)).toThrow();
    });

    it("should reject Infinity", () => {
      expect(() => validator.parse(Infinity)).toThrow();
      expect(() => validator.parse(-Infinity)).toThrow();
    });
  });

  describe("with min/max options", () => {
    const validator = amount({ min: 10, max: 1000 });

    it("should accept values within range", () => {
      expect(validator.parse(10)).toBe(getAmount(10));
      expect(validator.parse(500)).toBe(getAmount(500));
      expect(validator.parse(1000)).toBe(getAmount(1000));
    });

    it("should reject values below minimum", () => {
      expect(() => validator.parse(9.99)).toThrow("Amount must be at least 10");
      expect(() => validator.parse(0)).toThrow("Amount must be at least 10");
    });

    it("should reject values above maximum", () => {
      expect(() => validator.parse(1000.01)).toThrow(
        "Amount must be at most 1000"
      );
      expect(() => validator.parse(10000)).toThrow(
        "Amount must be at most 1000"
      );
    });
  });

  describe("with decimal precision", () => {
    const validator = amount({ decimals: 2 });

    it("should accept values with valid decimal places", () => {
      expect(validator.parse(10)).toBe(getAmount(10));
      expect(validator.parse(10.5)).toBe(getAmount(10.5));
      expect(validator.parse(10.99)).toBe(getAmount(10.99));
    });

    it("should reject values with too many decimal places", () => {
      expect(() => validator.parse(10.999)).toThrow(
        "Amount must have at most 2 decimal places"
      );
      expect(() => validator.parse(10.12345)).toThrow(
        "Amount must have at most 2 decimal places"
      );
    });

    it("should handle minimum based on decimals", () => {
      expect(validator.parse(0.01)).toBe(getAmount(0.01));
      expect(() => validator.parse(0.009)).toThrow(
        "Amount must be at least 0.01"
      );
    });
  });

  describe("with allowZero option", () => {
    const validator = amount({ allowZero: true });

    it("should accept zero", () => {
      expect(validator.parse(0)).toBe(getAmount(0));
    });

    it("should still accept positive numbers", () => {
      expect(validator.parse(1)).toBe(getAmount(1));
      expect(validator.parse(100)).toBe(getAmount(100));
    });

    it("should still reject negative numbers", () => {
      expect(() => validator.parse(-1)).toThrow("Amount must be at least 0");
    });
  });

});

describe("monetaryAmount", () => {
  const validator = monetaryAmount();

  it("should enforce 2 decimal places", () => {
    expect(validator.parse(10.99)).toBe(getMonetaryAmount(10.99));
    expect(() => validator.parse(10.999)).toThrow(
      "Amount must have at most 2 decimal places"
    );
  });

  it("should have minimum of 0.01", () => {
    expect(validator.parse(0.01)).toBe(getMonetaryAmount(0.01));
    expect(() => validator.parse(0.009)).toThrow(
      "Amount must be at least 0.01"
    );
  });
});

describe("percentage", () => {
  const validator = percentage();

  it("should accept values between 0 and 100", () => {
    expect(validator.parse(0)).toBe(getPercentage(0));
    expect(validator.parse(50)).toBe(getPercentage(50));
    expect(validator.parse(100)).toBe(getPercentage(100));
  });

  it("should enforce 2 decimal places", () => {
    expect(validator.parse(50.25)).toBe(getPercentage(50.25));
    expect(() => validator.parse(50.259)).toThrow(
      "Amount must have at most 2 decimal places"
    );
  });

  it("should reject values outside 0-100", () => {
    expect(() => validator.parse(-1)).toThrow("Amount must be at least 0");
    expect(() => validator.parse(100.01)).toThrow("Amount must be at most 100");
  });
});

describe("wholeAmount", () => {
  const validator = wholeAmount();

  it("should accept whole numbers", () => {
    expect(validator.parse(1)).toBe(getWholeAmount(1));
    expect(validator.parse(100)).toBe(getWholeAmount(100));
    expect(validator.parse(9999)).toBe(getWholeAmount(9999));
  });

  it("should reject decimal numbers", () => {
    expect(() => validator.parse(10.5)).toThrow(
      "Amount must be a whole number"
    );
    expect(() => validator.parse(10.01)).toThrow(
      "Amount must be a whole number"
    );
  });

  it("should reject zero by default", () => {
    expect(() => validator.parse(0)).toThrow("Amount must be at least");
  });

  it("should accept zero with allowZero", () => {
    const validatorWithZero = wholeAmount({ allowZero: true });
    expect(validatorWithZero.parse(0)).toBe(getWholeAmount(0));
  });
});

describe("cryptoAmount", () => {
  const validator = cryptoAmount();

  it("should accept up to 18 decimal places", () => {
    expect(validator.parse(0.000000000000000001)).toBe(
      getCryptoAmount(0.000000000000000001)
    );
    // JavaScript can only accurately represent up to ~15-17 decimal places
    expect(validator.parse(1.123456789012345)).toBe(
      getCryptoAmount(1.123456789012345)
    );
  });

  it("should have appropriate minimum", () => {
    expect(validator.parse(0.000000000000000001)).toBe(
      getCryptoAmount(0.000000000000000001)
    );
  });
});

describe("helper functions", () => {
  describe("isAmount and getAmount", () => {
    it("should correctly identify valid amounts", () => {
      expect(isAmount(100)).toBe(true);
      expect(isAmount(0.01)).toBe(true);
      expect(isAmount("not a number")).toBe(false);
      expect(isAmount(null)).toBe(false);
    });

    it("should respect options", () => {
      expect(isAmount(5, { min: 10 })).toBe(false);
      expect(isAmount(15, { min: 10 })).toBe(true);
    });

    it("should get valid amounts", () => {
      expect(getAmount(100)).toBe(getAmount(100));
      expect(() => getAmount("not a number")).toThrow("Invalid amount");
      expect(() => getAmount(5, { min: 10 })).toThrow("Invalid amount");
      expect(getAmount(15, { min: 10 })).toBe(getAmount(15, { min: 10 }));
    });
  });

  describe("isMonetaryAmount and getMonetaryAmount", () => {
    it("should validate monetary amounts", () => {
      expect(isMonetaryAmount(10.99)).toBe(true);
      expect(isMonetaryAmount(10.999)).toBe(false);
      expect(getMonetaryAmount(10.99)).toBe(getMonetaryAmount(10.99));
      expect(() => getMonetaryAmount(10.999)).toThrow(
        "Invalid monetary amount"
      );
    });
  });

  describe("isPercentage and getPercentage", () => {
    it("should validate percentages", () => {
      expect(isPercentage(50)).toBe(true);
      expect(isPercentage(101)).toBe(false);
      expect(isPercentage(-1)).toBe(false);
      expect(getPercentage(50)).toBe(getPercentage(50));
      expect(() => getPercentage(101)).toThrow("Invalid percentage");
    });
  });

  describe("isWholeAmount and getWholeAmount", () => {
    it("should validate whole amounts", () => {
      expect(isWholeAmount(100)).toBe(true);
      expect(isWholeAmount(100.5)).toBe(false);
      expect(getWholeAmount(100)).toBe(getWholeAmount(100));
      expect(() => getWholeAmount(100.5)).toThrow("Invalid whole amount");
    });
  });

  describe("isCryptoAmount and getCryptoAmount", () => {
    it("should validate crypto amounts", () => {
      expect(isCryptoAmount(0.000000000000000001)).toBe(true);
      expect(isCryptoAmount(-1)).toBe(false);
      expect(getCryptoAmount(1.23456)).toBe(getCryptoAmount(1.23456));
      expect(() => getCryptoAmount(-1)).toThrow("Invalid crypto amount");
    });
  });
});
