import { type StaticDecode, t } from "@/lib/utils/typebox";
import { AssetAdminsSchemaFragment } from "../../common/asset-admins-schema";

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
export function CreateDepositSchema() {
  return t.Object(
    {
      assetName: t.String({
        description: "The name of the tokenized deposit",
        minLength: 1,
        maxLength: 32,
      }),
      symbol: t.AssetSymbol({
        description: "The symbol of the tokenized deposit (ticker)",
        maxLength: 10,
      }),
      decimals: t.Decimals({
        description: "The number of decimal places for the token",
      }),
      isin: t.Optional(
        t.Isin({
          description: "International Securities Identification Number",
        })
      ),
      internalid: t.Optional(
        t.String({
          description: "Internal ID of the bond",
        })
      ),
      verificationCode: t.VerificationCode({
        description:
          "The verification code (PIN, 2FA, or secret code) for signing the transaction",
      }),
      verificationType: t.VerificationType({
        description: "The type of verification",
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
      }),
      price: t.Price({
        description: "Price of the tokenized deposit",
      }),
      assetAdmins: AssetAdminsSchemaFragment(),
      selectedRegulations: t.Optional(t.Array(t.String())),
    },
    {
      description: "Schema for validating tokenized deposit creation inputs",
    }
  );
}

export type CreateDepositInput = StaticDecode<
  ReturnType<typeof CreateDepositSchema>
>;
