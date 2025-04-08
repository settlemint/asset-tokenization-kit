import { isAddressAvailable } from "@/lib/queries/fund-factory/fund-factory-address-available";
import { type StaticDecode, t } from "@/lib/utils/typebox";
import { AssetAdminsSchemaFragment } from "../../common/asset-admins-schema";

/**
 * TypeBox schema for validating fund creation inputs
 *
 * @property {string} assetName - The name of the fund
 * @property {string} symbol - The symbol of the fund (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} fundCategory - The category of the fund
 * @property {string} fundClass - The class of the fund
 * @property {number} managementFeeBps - Management fee in basis points
 * @property {string} predictedAddress - The predicted contract address
 * @property {number} valueInBaseCurrency - The value in base currency
 */
export function CreateFundSchema() {
  return t.Object(
    {
      assetName: t.String({
        description: "The name of the fund",
        minLength: 1,
        maxLength: 50,
      }),
      symbol: t.AssetSymbol({
        description: "The symbol of the fund (ticker)",
        maxLength: 10,
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
      verificationCode: t.VerificationCode({
        description:
          "The verification code (PIN, 2FA, or secret code) for signing the transaction",
      }),
      verificationType: t.VerificationType({
        description: "The type of verification",
      }),
      fundCategory: t.String({
        description: "The category of the fund",
        minLength: 1,
      }),
      fundClass: t.String({
        description: "The class of the fund",
        minLength: 1,
      }),
      managementFeeBps: t.Integer({
        description: "Management fee in basis points (1% = 100 bps)",
        minimum: 0,
        maximum: 10000, // 100%
      }),
      predictedAddress: t.EthereumAddress({
        description: "The predicted contract address",
        refine: isAddressAvailable,
        error: "fund.duplicate",
      }),
      price: t.Price({
        description: "Price of the fund",
      }),
      assetAdmins: AssetAdminsSchemaFragment(),
    },
    {
      description: "Schema for validating fund creation inputs",
    }
  );
}

export type CreateFundInput = StaticDecode<ReturnType<typeof CreateFundSchema>>;
