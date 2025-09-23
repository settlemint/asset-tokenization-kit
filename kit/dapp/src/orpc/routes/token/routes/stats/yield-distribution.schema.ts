import { ethereumAddress } from "@atk/zod/ethereum-address";
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
  /**
   * Unique identifier for this period (schedule address + period index).
   * Used for React keys and data tracking across re-renders.
   */
  id: z.string(),

  /**
   * Period start time as Unix timestamp in milliseconds.
   * Converted to milliseconds for JavaScript Date compatibility and chart libraries.
   */
  timestamp: z.number(),

  /**
   * Total yield amount generated for this specific period.
   * Represented as a decimal number for direct use in UI components.
   */
  totalYield: z.number(),

  /**
   * Amount of yield claimed by token holders during this period.
   * Always less than or equal to totalYield.
   */
  claimed: z.number(),

  /**
   * Remaining unclaimed yield available for this period.
   * Calculated as totalYield - claimed.
   */
  unclaimed: z.number(),
});

/**
 * Response schema for the yield distribution API endpoint.
 *
 * Provides both detailed period-by-period data and aggregate totals.
 * The dual format (periods as decimals, totals as [bigint, number] tuples)
 * serves different use cases:
 * - Periods: Optimized for chart rendering and UI display
 * - Totals: Preserve precision for financial calculations and contract interactions
 */
export const StatsYieldDistributionOutputSchema = z.object({
  /**
   * Time-ordered array of yield distribution periods.
   * Sorted chronologically to support chart libraries that expect sequential data.
   */
  periods: z.array(YieldDistributionPeriodSchema),

  /**
   * Aggregate yield generated across all periods.
   * Returned as [bigint, decimals] tuple to preserve full precision
   * for financial calculations while providing decimal context.
   */
  totalYield: z.tuple([z.bigint(), z.number()]),

  /**
   * Total yield claimed by all holders across all periods.
   * Tuple format maintains precision for reconciliation with blockchain state.
   */
  totalClaimed: z.tuple([z.bigint(), z.number()]),

  /**
   * Total unclaimed yield remaining across all periods.
   * Critical for displaying available yield and triggering claim actions.
   */
  totalUnclaimed: z.tuple([z.bigint(), z.number()]),
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
