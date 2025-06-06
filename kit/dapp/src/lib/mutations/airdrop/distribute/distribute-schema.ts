import { AirdropDistributionListSchema } from "@/lib/mutations/airdrop/create/common/airdrop-distribution-schema";
import { t } from "@/lib/utils/typebox";
import type { Static } from "@sinclair/typebox";

export const distributeSchema = t.Object(
  {
    address: t.EthereumAddress({
      description: "The address of the push airdrop contract",
    }),
    decimals: t.Decimals({
      description: "The number of decimals of the token",
    }),
    recipient: t.EthereumAddress({
      description: "The address to receive tokens",
    }),
    distribution: AirdropDistributionListSchema,
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
