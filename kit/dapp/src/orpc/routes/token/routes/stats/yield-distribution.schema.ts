import { bigDecimal } from "@atk/zod/bigdecimal";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { timestamp } from "@atk/zod/timestamp";
import { z } from "zod";

/**
 * Input validation schema for yield distribution API endpoint.
 *
 * Ensures the token address is a valid Ethereum address format before
 * processing the request. This validation prevents unnecessary database
 * queries and provides clear error messages for malformed addresses.
 */
export const StatsYieldDistributionInputSchema = z.object({
  /**
   * The bond token contract address to fetch yield distribution data for.
   * Must be a valid Ethereum address (42 characters, starting with 0x).
   */
  tokenAddress: ethereumAddress.describe("The bond token contract address"),
});

/**
 * Schema for a single yield distribution period.
 *
 * Each period represents a discrete time interval in the bond's yield schedule.
 * Periods are created based on the bond's configured yield interval (e.g., monthly,
 * quarterly) and track yield generation and claiming activity.
 *
 * All monetary values are converted to human-readable decimal format (not wei)
 * for easier consumption by frontend components.
 */
export const YieldDistributionPeriodSchema = z.object({
  id: z.string().describe("Unique identifier for this period"),
  timestamp: timestamp().describe("Timestamp when period starts"),
  totalYield: bigDecimal().describe("Total yield generated for this period"),
  claimed: bigDecimal().describe(
    "Amount of yield claimed by token holders during this period"
  ),
  unclaimed: bigDecimal().describe(
    "Remaining unclaimed yield available for this period"
  ),
});

/**
 * Response schema for the yield distribution API endpoint.
 *
 * Provides both detailed period-by-period data and aggregate totals.
 * - Periods: Optimized for chart rendering and UI display with regular numbers
 * - Totals: Use bigDecimal to preserve precision for financial calculations
 */
export const StatsYieldDistributionOutputSchema = z.object({
  periods: z
    .array(YieldDistributionPeriodSchema)
    .describe("Array of yield distribution periods"),
  totalYield: bigDecimal().describe("Total yield generated across all periods"),
  totalClaimed: bigDecimal().describe(
    "Total yield claimed by all holders across all periods"
  ),
  totalUnclaimed: bigDecimal().describe(
    "Total unclaimed yield remaining across all periods"
  ),
});

/**
 * TypeScript type for yield distribution API input parameters.
 * Inferred from the validation schema to ensure type-schema consistency.
 */
export type StatsYieldDistributionInput = z.infer<
  typeof StatsYieldDistributionInputSchema
>;

/**
 * TypeScript type for yield distribution API response.
 * Inferred from the validation schema to maintain type safety across
 * the API boundary and enable proper IDE support.
 */
export type StatsYieldDistributionOutput = z.infer<
  typeof StatsYieldDistributionOutputSchema
>;
