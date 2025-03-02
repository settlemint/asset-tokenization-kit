import { z, type ZodInfer } from "@/lib/utils/zod";

/**
 * Zod schema for validating cryptocurrency creation inputs
 *
 * @property {string} assetName - The name of the cryptocurrency
 * @property {string} symbol - The symbol of the cryptocurrency (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {string} pincode - The pincode for signing the transaction
 * @property {boolean} privateAsset - Whether the asset should be private
 * @property {string} [initialSupply] - Initial supply of tokens (defaults to '0')
 */
export const CreateCryptoCurrencySchema = z.object({
  assetName: z.string(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  isin: z.isin().optional(),
  pincode: z.pincode(),
  privateAsset: z.boolean(),
  initialSupply: z.string().optional(),
});

export type CreateCryptoCurrencyInput = ZodInfer<
  typeof CreateCryptoCurrencySchema
>;
