import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Schema for collateral ratio input parameters
 */
export const StatsCollateralRatioInputSchema = z.object({
  /** The token address for which to fetch collateral ratio data */
  tokenAddress: ethereumAddress.describe("The token contract address"),
});

/**
 * Schema for collateral ratio bucket
 * Represents a portion of the collateral allocation
 */
export const CollateralRatioBucketSchema = z.object({
  /** The collateral type (e.g., "available", "used") */
  name: z.string(),

  /** The amount of collateral in this category */
  value: z.number(),
});

/**
 * Schema for collateral ratio output
 * Contains collateral distribution showing available vs used collateral
 */
export const StatsCollateralRatioOutputSchema = z.object({
  /** Array of collateral buckets showing available and used amounts */
  buckets: z.array(CollateralRatioBucketSchema),

  /** Total collateral amount */
  totalCollateral: z.number(),

  /** Collateral ratio percentage (used/total * 100) */
  collateralRatio: z.number(),
});

/**
 * Type definition for collateral ratio input
 */
export type StatsCollateralRatioInput = z.infer<
  typeof StatsCollateralRatioInputSchema
>;

/**
 * Type definition for collateral ratio output
 */
export type StatsCollateralRatioOutput = z.infer<
  typeof StatsCollateralRatioOutputSchema
>;
