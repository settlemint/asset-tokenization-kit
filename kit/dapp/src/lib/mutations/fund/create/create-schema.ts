import { isAddressAvailable } from "@/lib/queries/fund-factory/address-available";
import { type ZodInfer, z } from "@/lib/utils/zod";

/**
 * Zod schema for validating fund creation inputs
 *
 * @property {string} assetName - The name of the fund
 * @property {string} symbol - The symbol of the fund (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} fundCategory - The category of the fund
 * @property {string} fundClass - The class of the fund
 * @property {number} managementFeeBps - Management fee in basis points
 */
export const CreateFundSchema = z.object({
  assetName: z.string().nonempty(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  isin: z.isin().optional(),
  pincode: z.pincode(),
  fundCategory: z.string().nonempty(),
  fundClass: z.string().nonempty(),
  managementFeeBps: z
    .number()
    .or(z.string())
    .pipe(
      z.coerce
        .number()
        .min(0)
        .max(100 * 100) // 100 bps = 1%,
        .refine(
          (val) => {
            // Check if the value is a valid positive number that doesn't start with 0
            // unless it's a decimal less than 1 (e.g., 0.5 is valid)
            const strVal = String(val);
            return (
              val === 0 || // Allow exactly 0
              (val > 0 &&
                (strVal.indexOf(".") !== 1 ||
                  strVal.charAt(0) !== "0" ||
                  val < 1))
            );
          },
          {
            message:
              "Value cannot start with 0 unless it's a decimal less than 1",
          }
        )
    ),
  predictedAddress: z.address().refine(isAddressAvailable, {
    message: "fund.duplicate",
  }),
  valueInBaseCurrency: z
    .fiatCurrencyAmount()
    .pipe(
      z.coerce
        .number()
        .max(Number.MAX_SAFE_INTEGER, { message: "Value too large" })
    ),
});

export type CreateFundInput = ZodInfer<typeof CreateFundSchema>;
