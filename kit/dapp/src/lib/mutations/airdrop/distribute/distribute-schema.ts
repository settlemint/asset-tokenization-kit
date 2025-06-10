import { t } from "@/lib/utils/typebox";
import type { Static } from "@sinclair/typebox";

export const distributeSchema = t.Object(
  {
    airdrop: t.EthereumAddress({
      description: "The address of the push airdrop contract",
    }),
    recipient: t.EthereumAddress({
      description: "The address to receive tokens",
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
    description: "Push airdrop distribution parameters",
  }
);

export type DistributeInput = Static<typeof distributeSchema>;
