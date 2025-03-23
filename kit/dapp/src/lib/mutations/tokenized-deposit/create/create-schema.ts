import { isAddressAvailable } from "@/lib/queries/tokenizeddeposit-factory/tokenizeddeposit-factory-address-available";
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
  collateralLivenessValue: z
    .number()
    .or(z.string())
    .pipe(z.coerce.number().min(1, { message: "Must be at least 1" })),
  collateralLivenessTimeUnit: z.timeUnit().default("months"),
  predictedAddress: z.address().refine(isAddressAvailable, {
    message: "tokenized-deposit.duplicate",
  }),
  valueInBaseCurrency: z.fiatCurrencyAmount(),
});

export type CreateTokenizedDepositInput = ZodInfer<
  typeof CreateTokenizedDepositSchema
>;
