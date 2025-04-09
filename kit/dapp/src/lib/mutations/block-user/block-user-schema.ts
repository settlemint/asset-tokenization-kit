import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating block user mutation inputs
 *
 * @property {string} address - The contract address
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} userAddress - The address of the user to block
 * @property {string} assettype - The type of asset
 */
export function BlockUserSchema() {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The contract address",
      }),
      verificationCode: t.VerificationCode({
        description:
          "The verification code (PIN, 2FA, or secret code) for signing the transaction",
      }),
      verificationType: t.VerificationType({
        description: "The type of verification",
      }),
      userAddress: t.EthereumAddress({
        description: "The address of the user to block",
      }),
      assettype: t.AssetType({
        description: "The type of asset",
      }),
    },
    {
      description: "Schema for validating block user mutation inputs",
    }
  );
}

export type BlockUserInput = StaticDecode<ReturnType<typeof BlockUserSchema>>;
