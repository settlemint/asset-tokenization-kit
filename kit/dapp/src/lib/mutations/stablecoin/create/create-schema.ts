import { isAddressAvailable } from "@/lib/queries/stablecoin-factory/address-available";
import { z, type ZodInfer } from "@/lib/utils/zod";

/**
 * Zod schema for validating stablecoin creation inputs
 *
 * @property {string} assetName - The name of the stablecoin
 * @property {string} symbol - The symbol of the stablecoin (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {number} collateralLivenessSeconds - Time period for collateral validity
 * @property {string} pincode - The pincode for signing the transaction
 */
export const CreateStablecoinSchema = z.object({
  assetName: z.string().nonempty(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  isin: z.isin().optional(),
  collateralLivenessSeconds: z
    .number()
    .or(z.string())
    .pipe(z.coerce.number().min(0)),
  pincode: z.pincode(),
  predictedAddress: z.address().refine(isAddressAvailable, {
    message: "stablecoin.duplicate",
  }),
});

export type CreateStablecoinInput = ZodInfer<typeof CreateStablecoinSchema>;
