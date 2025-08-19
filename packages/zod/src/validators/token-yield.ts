/**
 * Yield Schedule Validation Utilities
 *
 * This module provides comprehensive Zod schemas for validating yield schedule
 * data structures from TheGraph, ensuring type safety and proper data transformation
 * for yield-bearing tokens in the asset tokenization platform.
 * @module YieldScheduleValidation
 */

import { z } from "zod";
import { bigDecimal } from "./bigdecimal";
import { ethereumAddress } from "./ethereum-address";
import { ethereumHash } from "./ethereum-hash";
import { ethereumHex } from "./ethereum-hex";
import { timestamp } from "./timestamp";

/**
 * Creates a Zod schema for validating token fixed yield schedule period data.
 * @remarks
 * This schema validates individual period data within a yield schedule, including:
 * - Period timing (start/end dates)
 * - Yield amounts (claimed, unclaimed, total)
 * - Transaction hash reference
 *
 * All amounts are validated as BigDecimal for precise calculations.
 * @returns A Zod schema for yield schedule period validation
 * @example
 * ```typescript
 * const period = tokenFixedYieldSchedulePeriod().parse({
 *   id: "0x123...",
 *   startDate: "1680354000",
 *   endDate: "1683032400",
 *   totalClaimed: "1000.0",
 *   totalUnclaimedYield: "500.0",
 *   totalYield: "1500.0",
 *   deployedInTransaction: "0xabc..."
 * });
 * ```
 */
export const tokenFixedYieldSchedulePeriod = () =>
  z.object({
    id: ethereumHex.describe("Unique identifier for the yield period (composite hex ID from subgraph)"),
    startDate: timestamp().describe("Unix timestamp when period starts"),
    endDate: timestamp().describe("Unix timestamp when period ends"),
    totalClaimed: bigDecimal().describe("Total yield claimed in this period"),
    totalUnclaimedYield: bigDecimal().describe("Total unclaimed yield in this period"),
    totalYield: bigDecimal().describe("Total yield generated in this period"),
    deployedInTransaction: ethereumHash.describe("Transaction hash where this period was created"),
  });

/**
 * Creates a Zod schema for validating token fixed yield schedule data.
 * @remarks
 * This schema validates comprehensive yield schedule configuration including:
 * - Schedule metadata (id, creation info)
 * - Timing configuration (start/end dates, intervals)
 * - Rate configuration (yield rate in basis points)
 * - Amount tracking (claimed, unclaimed, total yield)
 * - Asset references (token, denomination asset)
 * - Period management (current, next, all periods)
 *
 * All amounts use BigDecimal for precision, timestamps for dates,
 * and Ethereum addresses for contract references.
 * @returns A Zod schema for yield schedule validation
 * @example
 * ```typescript
 * const schedule = tokenFixedYieldSchedule().parse({
 *   id: "0x123...",
 *   createdAt: "1680354000",
 *   createdBy: { id: "0xabc...", isContract: false },
 *   token: { id: "0xdef..." },
 *   startDate: "1680354000",
 *   endDate: "1711890000",
 *   rate: "500", // 5% in basis points
 *   interval: "2592000", // 30 days in seconds
 *   denominationAsset: { id: "0x456...", symbol: "USDC", decimals: 6 },
 *   // ... other fields
 * });
 * ```
 */
export const tokenFixedYieldSchedule = () =>
  z.object({
    id: ethereumAddress.describe("Yield schedule contract address"),
    createdAt: timestamp().describe("Unix timestamp when schedule was created"),
    createdBy: z.object({
      id: ethereumAddress.describe("Address of schedule creator"),
      isContract: z.boolean().describe("Whether creator is a contract"),
    }),
    account: z.object({
      id: ethereumAddress.describe("Schedule contract account address"),
      isContract: z.boolean().describe("Whether account is a contract"),
    }),
    token: z.object({
      id: ethereumAddress.describe("Token contract address"),
    }),
    startDate: timestamp().describe("Unix timestamp when yield starts"),
    endDate: timestamp().describe("Unix timestamp when yield ends"),
    rate: z.string().describe("Yield rate in basis points"),
    interval: z.string().describe("Payment interval in seconds"),
    totalClaimed: bigDecimal().describe("Total yield claimed"),
    totalUnclaimedYield: bigDecimal().describe("Total unclaimed yield"),
    totalYield: bigDecimal().describe("Total yield generated"),
    denominationAsset: z.object({
      id: ethereumAddress.describe("Denomination token contract address"),
      symbol: z.string().describe("Denomination token symbol"),
      decimals: z.number().describe("Denomination token decimals"),
    }),
    currentPeriod: tokenFixedYieldSchedulePeriod().nullable().describe("Current active yield period"),
    nextPeriod: tokenFixedYieldSchedulePeriod().nullable().describe("Next scheduled yield period"),
    periods: z.array(tokenFixedYieldSchedulePeriod()).describe("Array of all yield periods"),
    deployedInTransaction: ethereumHash.describe("Transaction hash where schedule was deployed"),
  });

/**
 * Creates a Zod schema for validating token yield data.
 * @remarks
 * This schema serves as a wrapper for yield configuration, primarily containing
 * a reference to the associated fixed yield schedule. It follows the subgraph
 * schema structure where TokenYield contains a schedule field.
 * @returns A Zod schema for token yield validation
 * @example
 * ```typescript
 * const yield = tokenYield().parse({
 *   id: "0x123...",
 *   schedule: {
 *     id: "0x456...",
 *     // ... full schedule data
 *   }
 * });
 * ```
 */
export const tokenYield = () =>
  z.object({
    id: ethereumAddress.describe("Token yield configuration address"),
    schedule: tokenFixedYieldSchedule().nullable().describe("Fixed yield schedule configuration"),
  });

// Export types
/**
 * Type representing a validated token fixed yield schedule period.
 * Ensures type safety and proper data structure.
 */
export type TokenFixedYieldSchedulePeriod = z.infer<ReturnType<typeof tokenFixedYieldSchedulePeriod>>;

/**
 * Type representing a validated token fixed yield schedule.
 * Ensures type safety and proper data structure.
 */
export type TokenFixedYieldSchedule = z.infer<ReturnType<typeof tokenFixedYieldSchedule>>;

/**
 * Type representing a validated token yield configuration.
 * Ensures type safety and proper data structure.
 */
export type TokenYield = z.infer<ReturnType<typeof tokenYield>>;

/**
 * Type guard function to check if a value is a valid token yield.
 * @param value - The value to check
 * @returns true if the value is a valid token yield
 * @example
 * ```typescript
 * const data: unknown = apiResponse.yield;
 * if (isTokenYield(data)) {
 *   // TypeScript knows data is TokenYield
 *   console.log(`Yield rate: ${data.schedule.rate}`);
 * }
 * ```
 */
export function isTokenYield(value: unknown): value is TokenYield {
  return tokenYield().safeParse(value).success;
}

/**
 * Safely parse and validate token yield data.
 * @param value - The value to parse as token yield
 * @returns The validated token yield data
 * @throws {Error} If the value cannot be parsed as valid token yield
 * @example
 * ```typescript
 * try {
 *   const yieldData = getTokenYield(graphqlResponse.yield_);
 *   console.log(`Total yield: ${yieldData.schedule.totalYield}`);
 * } catch (error) {
 *   console.error("Invalid yield data:", error.message);
 * }
 * ```
 */
export function getTokenYield(value: unknown): TokenYield {
  return tokenYield().parse(value);
}
