import { isAddressAvailable } from "@/lib/queries/cryptocurrency-factory/address-available";
import { type ZodInfer, z } from "@/lib/utils/zod";

/**
 * Zod schema for validating cryptocurrency creation inputs
 *
 * @property {string} assetName - The name of the cryptocurrency
 * @property {string} symbol - The symbol of the cryptocurrency (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} pincode - The pincode for signing the transaction
 * @property {number} initialSupply - The initial supply of the cryptocurrency
 */
export const CreateCryptocurrencySchema = z.object({
  assetName: z.string().nonempty(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  pincode: z.pincode(),
  initialSupply: z
    .number()
    .or(z.string())
    .pipe(
      z.coerce
        .number()
        .min(1, { message: "Must be at least 1" })
        .max(Number.MAX_SAFE_INTEGER, { message: "Value too large" })
    ),
  predictedAddress: z.address().refine(isAddressAvailable, {
    message: "cryptocurrency.duplicate",
  }),
  valueInBaseCurrency: z
    .fiatCurrencyAmount()
    .pipe(
      z.coerce
        .number()
        .max(Number.MAX_SAFE_INTEGER, { message: "Value too large" })
    ),
});

export type CreateCryptocurrencyInput = ZodInfer<
  typeof CreateCryptocurrencySchema
>;
