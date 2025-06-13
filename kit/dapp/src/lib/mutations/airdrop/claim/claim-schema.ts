import { t } from "@/lib/utils/typebox";
import type { Static } from "@sinclair/typebox";
import { AirdropDistributionSchema } from "../create/common/airdrop-distribution-schema";

export const ClaimAirdropSchema = t.Object(
  {
    airdrop: t.EthereumAddress({
      description: "The address of the airdrop contract",
    }),
    airdropType: t.AirdropType({
      description: "The type of airdrop (standard or vesting)",
    }),
    verificationCode: t.VerificationCode({
      description:
        "The verification code (PIN, 2FA, or secret code) for signing the transaction",
    }),
    verificationType: t.VerificationType({
      description: "The type of verification",
    }),
    ...AirdropDistributionSchema.properties,
  },
  {
    description:
      "Airdrop claim information for both standard and vesting types",
  }
);

export type ClaimAirdropInput = Static<typeof ClaimAirdropSchema>;
