import { isAddressAvailable } from "@/lib/queries/stablecoin-factory/address-available";
import { type ZodInfer, z } from "@/lib/utils/zod";

/**
 * Zod schema for validating stablecoin creation inputs
 *
 * @property {string} assetName - The name of the stablecoin
 * @property {string} symbol - The symbol of the stablecoin (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {string} pincode - The pincode for signing the transaction
 */
export const CreateTokenizedDepositSchema = z.object({
  assetName: z.string().nonempty(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  isin: z.isin().optional(),
  pincode: z.pincode(),
  collateralLivenessSeconds: z
    .number()
    .or(z.string())
    .pipe(z.coerce.number().min(0)),
  predictedAddress: z.address().refine(isAddressAvailable, {
    message: "tokenized-deposit.duplicate",
  }),
});

export type CreateTokenizedDepositInput = ZodInfer<
  typeof CreateTokenizedDepositSchema
>;
