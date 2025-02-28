import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * Zod schema for validating cryptocurrency creation inputs
 *
 * @property {string} assetName - The name of the cryptocurrency
 * @property {string} symbol - The symbol of the cryptocurrency (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {string} cap - The maximum supply cap of the cryptocurrency
 * @property {string} maturityDate - The maturity date of the cryptocurrency (timestamp)
 * @property {string} faceValue - The face value of the cryptocurrency
 * @property {string} underlyingAsset - The address of the underlying asset
 * @property {string} pincode - The pincode for signing the transaction
 * @property {boolean} privateAsset - Whether the asset should be private
 */
export const CreateCryptocurrencySchema = z.object({
  assetName: z.string(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  isin: z.isin().optional(),
  cap: z.string(),
  maturityDate: z.string(),
  faceValue: z.string(),
  underlyingAsset: z.address(),
  pincode: z.pincode(),
  privateAsset: z.boolean(),
});

export type CreateCryptocurrencyInput = ZodInfer<
  typeof CreateCryptocurrencySchema
>;
