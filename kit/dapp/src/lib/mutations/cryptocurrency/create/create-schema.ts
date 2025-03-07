import { isAddressDeployed } from "@/lib/mutations/cryptocurrency/create/address-deployed";
import { type ZodInfer, z } from "@/lib/utils/zod";

/**
 * Base schema for cryptocurrency creation with basic token parameters
 *
 * @property {string} assetName - The name of the cryptocurrency
 * @property {string} symbol - The symbol/ticker of the cryptocurrency (e.g., BTC, ETH)
 * @property {number} decimals - Number of decimal places for token amounts
 * @property {string} pincode - Pincode required for transaction signing
 * @property {number} [initialSupply=0] - Initial token supply (optional, defaults to 0)
 */
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
 * Extended schema for cryptocurrency creation with additional validation
 *
 * This schema extends the base CryptoCurrencySchema with additional validation
 * to ensure the cryptocurrency hasn't already been deployed on the blockchain.
 *
 * The validation is performed using superRefine which allows for async validation
 * of the entire form data object.
 */
export const CreateCryptoCurrencySchema = CryptoCurrencySchema.superRefine(
  async (data, ctx) => {
    const isDeployed = await isAddressDeployed(data);
    if (isDeployed) {
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
