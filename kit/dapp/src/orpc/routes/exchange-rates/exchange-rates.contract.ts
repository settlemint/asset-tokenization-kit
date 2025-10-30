/**
 * Exchange Rates API Contract
 *
 * This module defines the API contracts for exchange rate management,
 * including CRUD operations and synchronization with external providers.
 * @module ExchangeRatesContract
 */
import { baseContract } from "@/orpc/procedures/base.contract";
import { z } from "zod";
import { ExchangeRatesDeleteSchema } from "./routes/exchange-rates.delete.schema";
import { ExchangeRatesHistorySchema } from "./routes/exchange-rates.history.schema";
import {
  ExchangeRatesListOutputSchema,
  ExchangeRatesListSchema,
} from "./routes/exchange-rates.list.schema";
import { ExchangeRatesReadSchema } from "./routes/exchange-rates.read.schema";
import { ExchangeRatesSyncSchema } from "./routes/exchange-rates.sync.schema";
import { ExchangeRatesUpdateSchema } from "./routes/exchange-rates.update.schema";

/**
 * Contract for reading the current exchange rate between two currencies.
 * Automatically triggers sync if no rates exist.
 */
const read = baseContract
  .route({
    method: "GET",
    path: "/exchange-rates/:baseCurrency/:quoteCurrency",
    description: "Get the current exchange rate between two currencies",
    successDescription: "Exchange rate retrieved successfully",
    tags: ["exchange-rates"],
  })
  .input(ExchangeRatesReadSchema)
  .output(
    z
      .object({
        baseCurrency: z.string(),
        quoteCurrency: z.string(),
        rate: z.number(),
        effectiveAt: z.date(),
      })
      .nullable()
  );

/**
 * Contract for listing all available exchange rates.
 * Supports filtering by base currency and pagination.
 */
const list = baseContract
  .route({
    method: "GET",
    path: "/exchange-rates",
    description: "List all available exchange rates with pagination",
    successDescription: "Exchange rates list retrieved successfully",
    tags: ["exchange-rates"],
  })
  .input(ExchangeRatesListSchema)
  .output(ExchangeRatesListOutputSchema);

/**
 * Contract for manually updating an exchange rate.
 * Useful for overrides or when external APIs are unavailable.
 */
const update = baseContract
  .route({
    method: "PUT",
    path: "/exchange-rates/:baseCurrency/:quoteCurrency",
    description: "Manually update an exchange rate",
    successDescription: "Exchange rate updated successfully",
    tags: ["exchange-rates"],
  })
  .input(ExchangeRatesUpdateSchema)
  .output(
    z.object({
      success: z.boolean(),
      rate: z.object({
        baseCurrency: z.string(),
        quoteCurrency: z.string(),
        rate: z.number(),
        effectiveAt: z.date(),
      }),
    })
  );

/**
 * Contract for deleting a manual exchange rate.
 * Only manual rates can be deleted, not synced rates.
 */
const del = baseContract
  .route({
    method: "DELETE",
    path: "/exchange-rates/:baseCurrency/:quoteCurrency",
    description: "Delete a manual exchange rate",
    successDescription: "Exchange rate deleted successfully",
    tags: ["exchange-rates"],
  })
  .input(ExchangeRatesDeleteSchema)
  .output(z.object({ success: z.boolean() }));

/**
 * Contract for synchronizing exchange rates with external providers.
 * Fetches latest rates from configured APIs and updates the database.
 */
const sync = baseContract
  .route({
    method: "POST",
    path: "/exchange-rates/sync",
    description: "Synchronize exchange rates with external providers",
    successDescription: "Exchange rates synchronized successfully",
    tags: ["exchange-rates"],
  })
  .input(ExchangeRatesSyncSchema)
  .output(
    z.object({
      success: z.boolean(),
      ratesUpdated: z.number(),
      syncedAt: z.date(),
    })
  );

/**
 * Contract for retrieving historical exchange rates.
 * Useful for charting and historical analysis.
 */
const history = baseContract
  .route({
    method: "GET",
    path: "/exchange-rates/:baseCurrency/:quoteCurrency/history",
    description: "Get historical exchange rates for a currency pair",
    successDescription: "Historical rates retrieved successfully",
    tags: ["exchange-rates"],
  })
  .input(ExchangeRatesHistorySchema)
  .output(
    z.array(
      z.object({
        baseCurrency: z.string(),
        quoteCurrency: z.string(),
        rate: z.number(),
        effectiveAt: z.date(),
      })
    )
  );

/**
 * Exchange rates API contract collection.
 *
 * Provides comprehensive exchange rate management including:
 * - Real-time rate queries with automatic sync
 * - Manual rate updates for overrides
 * - Historical data access
 * - External provider synchronization
 */
export const exchangeRatesContract = {
  read,
  list,
  update,
  delete: del,
  sync,
  history,
};
