import { TokenAdminsSchemaFragment } from "@/lib/mutations/common/token-admins-schema";
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
 * @property {Array} tokenAdmins - List of admin users with their roles
 */
export function CreateStablecoinSchema() {
  return t.Intersect([
    t.Object(
      {
        assetName: t.String({
          description: "The name of the stablecoin",
          minLength: 1,
        }),
        symbol: t.AssetSymbol({
          description: "The symbol of the stablecoin (ticker)",
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
        // NOTE: pincode is marked as optional in the schema to prevent validation errors during the form-filling process.
        // The actual pincode value is collected via the FormOtpDialog component before form submission.
        // This prevents premature validation when adding tokenAdmins or navigating between form steps.
        pincode: t.Optional(t.Pincode({
          description: "The pincode for signing the transaction",
        })),
        // NOTE: predictedAddress is marked as optional to prevent validation errors during form filling.
        // It is calculated and set by the Summary component's beforeValidate hook just before form submission.
        // This prevents race conditions between validation and the async address calculation.
        predictedAddress: t.Optional(t.EthereumAddress({
          description: "The predicted contract address",
          refine: isAddressAvailable,
          error: "stablecoin.duplicate",
        })),
        price: t.Price({
          description: "Price of the stablecoin",
        }),
        tokenAdmins: TokenAdminsSchemaFragment(),
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
