import { type StaticDecode, t } from "@/lib/utils/typebox";
import { AssetAdminsSchemaFragment } from "../../common/asset-admins-schema";

/**
 * TypeBox schema for validating cryptocurrency creation inputs
 *
 * @property {string} assetName - The name of the cryptocurrency
 * @property {string} symbol - The symbol of the cryptocurrency (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} [initialSupply] - Initial supply of tokens (defaults to '0')
 * @property {Address} predictedAddress - Predicted address of the cryptocurrency
 */
export function CreateCryptoCurrencySchema({
  decimals,
}: {
  decimals?: number;
} = {}) {
  return t.Object(
    {
      assetName: t.String({
        description: "The name of the cryptocurrency",
        minLength: 1,
        maxLength: 50,
      }),
      symbol: t.AssetSymbol({
        description: "The symbol of the cryptocurrency (ticker)",
        maxLength: 10,
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
      decimals: t.Decimals({
        description: "The number of decimal places for the token",
      }),
      verificationCode: t.VerificationCode({
        description:
          "The verification code (PIN, 2FA, or secret code) for signing the transaction",
      }),
      verificationType: t.VerificationType({
        description: "The type of verification",
      }),
      initialSupply: t.Amount({
        decimals,
        description: "Initial supply of tokens",
        default: 0,
      }),
      predictedAddress: t.EthereumAddress({
        description: "Predicted address of the cryptocurrency",
      }),
      price: t.Price({
        description: "Price of the cryptocurrency",
      }),
      assetAdmins: AssetAdminsSchemaFragment(),
      selectedRegulations: t.Optional(t.Array(t.String())),
    },
    {
      description: "Schema for validating cryptocurrency creation inputs",
    }
  );
}

export type CreateCryptoCurrencyInput = StaticDecode<
  ReturnType<typeof CreateCryptoCurrencySchema>
>;
