import { isAddressDeployed } from "@/lib/mutations/cryptocurrency/create/address-deployed";
import { type ZodInfer, z } from "@/lib/utils/zod";

const CryptoCurrencySchema = z.object({
  assetName: z.string().nonempty(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  pincode: z.pincode(),
  initialSupply: z
    .number()
    .or(z.string())
    .pipe(z.coerce.number().optional().default(0)),
});

export type CryptoCurrencyInput = ZodInfer<typeof CryptoCurrencySchema>;

/**
 * Zod schema for validating cryptocurrency creation inputs
 *
 * @property {string} assetName - The name of the cryptocurrency
 * @property {string} symbol - The symbol of the cryptocurrency (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} [initialSupply] - Initial supply of tokens (defaults to '0')
 */
export const CreateCryptoCurrencySchema = CryptoCurrencySchema.superRefine(
  async (data, ctx) => {
    const addressDeployed = await isAddressDeployed(data);

    if (addressDeployed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "A cryptocurrency with these parameters already exists. Please try a different name, symbol, or decimals.",
      });
    }
  }
);

export type CreateCryptoCurrencyInput = ZodInfer<
  typeof CreateCryptoCurrencySchema
>;
