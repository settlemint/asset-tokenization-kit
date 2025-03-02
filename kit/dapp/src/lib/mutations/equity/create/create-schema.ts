import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * Zod schema for validating equity creation inputs
 *
 * @property {string} assetName - The name of the equity
 * @property {string} symbol - The symbol of the equity (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} equityCategory - The category of the equity
 * @property {string} equityClass - The class of the equity
 */
export const CreateEquitySchema = z.object({
  assetName: z.string(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  isin: z.isin().optional(),
  pincode: z.pincode(),
  equityCategory: z.string(),
  equityClass: z.string(),
});

export type CreateEquityInput = ZodInfer<typeof CreateEquitySchema>;
