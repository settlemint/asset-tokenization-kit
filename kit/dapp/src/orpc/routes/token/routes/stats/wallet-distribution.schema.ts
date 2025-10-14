import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";

/**
 * Schema for wallet distribution input parameters
 */
export const StatsWalletDistributionInputSchema = z.object({
  /** The token address for which to fetch wallet distribution data */
  tokenAddress: ethereumAddress.describe("The token contract address"),
});

/**
 * Schema for wallet distribution bucket
 * Represents a range of token holdings and the count of wallets in that range
 */
export const WalletDistributionBucketSchema = z.object({
  /** The range label (e.g., "0-100", "100-500") */
  range: z.string(),

  /** Number of wallets holding tokens in this range */
  count: z.number(),
});

/**
 * Schema for wallet distribution output
 * Contains distribution buckets showing how many wallets hold different amounts of tokens
 */
export const StatsWalletDistributionOutputSchema = z.object({
  /** Array of distribution buckets ordered from smallest to largest holdings */
  buckets: z.array(WalletDistributionBucketSchema),

  /** Total number of token holders */
  totalHolders: z.number(),
});

/**
 * Type definition for wallet distribution input
 */
export type StatsWalletDistributionInput = z.infer<
  typeof StatsWalletDistributionInputSchema
>;

/**
 * Type definition for wallet distribution output
 */
export type StatsWalletDistributionOutput = z.infer<
  typeof StatsWalletDistributionOutputSchema
>;
