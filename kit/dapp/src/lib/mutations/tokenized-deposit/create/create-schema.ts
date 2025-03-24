import { isAddressAvailable } from "@/lib/queries/tokenizeddeposit-factory/tokenizeddeposit-factory-address-available";
import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating tokenized deposit creation inputs
 *
 * @property {string} assetName - The name of the tokenized deposit
 * @property {string} symbol - The symbol of the tokenized deposit (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {string} pincode - The pincode for signing the transaction
 * @property {number} collateralLivenessValue - The value for collateral liveness period
 * @property {string} collateralLivenessTimeUnit - The time unit for collateral liveness period
 * @property {string} predictedAddress - The predicted contract address
 * @property {number} valueInBaseCurrency - The value in base currency
 */
export function CreateTokenizedDepositSchema() {
  return t.Object(
    {
      assetName: t.String({
        description: "The name of the tokenized deposit",
        minLength: 1,
      }),
      symbol: t.Symbol({
        description: "The symbol of the tokenized deposit (ticker)",
      }),
      decimals: t.Decimals({
        description: "The number of decimal places for the token",
      }),
      isin: t.Optional(
        t.Isin({
          description:
            "Optional International Securities Identification Number",
        })
      ),
      pincode: t.Pincode({
        description: "The pincode for signing the transaction",
      }),
      collateralLivenessValue: t.Number({
        description: "The value for collateral liveness period",
        minimum: 1,
      }),
      collateralLivenessTimeUnit: t.TimeUnit({
        description: "The time unit for collateral liveness period",
        default: "months",
      }),
      predictedAddress: t.EthereumAddress({
        description: "The predicted contract address",
        refine: isAddressAvailable,
        error: "tokenized-deposit.duplicate",
      }),
      valueInBaseCurrency: t.FiatCurrency({
        description: "The value in base currency",
      }),
    },
    {
      description: "Schema for validating tokenized deposit creation inputs",
    }
  );
}

export type CreateTokenizedDepositInput = StaticDecode<
  ReturnType<typeof CreateTokenizedDepositSchema>
>;
