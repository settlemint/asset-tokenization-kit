import { t } from "@/lib/utils/typebox";
import type { Static } from "@sinclair/typebox";

export const WithdrawTokenFromAirdropSchema = t.Object(
  {
    airdrop: t.EthereumAddress({
      description: "The address of the airdrop contract",
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

export type WithdrawTokenFromAirdropInput = Static<
  typeof WithdrawTokenFromAirdropSchema
>;
