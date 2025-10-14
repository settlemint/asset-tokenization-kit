/**
 * Factory Predict Access Manager Address Schema
 *
 * This schema provides a simplified interface for predicting access manager addresses
 * for different token types. Access manager prediction only requires the basic token
 * parameters (name, symbol, decimals) and asset type.
 *
 * @example
 * ```typescript
 * // Predict access manager for any token type
 * const input = {
 *   type: "equity",
 *   name: "Tech Company Shares",
 *   symbol: "TECH",
 *   decimals: 18
 * };
 * ```
 */

import { assetSymbol } from "@atk/zod/asset-symbol";
import { assetType } from "@atk/zod/asset-types";
import { decimals } from "@atk/zod/decimals";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";

/**
 * Predict access manager address input schema.
 * Only requires basic token parameters that are common across all asset types.
 */
export const PredictAddressInputSchema = z.object({
  type: assetType().describe("The type of asset token"),
  name: z.string().max(50).describe("The name of the token"),
  symbol: assetSymbol().describe("The symbol of the token"),
  decimals: decimals().describe("The number of decimals for the token"),
});

/**
 * Output schema for access manager address prediction
 */
export const PredictAddressOutputSchema = z.object({
  predictedAddress: ethereumAddress.describe(
    "The predicted address of the access manager"
  ),
});

// Type exports using Zod's type inference
export type PredictAddressInput = z.infer<typeof PredictAddressInputSchema>;
export type PredictAddressOutput = z.infer<typeof PredictAddressOutputSchema>;
