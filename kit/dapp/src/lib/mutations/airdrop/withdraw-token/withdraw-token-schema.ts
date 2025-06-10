import { type StaticDecode, t } from "@/lib/utils/typebox";

export function WithdrawTokenFromAirdropSchema({
  maxAmount,
  decimals,
}: {
  maxAmount?: number;
  decimals?: number;
} = {}) {
  return t.Object(
    {
      airdrop: t.EthereumAddress({
        description: "The address of the airdrop contract",
      }),
      amount: t.Amount({
        max: maxAmount,
        decimals,
        description: "The amount of tokens to withdraw",
      }),
      verificationCode: t.VerificationCode({
        description:
          "The verification code (PIN, 2FA, or secret code) for signing the transaction",
      }),
      verificationType: t.VerificationType({
        description: "The type of verification",
      }),
    },
    {
      description: "Withdraw tokens from airdrop",
    }
  );
}

export type WithdrawTokensFromAirdropInput = StaticDecode<
  ReturnType<typeof WithdrawTokenFromAirdropSchema>
>;
