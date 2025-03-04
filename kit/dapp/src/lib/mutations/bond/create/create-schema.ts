import { type ZodInfer, z } from "@/lib/utils/zod";

/**
 * Zod schema for validating bond creation inputs
 *
 * @property {string} assetName - The name of the bond
 * @property {string} symbol - The symbol of the bond (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} cap - Maximum issuance amount
 * @property {string} faceValue - Face value of the bond
 * @property {string} maturityDate - Maturity date of the bond
 * @property {string} underlyingAsset - Underlying asset of the bond
 */
export const CreateBondSchema = z.object({
  assetName: z.string(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  isin: z.isin().optional(),
  pincode: z.pincode(),
  cap: z.coerce.number().min(1, { message: "Must be at least 1" }),
  faceValue: z.coerce.number().min(1, { message: "Must be at least 1" }),
  maturityDate: z.string(),
  underlyingAsset: z.address(),
});

export type CreateBondInput = ZodInfer<typeof CreateBondSchema>;
