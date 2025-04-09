import { AssetAdminsSchemaFragment } from "@/lib/mutations/common/asset-admins-schema";
import { isAddressAvailable } from "@/lib/queries/bond-factory/bond-factory-address-available";
import { isValidFutureDate } from "@/lib/utils/date";
import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating bond creation inputs
 *
 * @property {string} assetName - The name of the bond
 * @property {string} symbol - The symbol of the bond (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {string} verificationCode - The verification code for signing the transaction
 * @property {string} verificationType - The type of verification used
 * @property {string} cap - Maximum issuance amount
 * @property {string} faceValue - Face value of the bond
 * @property {string} maturityDate - Maturity date of the bond
 * @property {object} underlyingAsset - Underlying asset of the bond
 * @property {object} price - Price information for the bond
 * @property {number} price.amount - The price amount
 * @property {string} price.currency - The currency of the price
 * @property {object[]} assetAdmins - List of administrators for the asset
 * @property {string} predictedAddress - The predicted contract address
 */
export function CreateBondSchema({
  decimals,
}: {
  decimals?: number;
} = {}) {
  return t.Object(
    {
      assetName: t.String({
        description: "The name of the bond",
        minLength: 1,
        maxLength: 50,
      }),
      symbol: t.AssetSymbol({
        description: "The symbol of the bond (ticker)",
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
      verificationCode: t.VerificationCode({
        description:
          "The verification code (PIN, 2FA, or secret code) for signing the transaction",
      }),
      verificationType: t.VerificationType({
        description: "The type of verification",
      }),
      cap: t.Amount({
        decimals,
        description: "Maximum issuance amount",
      }),
      faceValue: t.Amount({
        decimals,
        description: "Face value of the bond",
      }),
      maturityDate: t.String({
        description: "Maturity date of the bond",
        // NOTE: This refinement validation doesn't work reliably with @hookform/typebox resolver.
        // We implement a custom validation in the Configuration component using customValidation
        // to ensure proper validation and error display.
        refinement: {
          predicate: (date: string | Date) => isValidFutureDate(date, 1),
          message: "Maturity date must be at least 1 hour in the future",
        },
      }),
      underlyingAsset: t.Object(
        {
          id: t.EthereumAddress({
            minLength: 1,
            errorMessage: "Underlying asset is required",
          }),
        },
        {
          description: "Underlying asset of the bond",
        }
      ),
      predictedAddress: t.EthereumAddress({
        description: "Predicted address of the bond",
        refinement: {
          predicate: isAddressAvailable,
          message: "Address already in use",
        },
      }),
      price: t.Price({
        description: "Price of the bond",
      }),
      assetAdmins: AssetAdminsSchemaFragment(),
    },
    {
      description: "Schema for validating bond creation inputs",
    }
  );
}

export type CreateBondInput = StaticDecode<ReturnType<typeof CreateBondSchema>>;
