import { describe, expect, it } from "bun:test";
import {
  fiatCurrency,
  getFiatCurrency,
  isFiatCurrency,
  type FiatCurrency,
} from "./fiat-currency";

describe("fiatCurrency", () => {
  const validator = fiatCurrency();

  describe("valid currencies", () => {
    it("should accept common 3-letter currency codes", () => {
      expect(validator.parse("USD")).toBe(getFiatCurrency("USD"));
      expect(validator.parse("EUR")).toBe(getFiatCurrency("EUR"));
      expect(validator.parse("GBP")).toBe(getFiatCurrency("GBP"));
      expect(validator.parse("JPY")).toBe(getFiatCurrency("JPY"));

      expect(isFiatCurrency("USD")).toBe(true);
      expect(isFiatCurrency("EUR")).toBe(true);
      expect(isFiatCurrency("GBP")).toBe(true);
      expect(isFiatCurrency("JPY")).toBe(true);

      expect(getFiatCurrency("USD")).toBe(getFiatCurrency("USD"));
      expect(getFiatCurrency("EUR")).toBe(getFiatCurrency("EUR"));
      expect(getFiatCurrency("GBP")).toBe(getFiatCurrency("GBP"));
      expect(getFiatCurrency("JPY")).toBe(getFiatCurrency("JPY"));
    });

    it("should transform to uppercase", () => {
      expect(validator.parse("usd")).toBe(getFiatCurrency("USD"));
      expect(validator.parse("eur")).toBe(getFiatCurrency("EUR"));
      expect(isFiatCurrency("usd")).toBe(true);
      expect(isFiatCurrency("eur")).toBe(true);
      expect(getFiatCurrency("usd")).toBe(getFiatCurrency("USD"));
      expect(getFiatCurrency("eur")).toBe(getFiatCurrency("EUR"));
    });
  });

  describe("invalid currencies", () => {
    it("should reject invalid currency codes", () => {
      expect(() => validator.parse("XXX")).toThrow();
      expect(() => validator.parse("BTC")).toThrow(); // Crypto, not fiat
      expect(() => validator.parse("USDT")).toThrow(); // Stablecoin, not fiat
      expect(() => validator.parse("")).toThrow();

      expect(isFiatCurrency("XXX")).toBe(false);
      expect(isFiatCurrency("BTC")).toBe(false);
      expect(isFiatCurrency("USDT")).toBe(false);
      expect(isFiatCurrency("")).toBe(false);

      expect(() => getFiatCurrency("XXX")).toThrow("Invalid fiat currency");
      expect(() => getFiatCurrency("BTC")).toThrow("Invalid fiat currency");
      expect(() => getFiatCurrency("USDT")).toThrow("Invalid fiat currency");
      expect(() => getFiatCurrency("")).toThrow("Invalid fiat currency");
    });

    it("should accept and transform mixed case codes", () => {
      expect(validator.parse("usd")).toBe(getFiatCurrency("USD"));
      expect(validator.parse("eur")).toBe(getFiatCurrency("EUR"));
      expect(validator.parse("Usd")).toBe(getFiatCurrency("USD"));

      expect(isFiatCurrency("usd")).toBe(true);
      expect(isFiatCurrency("eur")).toBe(true);
      expect(isFiatCurrency("Usd")).toBe(true);

      expect(getFiatCurrency("usd")).toBe(getFiatCurrency("USD"));
      expect(getFiatCurrency("eur")).toBe(getFiatCurrency("EUR"));
      expect(getFiatCurrency("Usd")).toBe(getFiatCurrency("USD"));
    });

    it("should reject non-3-letter codes", () => {
      expect(() => validator.parse("US")).toThrow();
      expect(() => validator.parse("USDD")).toThrow();
      expect(() => validator.parse("$")).toThrow();

      expect(isFiatCurrency("US")).toBe(false);
      expect(isFiatCurrency("USDD")).toBe(false);
      expect(isFiatCurrency("$")).toBe(false);

      expect(() => getFiatCurrency("US")).toThrow("Invalid fiat currency");
      expect(() => getFiatCurrency("USDD")).toThrow("Invalid fiat currency");
      expect(() => getFiatCurrency("$")).toThrow("Invalid fiat currency");
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();

      expect(isFiatCurrency(123)).toBe(false);
      expect(isFiatCurrency(null)).toBe(false);
      expect(isFiatCurrency(undefined)).toBe(false);
      expect(isFiatCurrency({})).toBe(false);

      expect(() => getFiatCurrency(123)).toThrow("Invalid fiat currency");
      expect(() => getFiatCurrency(null)).toThrow("Invalid fiat currency");
      expect(() => getFiatCurrency(undefined)).toThrow("Invalid fiat currency");
      expect(() => getFiatCurrency({})).toThrow("Invalid fiat currency");
    });
  });

  describe("safeParse", () => {
    it("should return success for valid currency", () => {
      const result = validator.safeParse("chf");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(getFiatCurrency("CHF"));
      }
    });

    it("should return error for invalid currency", () => {
      const result = validator.safeParse("XXX");
      expect(result.success).toBe(false);
    });
  });

  describe("helper functions", () => {
    it("isFiatCurrency should work as type guard", () => {
      const value: unknown = "CAD";
      if (isFiatCurrency(value)) {
        // TypeScript should recognize value as FiatCurrency here
        const _typeCheck: FiatCurrency = value;
      }
    });

    it("getFiatCurrency should return typed value", () => {
      const result = getFiatCurrency("aud");
      // TypeScript should recognize result as FiatCurrency
      const _typeCheck: FiatCurrency = result;
      expect(result).toBe(getFiatCurrency("AUD"));
    });
  });
});
