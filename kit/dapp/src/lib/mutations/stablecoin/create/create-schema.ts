import { z } from '@/lib/utils/zod';

/**
 * Zod schema for validating stablecoin creation inputs
 *
 * @property {string} assetName - The name of the stablecoin
 * @property {string} symbol - The symbol of the stablecoin (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {number} collateralLivenessSeconds - Time period for collateral validity
 * @property {string} pincode - The pincode for signing the transaction
 * @property {boolean} privateAsset - Whether the asset should be private
 */
export const CreateStablecoinSchema = z.object({
  assetName: z.string(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  isin: z.isin().optional(),
  collateralLivenessSeconds: z.number(),
  pincode: z.pincode(),
  privateAsset: z.boolean(),
});
