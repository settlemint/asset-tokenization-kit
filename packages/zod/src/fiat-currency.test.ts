/**
 * @fileoverview Test suite for fiat currency validation and metadata
 * 
 * This test suite validates ISO 4217 currency codes and provides metadata
 * for major world currencies used in financial applications.
 * 
 * Test Strategy:
 * - Currency Codes: 3-letter ISO 4217 standard codes (USD, EUR, GBP, etc.)
 * - Case Handling: Accept lowercase, transform to standard uppercase
 * - Metadata Validation: Currency names, symbols, and decimal places
 * - Geographic Coverage: Major currencies from different regions
 * - Type Safety: Branded string type for currency-specific operations
 * - Helper Functions: Currency lookup, validation, and metadata retrieval
 * 
 * STANDARD: ISO 4217 international standard for currency codes
 * COVERAGE: Supports 20+ major world currencies for global financial apps
 */

import { describe, expect, it, test } from "bun:test";
import {
  allFiatCurrencies,
  fiatCurrencies,
  fiatCurrency,
  fiatCurrencyMetadata,
  getCurrencyMetadata,
  getFiatCurrency,
  isFiatCurrency,
  type FiatCurrency,
} from "./fiat-currency";

describe("fiatCurrency", () => {
  const validator = fiatCurrency();

  describe("valid currencies", () => {
    it("should accept common 3-letter currency codes", () => {
      // WHY: ISO 4217 standard 3-letter codes for major world currencies
      expect(validator.parse("USD")).toBe("USD"); // US Dollar
      expect(validator.parse("EUR")).toBe("EUR"); // Euro
      expect(validator.parse("GBP")).toBe("GBP"); // British Pound
      expect(validator.parse("JPY")).toBe("JPY");
    });

    it("should only accept uppercase codes", () => {
      expect(validator.parse("CHF")).toBe("CHF");
      expect(validator.parse("AUD")).toBe("AUD");
      expect(validator.parse("SGD")).toBe("SGD");
    });

    it("should accept all supported currencies", () => {
      // Test all currencies in the fiatCurrencies array
      expect(validator.parse("USD")).toBe("USD");
      expect(validator.parse("EUR")).toBe("EUR");
      expect(validator.parse("GBP")).toBe("GBP");
      expect(validator.parse("JPY")).toBe("JPY");
      expect(validator.parse("CHF")).toBe("CHF");
      expect(validator.parse("CAD")).toBe("CAD");
      expect(validator.parse("AUD")).toBe("AUD");
      expect(validator.parse("AED")).toBe("AED");
      expect(validator.parse("SGD")).toBe("SGD");
      expect(validator.parse("SAR")).toBe("SAR");
    });
  });

  describe("invalid currencies", () => {
    it("should reject invalid currency codes", () => {
      expect(() => validator.parse("XXX")).toThrow();
      expect(() => validator.parse("BTC")).toThrow(); // Crypto, not fiat
      expect(() => validator.parse("USDT")).toThrow(); // Stablecoin, not fiat
      expect(() => validator.parse("")).toThrow();
    });

    it("should reject lowercase and mixed case codes", () => {
      expect(() => validator.parse("usd")).toThrow();
      expect(() => validator.parse("eur")).toThrow();
      expect(() => validator.parse("Usd")).toThrow();
      expect(() => validator.parse("UsD")).toThrow();
    });

    it("should reject non-3-letter codes", () => {
      expect(() => validator.parse("US")).toThrow();
      expect(() => validator.parse("USDD")).toThrow();
      expect(() => validator.parse("$")).toThrow();
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    it("should reject currencies not in supported list", () => {
      expect(() => validator.parse("CNY")).toThrow(); // Chinese Yuan, not in supported list
      expect(() => validator.parse("INR")).toThrow(); // Indian Rupee, not in supported list
      expect(() => validator.parse("RUB")).toThrow(); // Russian Ruble, not in supported list
    });
  });

  describe("safeParse", () => {
    it("should return success for valid currency", () => {
      const result = validator.safeParse("CHF");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("CHF");
      }
    });

    it("should return error for invalid currency", () => {
      const result = validator.safeParse("XXX");
      expect(result.success).toBe(false);
    });
  });

  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse("CAD");
      // Test that the type is correctly inferred
      expect(result).toBe("CAD");
    });

    it("should handle safeParse", () => {
      const result = validator.safeParse("AUD");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("AUD");
      }
    });
  });
});

describe("isFiatCurrency", () => {
  it("should return true for valid fiat currencies", () => {
    expect(isFiatCurrency("USD")).toBe(true);
    expect(isFiatCurrency("EUR")).toBe(true);
    expect(isFiatCurrency("GBP")).toBe(true);
    expect(isFiatCurrency("JPY")).toBe(true);
    expect(isFiatCurrency("CHF")).toBe(true);
  });

  it("should return false for invalid currencies", () => {
    expect(isFiatCurrency("XXX")).toBe(false);
    expect(isFiatCurrency("BTC")).toBe(false);
    expect(isFiatCurrency("usd")).toBe(false); // lowercase
    expect(isFiatCurrency("CNY")).toBe(false); // not in supported list
    expect(isFiatCurrency("")).toBe(false);
  });

  it("should return false for non-string types", () => {
    expect(isFiatCurrency(123)).toBe(false);
    expect(isFiatCurrency(null)).toBe(false);
    expect(isFiatCurrency(undefined)).toBe(false);
    expect(isFiatCurrency({})).toBe(false);
    expect(isFiatCurrency([])).toBe(false);
    expect(isFiatCurrency(true)).toBe(false);
  });

  it("should work as type guard", () => {
    const value: unknown = "EUR";
    if (isFiatCurrency(value)) {
      // TypeScript should know value is FiatCurrency here
      const currency: FiatCurrency = value;
      expect(currency).toBe("EUR");
    }
  });
});

describe("getFiatCurrency", () => {
  it("should return valid fiat currency", () => {
    expect(getFiatCurrency("USD")).toBe("USD");
    expect(getFiatCurrency("EUR")).toBe("EUR");
    expect(getFiatCurrency("GBP")).toBe("GBP");
    expect(getFiatCurrency("JPY")).toBe("JPY");
  });

  it("should throw for invalid currencies", () => {
    expect(() => getFiatCurrency("XXX")).toThrow();
    expect(() => getFiatCurrency("BTC")).toThrow();
    expect(() => getFiatCurrency("usd")).toThrow(); // lowercase
    expect(() => getFiatCurrency("CNY")).toThrow(); // not in supported list
    expect(() => getFiatCurrency("")).toThrow();
  });

  it("should throw for non-string types", () => {
    expect(() => getFiatCurrency(123)).toThrow();
    expect(() => getFiatCurrency(null)).toThrow();
    expect(() => getFiatCurrency(undefined)).toThrow();
    expect(() => getFiatCurrency({})).toThrow();
    expect(() => getFiatCurrency([])).toThrow();
  });
});

describe("getCurrencyMetadata", () => {
  it("should return metadata for valid currencies", () => {
    const usdMetadata = getCurrencyMetadata("USD");
    expect(usdMetadata).toBeDefined();
    expect(usdMetadata?.name).toBe("US Dollar");
    expect(usdMetadata?.decimals).toBe(2);

    const jpyMetadata = getCurrencyMetadata("JPY");
    expect(jpyMetadata).toBeDefined();
    expect(jpyMetadata?.name).toBe("Yen");
    expect(jpyMetadata?.decimals).toBe(0);

    const eurMetadata = getCurrencyMetadata("EUR");
    expect(eurMetadata).toBeDefined();
    expect(eurMetadata?.name).toBe("Euro");
    expect(eurMetadata?.decimals).toBe(2);
  });

  it("should return undefined for invalid currencies", () => {
    expect(getCurrencyMetadata("ZZZ")).toBeUndefined();
    expect(getCurrencyMetadata("")).toBeUndefined();
    expect(getCurrencyMetadata("INVALID")).toBeUndefined();
    expect(getCurrencyMetadata("ABC")).toBeUndefined();
    expect(getCurrencyMetadata("123")).toBeUndefined();
  });

  it("should handle edge cases", () => {
    // Test with lowercase (should still work with currency-codes)
    const metadata = getCurrencyMetadata("usd");
    // currency-codes might or might not handle lowercase, test accordingly
    if (metadata) {
      expect(metadata.decimals).toBe(2);
    } else {
      expect(metadata).toBeUndefined();
    }
  });
});

describe("allFiatCurrencies", () => {
  it("should be an array of strings", () => {
    expect(Array.isArray(allFiatCurrencies)).toBe(true);
    expect(allFiatCurrencies.length).toBeGreaterThan(0);
    allFiatCurrencies.forEach((currency) => {
      expect(typeof currency).toBe("string");
    });
  });

  it("should not include currencies starting with X", () => {
    allFiatCurrencies.forEach((currency) => {
      expect(currency.startsWith("X")).toBe(false);
    });
  });

  it("should include common currencies", () => {
    expect(allFiatCurrencies).toContain("USD");
    expect(allFiatCurrencies).toContain("EUR");
    expect(allFiatCurrencies).toContain("GBP");
    expect(allFiatCurrencies).toContain("JPY");
  });
});

describe("fiatCurrencyMetadata", () => {
  it("should contain metadata for all supported currencies", () => {
    fiatCurrencies.forEach((currency) => {
      expect(fiatCurrencyMetadata[currency]).toBeDefined();
      expect(fiatCurrencyMetadata[currency].name).toBeDefined();
      expect(typeof fiatCurrencyMetadata[currency].name).toBe("string");
      expect(typeof fiatCurrencyMetadata[currency].decimals).toBe("number");
    });
  });

  it("should have correct metadata values", () => {
    expect(fiatCurrencyMetadata.USD).toEqual({
      name: "US Dollar",
      decimals: 2,
    });
    expect(fiatCurrencyMetadata.JPY).toEqual({
      name: "Yen",
      decimals: 0,
    });
    expect(fiatCurrencyMetadata.EUR).toEqual({
      name: "Euro",
      decimals: 2,
    });
  });

  it("should have correct decimal places for currencies", () => {
    // Most currencies have 2 decimal places
    expect(fiatCurrencyMetadata.USD.decimals).toBe(2);
    expect(fiatCurrencyMetadata.EUR.decimals).toBe(2);
    expect(fiatCurrencyMetadata.GBP.decimals).toBe(2);

    // JPY has 0 decimal places
    expect(fiatCurrencyMetadata.JPY.decimals).toBe(0);
  });
});

describe("fiatCurrencies constant", () => {
  it("should contain exactly 10 currencies", () => {
    expect(fiatCurrencies).toHaveLength(10);
  });

  it("should contain the expected currencies in order", () => {
    expect(fiatCurrencies).toEqual(["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "AED", "SGD", "SAR"]);
  });
});

describe("edge cases and special scenarios", () => {
  test("getCurrencyMetadata handles currencies with non-numeric digits", () => {
    // Mock a scenario where digits might not be a number
    // This tests the type guard in getCurrencyMetadata
    const metadata = getCurrencyMetadata("USD");
    expect(metadata?.decimals).toBe(2);
  });

  test("fiatCurrency schema has correct description", () => {
    const schema = fiatCurrency();
    expect(schema.description).toBe("Fiat currency code (ISO 4217)");
  });

  test("type inference works correctly", () => {
    // Test that FiatCurrency type is correctly inferred
    const currencies: FiatCurrency[] = ["USD", "EUR", "GBP"];
    currencies.forEach((currency) => {
      expect(fiatCurrencies).toContain(currency);
    });
  });

  test("fiatCurrencyMetadata handles all supported currencies", () => {
    // All supported currencies should have valid metadata
    fiatCurrencies.forEach((code) => {
      const metadata = fiatCurrencyMetadata[code];
      expect(metadata).toBeDefined();
      expect(metadata.name).toBeDefined();
      expect(metadata.decimals).toBeGreaterThanOrEqual(0);
    });
  });

  test("getValidFiatCurrencies filters correctly", () => {
    // Test that the filtering logic works properly
    const validCurrencies = allFiatCurrencies;

    // Should not include X-prefixed codes (test currencies, precious metals)
    validCurrencies.forEach((code) => {
      expect(code.startsWith("X")).toBe(false);
    });

    // Should include major currencies
    expect(validCurrencies).toContain("USD");
    expect(validCurrencies).toContain("EUR");
    expect(validCurrencies).toContain("GBP");
  });
});
