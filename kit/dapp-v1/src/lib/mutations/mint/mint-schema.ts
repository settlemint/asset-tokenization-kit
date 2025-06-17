import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating generic mint mutation inputs
 *
 * @property {string} address - The contract address
 * @property {number} amount - The amount of tokens to mint
 * @property {string} to - The recipient address
 * @property {string} pincode - User's pincode for authentication
 * @property {string} assetType - The type of asset
 */
export function MintSchema({
  maxAmount,
  decimals,
}: {
  maxAmount?: number;
  decimals?: number;
} = {}) {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The contract address",
      }),
      amount: t.Amount({
        max: maxAmount,
        decimals,
        description: "The amount of tokens to mint",
      }),
      to: t.EthereumAddress({
        description: "The recipient address",
      }),
      verificationCode: t.VerificationCode({
        description:
          "The verification code (PIN, 2FA, or secret code) for signing the transaction",
      }),
      verificationType: t.VerificationType({
        description: "The type of verification",
      }),
      assettype: t.AssetType({
        description: "The type of asset",
      }),
    },
    {
      description: "Schema for validating generic mint mutation inputs",
    }
  );
}

export type MintInput = StaticDecode<ReturnType<typeof MintSchema>>;
