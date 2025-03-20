import { isAddressAvailable } from "@/lib/queries/bond-factory/address-available";
import { type ZodInfer, z } from "@/lib/utils/zod";
import { isFuture } from "date-fns";

/**
 * Zod schema for validating bond creation inputs
 *
 * @property {string} assetName - The name of the bond
 * @property {string} symbol - The symbol of the bond (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {string} pincode - The pincode for signing the transaction
 * @property {number} cap - The maximum supply of the bond
 * @property {number} faceValue - The face value of the bond
 * @property {string} maturityDate - The maturity date of the bond
 * @property {string} underlyingAsset - The underlying asset of the bond
 */
export const CreateBondSchema = z.object({
  assetName: z.string().nonempty(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  isin: z.isin().optional(),
  pincode: z.pincode(),
  cap: z
    .number()
    .or(z.string())
    .pipe(
      z.coerce
        .number()
        .min(1, { message: "Must be at least 1" })
        .max(1000000000, { message: "Value too large, maximum is 1,000,000,000" })
    ),
  faceValue: z
    .number()
    .or(z.string())
    .pipe(
      z.coerce
        .number()
        .min(1, { message: "Must be at least 1" })
        .max(1000000000, { message: "Value too large, maximum is 1,000,000,000" })
    ),
  maturityDate: z
    .string()
    .refine(isFuture, { message: "Maturity date must be in the future" }),
  underlyingAsset: z.address(),
  predictedAddress: z.address().refine(isAddressAvailable, {
    message: "bond.duplicate",
  }),
  valueInBaseCurrency: z
    .fiatCurrencyAmount()
    .pipe(
      z.coerce
        .number()
        .max(1000000000, { message: "Value too large, maximum is 1,000,000,000" })
    ),
});

export type CreateBondInput = ZodInfer<typeof CreateBondSchema>;
