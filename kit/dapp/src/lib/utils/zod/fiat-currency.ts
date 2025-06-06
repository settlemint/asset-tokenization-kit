import { z } from "zod/v4";

export const fiatCurrencies = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CHF",
  "CAD",
  "AUD",
] as const;

export const fiatCurrency = () =>
  z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(z.enum(fiatCurrencies))
    .describe("Fiat currency code")
    .brand<"FiatCurrency">();

export type FiatCurrency = z.infer<ReturnType<typeof fiatCurrency>>;

/**
 * Type guard to check if a value is a valid fiat currency
 * @param value - The value to check
 * @returns true if the value is a valid fiat currency
 */
export function isFiatCurrency(value: unknown): value is FiatCurrency {
  return fiatCurrency().safeParse(value).success;
}

/**
 * Safely parse and return a fiat currency or throw an error
 * @param value - The value to parse
 * @returns The fiat currency if valid, throws when not
 */
export function getFiatCurrency(value: unknown): FiatCurrency {
  const result = fiatCurrency().safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid fiat currency: ${value}`);
  }
  return result.data;
}
