import { AssetAdminsSchemaFragment } from "@/lib/mutations/common/asset-admins-schema";
import { type StaticDecode, t } from "@/lib/utils/typebox";

// Schema for uploaded documents
const UploadedDocumentSchema = t.Object({
  id: t.String(),
  name: t.String(),
  title: t.String(),
  type: t.String(),
  description: t.Optional(t.String()),
  url: t.String(),
  objectName: t.String(),
  fileName: t.String(),
});

const UploadedDocumentsSchema = t.Record(
  t.String(), // regulationId
  t.Array(UploadedDocumentSchema)
);

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
          maxLength: 32,
        }),
        symbol: t.AssetSymbol({
          description: "The symbol of the stablecoin (ticker)",
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
            description: "Internal ID of the stablecoin",
          })
        ),
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
        }),
        price: t.Price({
          description: "Price of the stablecoin",
        }),
        assetAdmins: AssetAdminsSchemaFragment(),
        selectedRegulations: t.Optional(t.Array(t.String())),
        uploadedDocuments: t.Optional(UploadedDocumentsSchema),
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
