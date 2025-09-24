import { bigDecimal } from "@atk/zod/bigdecimal";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Schema for yield coverage input parameters
 */
export const StatsYieldCoverageInputSchema = z.object({
  /** The bond token address for which to fetch yield coverage data */
  tokenAddress: ethereumAddress.describe("The bond token contract address"),
});

/**
 * Schema for yield coverage output
 * Contains coverage percentage and schedule status information
 */
export const StatsYieldCoverageOutputSchema = z.object({
  /**
   * Yield coverage percentage showing how much of unclaimed yield
   * is covered by the underlying denomination asset balance
   */
  yieldCoverage: z.number(),

  /** Whether the bond has a yield schedule configured */
  hasYieldSchedule: z.boolean(),

  /** Whether the yield schedule is currently active (between start and end dates) */
  isRunning: z.boolean(),

  /** Total unclaimed yield amount that needs coverage */
  totalUnclaimedYield: bigDecimal(),

  /** Available denomination asset balance for yield coverage */
  denominationAssetBalance: bigDecimal(),
});

/**
 * Type definition for yield coverage input
 */
export type StatsYieldCoverageInput = z.infer<
  typeof StatsYieldCoverageInputSchema
>;

/**
 * Type definition for yield coverage output
 */
export type StatsYieldCoverageOutput = z.infer<
  typeof StatsYieldCoverageOutputSchema
>;
