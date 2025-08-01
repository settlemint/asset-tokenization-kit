import { bigDecimal } from "@/lib/zod/validators/bigdecimal";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
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
 * Contains current bond status and underlying asset information
 */
export const StatsBondStatusOutputSchema = z.object({
  underlyingAssetBalanceAvailable: bigDecimal().describe(
    "Current available underlying asset balance for redemption"
  ),
  underlyingAssetBalanceRequired: bigDecimal().describe(
    "Total underlying asset balance required for full redemption"
  ),
  coveredPercentage: bigDecimal().describe(
    "Percentage of underlying assets available (0-100)"
  ),
});

export type StatsBondStatusInput = z.infer<typeof StatsBondStatusInputSchema>;
export type StatsBondStatusOutput = z.infer<typeof StatsBondStatusOutputSchema>;
