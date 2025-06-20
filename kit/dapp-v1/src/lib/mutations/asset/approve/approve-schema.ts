import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating approve spend mutation inputs
 *
 * @property {string} address - The stablecoin contract address
 * @property {string} amount - The amount to approve
 * @property {string} spender - The address of the spender
 */
export const ApproveSchema = ({
  maxAmount,
  decimals,
}: {
  maxAmount?: number;
  decimals?: number;
} = {}) =>
  t.Object({
    address: t.EthereumAddress({
      description: "The contract address",
    }),
    amount: t.Amount({
      max: maxAmount,
      decimals,
      description: "The amount to approve",
    }),
    spender: t.EthereumAddress({
      description: "The address of the spender",
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
  });

export type ApproveInput = StaticDecode<ReturnType<typeof ApproveSchema>>;
