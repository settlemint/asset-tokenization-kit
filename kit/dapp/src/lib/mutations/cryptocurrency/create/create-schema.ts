import { isAddressAvailable } from "@/lib/queries/cryptocurrency-factory/address-available";
import { type ZodInfer, z } from "@/lib/utils/zod";

/**
 * Zod schema for validating cryptocurrency creation inputs
 *
 * @property {string} assetName - The name of the cryptocurrency
 * @property {string} symbol - The symbol of the cryptocurrency (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} [initialSupply] - Initial supply of tokens (defaults to '0')
 * @property {Address} predictedAddress - Predicted address of the cryptocurrency
 */
export const CreateCryptoCurrencySchema = z.object({
  assetName: z.string().nonempty(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  pincode: z.pincode(),
  initialSupply: z
    .number()
    .or(z.string())
    .pipe(z.coerce.number().optional().default(0)),
  predictedAddress: z.address().refine(isAddressAvailable, {
    message: "cryptocurrency.duplicate",
  }),
});

export type CreateCryptoCurrencyInput = ZodInfer<
  typeof CreateCryptoCurrencySchema
>;
