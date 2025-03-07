import { type ZodInfer, z } from "@/lib/utils/zod";
import { predictCryptoCurrencyAddress } from "./predict-address";

const CryptoCurrencySchema = z.object({
  assetName: z.string(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  isin: z.isin().optional(),
  pincode: z.pincode(),
  initialSupply: z.coerce.number().optional().default(0),
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
export const CreateCryptoCurrencySchema = CryptoCurrencySchema.refine(
  async (data) => {
    console.log("inside refine");
    const result = await predictCryptoCurrencyAddress(data);
    console.log({ result });
    return result !== false;
  },
  {
    message: "Failed to predict the address",
    path: ["assetName"], // This will show the error under the assetName field
  }
);

export type CreateCryptoCurrencyInput = ZodInfer<
  typeof CreateCryptoCurrencySchema
>;
