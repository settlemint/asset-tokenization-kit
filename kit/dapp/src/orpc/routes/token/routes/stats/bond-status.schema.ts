import { bigDecimal } from "@atk/zod/bigdecimal";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Input schema for bond status statistics
 */
export const StatsBondStatusInputSchema = z.object({
  tokenAddress: ethereumAddress.describe(
    "The token contract address to get bond status for"
  ),
});

/**
 * Output schema for bond status statistics
 * Contains current bond status and denomination asset information
 */
export const StatsBondStatusOutputSchema = z.object({
  denominationAssetBalanceAvailable: bigDecimal().describe(
    "Current available denomination asset balance for redemption"
  ),
  denominationAssetBalanceRequired: bigDecimal().describe(
    "Total denomination asset balance required for full redemption"
  ),
  coveredPercentage: bigDecimal().describe(
    "Percentage of denomination assets available (0-100)"
  ),
});

export type StatsBondStatusInput = z.infer<typeof StatsBondStatusInputSchema>;
export type StatsBondStatusOutput = z.infer<typeof StatsBondStatusOutputSchema>;
