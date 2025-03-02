import { z, type ZodInfer } from "@/lib/utils/zod";

/**
 * Zod schema for validating fund creation inputs
 *
 * @property {string} assetName - The name of the fund
 * @property {string} symbol - The symbol of the fund (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} fundCategory - The category of the fund
 * @property {string} fundClass - The class of the fund
 * @property {number} managementFeeBps - Management fee in basis points
 */
export const CreateFundSchema = z.object({
  assetName: z.string(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  isin: z.isin().optional(),
  pincode: z.pincode(),
  fundCategory: z.string(),
  fundClass: z.string(),
  managementFeeBps: z.number(),
});

export type CreateFundInput = ZodInfer<typeof CreateFundSchema>;
