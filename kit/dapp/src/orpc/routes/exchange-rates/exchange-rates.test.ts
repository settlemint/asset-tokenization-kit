/**
 * Exchange Rates Tests
 *
 * Unit tests for exchange rates schemas and validation.
 * @module ExchangeRatesTests
 */
import { safeParse } from "@/lib/zod";
import { describe, expect, it, mock } from "bun:test";
import { ExchangeRatesReadSchema } from "./routes/exchange-rates.read.schema";
import { ExchangeRatesUpdateSchema } from "./routes/exchange-rates.update.schema";
import { ExchangeRatesDeleteSchema } from "./routes/exchange-rates.delete.schema";
import { ExchangeRatesHistorySchema } from "./routes/exchange-rates.history.schema";
import { ExchangeRatesListSchema } from "./routes/exchange-rates.list.schema";
import { ExchangeRatesSyncSchema } from "./routes/exchange-rates.sync.schema";
import { exchangeRateApiResponseSchema } from "./schemas";
import {
  insertCurrencySchema,
  currencyDataSchema,
} from "@/lib/db/schemas/exchange-rates";

// Mock the logger to avoid console output during tests
mock.module("@settlemint/sdk-utils/logging", () => ({
  createLogger: () => ({
    error: mock(() => undefined),
    warn: mock(() => undefined),
    info: mock(() => undefined),
    debug: mock(() => undefined),
  }),
}));

describe("Exchange Rates Schemas", () => {
  describe("Read Schema", () => {
    it("should validate read schema correctly", () => {
      const validInput = {
        baseCurrency: "USD" as const,
        quoteCurrency: "EUR" as const,
      };
      const result = safeParse(ExchangeRatesReadSchema, validInput);
      expect(result).toEqual(validInput);
    });

    it("should reject invalid currency codes", () => {
      const invalidInput = {
        baseCurrency: "INVALID",
        quoteCurrency: "EUR",
      };
      expect(() => safeParse(ExchangeRatesReadSchema, invalidInput)).toThrow();
    });

    it("should validate update schema with manual rate", () => {
      const validInput = {
        baseCurrency: "USD" as const,
        quoteCurrency: "EUR" as const,
        rate: 0.85,
      };
      const result = safeParse(ExchangeRatesUpdateSchema, validInput);
      expect(result.baseCurrency).toBe("USD");
      expect(result.quoteCurrency).toBe("EUR");
      expect(result.rate).toBe(0.85);
    });

    it("should validate update schema", () => {
      const validInput = {
        baseCurrency: "USD" as const,
        quoteCurrency: "EUR" as const,
        rate: 0.86,
      };
      const result = safeParse(ExchangeRatesUpdateSchema, validInput);
      expect(result.rate).toBe(0.86);
    });

    it("should validate delete schema", () => {
      const validInput = {
        baseCurrency: "USD" as const,
        quoteCurrency: "EUR" as const,
      };
      const result = safeParse(ExchangeRatesDeleteSchema, validInput);
      expect(result).toEqual(validInput);
    });

    it("should validate API response schema", () => {
      const validResponse = {
        result: "success",
        provider: "er-api.com",
        documentation: "https://www.exchangerate-api.com",
        terms_of_use: "https://www.exchangerate-api.com/terms",
        time_last_update_unix: 1735776000,
        time_last_update_utc: "Thu, 02 Jan 2025 00:00:00 +0000",
        time_next_update_unix: 1735862400,
        time_next_update_utc: "Fri, 03 Jan 2025 00:00:00 +0000",
        time_eol_unix: 0,
        base_code: "USD",
        rates: {
          USD: 1,
          EUR: 0.85,
          GBP: 0.73,
          JPY: 110.5,
        },
      };
      const result = safeParse(exchangeRateApiResponseSchema, validResponse);
      expect(result.result).toBe("success");
      expect(result.rates.EUR).toBe(0.85);
    });
  });

  describe("History Schema", () => {
    it("should validate history query parameters", () => {
      const validInput = {
        baseCurrency: "USD",
        quoteCurrency: "EUR",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-31"),
        limit: 100,
      };
      const result = safeParse(ExchangeRatesHistorySchema, validInput);
      expect(result.baseCurrency).toBe("USD");
      expect(result.quoteCurrency).toBe("EUR");
      expect(result.limit).toBe(100);
    });

    it("should apply default limit", () => {
      const validInput = {
        baseCurrency: "USD",
        quoteCurrency: "EUR",
      };
      const result = safeParse(ExchangeRatesHistorySchema, validInput);
      expect(result.limit).toBe(100);
    });
  });

  describe("List Schema", () => {
    it("should validate list parameters with filters", () => {
      const validInput = {
        offset: 0,
        limit: 20,
        baseCurrency: "USD",
        quoteCurrency: "EUR",
      };
      const result = safeParse(ExchangeRatesListSchema, validInput);
      expect(result.offset).toBe(0);
      expect(result.limit).toBe(20);
      expect(result.baseCurrency).toBe("USD");
      expect(result.orderDirection).toBe("asc"); // default
      expect(result.orderBy).toBe("id"); // default
    });

    it("should work without optional filters", () => {
      const validInput = {
        offset: 20,
        limit: 50,
      };
      const result = safeParse(ExchangeRatesListSchema, validInput);
      expect(result.offset).toBe(20);
      expect(result.limit).toBe(50);
      expect(result.baseCurrency).toBeUndefined();
    });

    it("should apply defaults when no params provided", () => {
      const validInput = {};
      const result = safeParse(ExchangeRatesListSchema, validInput);
      expect(result.offset).toBe(0);
      expect(result.limit).toBeUndefined();
      expect(result.orderDirection).toBe("asc");
      expect(result.orderBy).toBe("id");
    });
  });

  describe("Sync Schema", () => {
    it("should validate sync parameters", () => {
      const validInput = {
        force: true,
      };
      const result = safeParse(ExchangeRatesSyncSchema, validInput);
      expect(result.force).toBe(true);
    });

    it("should apply defaults", () => {
      const validInput = {};
      const result = safeParse(ExchangeRatesSyncSchema, validInput);
      expect(result.force).toBe(false);
    });
  });

  describe("Currency Validation", () => {
    it("should validate all supported fiat currencies", () => {
      const supportedCurrencies = [
        "USD",
        "EUR",
        "GBP",
        "JPY",
        "CHF",
        "CAD",
        "AUD",
        "AED",
        "SGD",
        "SAR",
      ] as const;

      for (const currency of supportedCurrencies) {
        const input = {
          baseCurrency: currency,
          quoteCurrency: "USD",
        };
        const result = safeParse(ExchangeRatesReadSchema, input);
        expect(result.baseCurrency).toBe(currency);
      }
    });

    it("should reject unsupported currencies", () => {
      const unsupportedCurrencies = ["XYZ", "ABC", "123", "BTC", "ETH"];

      for (const currency of unsupportedCurrencies) {
        const input = {
          baseCurrency: currency,
          quoteCurrency: "USD",
        };
        expect(() => safeParse(ExchangeRatesReadSchema, input)).toThrow();
      }
    });
  });

  describe("Currency Decimals Validation", () => {
    it("should accept valid decimal values (0-8)", () => {
      for (let i = 0; i <= 8; i++) {
        const result = currencyDataSchema.safeParse({
          code: "USD",
          name: "US Dollar",
          decimals: i.toString(),
        });
        expect(result.success).toBe(true);
      }
    });

    it("should reject decimal values outside 0-8 range", () => {
      const invalidValues = ["9", "10", "99", "-1", "a", ""];

      for (const value of invalidValues) {
        const result = currencyDataSchema.safeParse({
          code: "USD",
          name: "US Dollar",
          decimals: value,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe(
            "Decimals must be between 0 and 8"
          );
        }
      }
    });

    it("should make decimals optional with default value", () => {
      const result = insertCurrencySchema.safeParse({
        code: "USD",
        name: "US Dollar",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Rate Precision", () => {
    it("should handle high-precision decimal rates", () => {
      const input = {
        baseCurrency: "USD",
        quoteCurrency: "EUR",
        rate: 0.12345678901234,
      };
      const result = safeParse(ExchangeRatesUpdateSchema, input);
      expect(result.rate).toBe(0.12345678901234);
    });

    it("should handle very large rates", () => {
      const input = {
        baseCurrency: "USD",
        quoteCurrency: "JPY",
        rate: 150.123456789,
      };
      const result = safeParse(ExchangeRatesUpdateSchema, input);
      expect(result.rate).toBe(150.123456789);
    });

    it("should reject negative rates", () => {
      const input = {
        baseCurrency: "USD",
        quoteCurrency: "EUR",
        rate: -0.85,
      };
      expect(() => safeParse(ExchangeRatesUpdateSchema, input)).toThrow();
    });

    it("should reject zero rates", () => {
      const input = {
        baseCurrency: "USD",
        quoteCurrency: "EUR",
        rate: 0,
      };
      expect(() => safeParse(ExchangeRatesUpdateSchema, input)).toThrow();
    });
  });
});
