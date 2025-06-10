import { t } from "@/lib/utils/typebox";
import type { Static } from "@sinclair/typebox";

export const batchDistributeSchema = t.Object(
  {
    airdrop: t.EthereumAddress({
      description: "The address of the push airdrop contract",
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

export type DistributeInput = Static<typeof batchDistributeSchema>;
