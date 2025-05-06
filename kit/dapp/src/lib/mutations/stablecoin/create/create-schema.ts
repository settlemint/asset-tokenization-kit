import { AssetAdminsSchemaFragment } from "@/lib/mutations/common/asset-admins-schema";
import { isAddressAvailable } from "@/lib/queries/stablecoin-factory/stablecoin-factory-address-available";
import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating stablecoin creation inputs
 *
 * @property {string} assetName - The name of the stablecoin
 * @property {string} symbol - The symbol of the stablecoin (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {number} collateralLivenessValue - The duration value for collateral validity
 * @property {string} collateralLivenessTimeUnit - The time unit for collateral validity duration
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} predictedAddress - The predicted contract address
 * @property {number} valueInBaseCurrency - The value in base currency
 * @property {Array} assetAdmins - List of admin users with their roles
 */
export function CreateStablecoinSchema() {
  return t.Intersect([
    t.Object(
      {
        assetName: t.String({
          description: "The name of the stablecoin",
          minLength: 1,
          maxLength: 50,
        }),
        symbol: t.AssetSymbol({
          description: "The symbol of the stablecoin (ticker)",
          maxLength: 10,
        }),
        decimals: t.Decimals({
          description: "The number of decimal places for the token",
        }),
        collateralLivenessValue: t.Number({
          description: "The duration value for collateral validity",
          minimum: 1,
        }),
        collateralLivenessTimeUnit: t.TimeUnit({
          description: "The time unit for collateral validity duration",
          default: "months",
        }),
        verificationCode: t.VerificationCode({
          description:
            "The verification code (PIN, 2FA, or secret code) for signing the transaction",
        }),
        verificationType: t.VerificationType({
          description: "The type of verification",
        }),
        predictedAddress: t.EthereumAddress({
          description: "The predicted contract address",
          refine: isAddressAvailable,
          error: "stablecoin.duplicate",
        }),
        price: t.Price({
          description: "Price of the stablecoin",
        }),
        assetAdmins: AssetAdminsSchemaFragment(),
        selectedRegulations: t.Optional(t.Array(t.String())),
      },
      {
        description: "Schema for validating stablecoin creation inputs",
      }
    ),
  ]);
}

export type CreateStablecoinInput = StaticDecode<
  ReturnType<typeof CreateStablecoinSchema>
>;
