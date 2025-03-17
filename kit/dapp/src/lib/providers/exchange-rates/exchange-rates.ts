import { db } from "@/lib/db";
import { exchangeRate } from "@/lib/db/schema-asset-tokenization";
import { eq } from "drizzle-orm";
import { XMLParser } from "fast-xml-parser";

const FiatCurrencies = [
  "EUR", // Base currency for ECB
  "USD",
  "JPY",
  "GBP",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "HKD",
  "NZD",
  "SEK",
  "KRW",
  "SGD",
  "NOK",
  "MXN",
  "INR",
  "ZAR",
  "TRY",
  "BRL",
] as const;

export type Currency = (typeof FiatCurrencies)[number];

interface ECBRate {
  currency: string;
  rate: number;
}

/**
 * Fetches exchange rates from the European Central Bank
 */
async function fetchECBRates(): Promise<ECBRate[]> {
  try {
    const response = await fetch(
      "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml"
    );
    const xmlText = await response.text();

    // Parse the XML response
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });
    const result = parser.parse(xmlText);

    // Navigate through the XML structure to get to the rates
    const ratesList = result["gesmes:Envelope"]?.Cube?.Cube?.Cube || [];

    // Convert to our internal format
    const rates: ECBRate[] = Array.isArray(ratesList)
      ? ratesList.map((item) => ({
          currency: item.currency,
          rate: Number(item.rate),
        }))
      : [];

    if (rates.length === 0) {
      throw new Error("No rates found in ECB response");
    }

    return rates;
  } catch (error) {
    console.error("Error fetching ECB rates:", error);
    throw error;
  }
}

/**
 * Calculate cross rates for all currency pairs
 */
function calculateCrossRates(ecbRates: ECBRate[]): Map<string, number> {
  const ratesMap = new Map<string, number>();

  // First, create a map of EUR rates
  const eurRates = new Map<string, number>();
  eurRates.set("EUR", 1); // Base currency
  for (const { currency, rate } of ecbRates) {
    eurRates.set(currency, rate);
  }

  // Calculate cross rates for all currency pairs
  for (const baseCurrency of FiatCurrencies) {
    for (const quoteCurrency of FiatCurrencies) {
      if (baseCurrency === quoteCurrency) continue;

      const baseRate = eurRates.get(baseCurrency) || 0;
      const quoteRate = eurRates.get(quoteCurrency) || 0;

      if (baseRate && quoteRate) {
        // Calculate cross rate: base/quote = (base/eur) / (quote/eur)
        const crossRate = quoteRate / baseRate;
        ratesMap.set(`${baseCurrency}${quoteCurrency}`, crossRate);
      }
    }
  }

  return ratesMap;
}

/**
 * Updates exchange rates for all currency pairs in the database
 */
export async function updateExchangeRates() {
  try {
    // Fetch rates from ECB
    const ecbRates = await fetchECBRates();

    // Calculate all cross rates
    const ratesMap = calculateCrossRates(ecbRates);

    // Update database
    for (const baseCurrency of FiatCurrencies) {
      for (const quoteCurrency of FiatCurrencies) {
        if (baseCurrency === quoteCurrency) continue;

        const rate = ratesMap.get(`${baseCurrency}${quoteCurrency}`);
        if (!rate) {
          console.warn(`No rate found for ${baseCurrency}/${quoteCurrency}`);
          continue;
        }

        // Check if rate already exists
        const existingRate = await db.query.exchangeRate.findFirst({
          where:
            eq(exchangeRate.baseCurrency, baseCurrency) &&
            eq(exchangeRate.quoteCurrency, quoteCurrency),
        });

        if (existingRate) {
          // Update existing rate
          await db
            .update(exchangeRate)
            .set({
              rate: rate.toString(),
              lastUpdated: new Date(),
            })
            .where(eq(exchangeRate.id, existingRate.id));
        } else {
          // Insert new rate
          await db.insert(exchangeRate).values({
            baseCurrency,
            quoteCurrency,
            rate: rate.toString(),
            lastUpdated: new Date(),
          });
        }
      }
    }

    console.log("Exchange rates updated successfully");
  } catch (error) {
    console.error("Error updating exchange rates:", error);
    throw error;
  }
}

/**
 * Gets the current exchange rate for a currency pair
 */
export async function getExchangeRate(
  baseCurrency: string,
  quoteCurrency: string
): Promise<number | null> {
  const rate = await db.query.exchangeRate.findFirst({
    where:
      eq(exchangeRate.baseCurrency, baseCurrency) &&
      eq(exchangeRate.quoteCurrency, quoteCurrency),
  });

  return rate ? Number.parseFloat(rate.rate.toString()) : null;
}

/**
 * Gets all stored exchange rates
 */
export async function getAllExchangeRates() {
  return await db.query.exchangeRate.findMany({
    orderBy: (exchangeRate, { asc }) => [
      asc(exchangeRate.baseCurrency),
      asc(exchangeRate.quoteCurrency),
    ],
  });
}
