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
  predictedAddress: z.address().refine(
    async (address) => {
      const isDeployed = await isAddressDeployed(address);
      return !isDeployed;
    },
    {
      message:
        "A cryptocurrency with these details already exists. Please change at least one of the values.",
    }
  ),
});

export type CreateCryptoCurrencyInput = ZodInfer<
  typeof CreateCryptoCurrencySchema
>;
