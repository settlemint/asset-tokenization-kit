import { t } from "@/lib/utils/typebox";
import type { Static } from "@sinclair/typebox";
import { AirdropDistributionSchema } from "../../create/common/airdrop-distribution-schema";

export const ClaimStandardAirdropSchema = t.Object(
  {
    airdrop: t.EthereumAddress({
      description: "The address of the airdrop contract",
    }),
    asset: t.Object({
      id: t.EthereumAddress({
        description: "The address of the asset to claim",
      }),
      symbol: t.String({
        description: "The symbol of the asset to claim",
      }),
      decimals: t.Number({
        description: "The decimals of the asset to claim",
      }),
    }),
    price: t.Price({
      description: "The price of the asset to claim",
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
    description: "Standard airdrop information",
  }
);

export type ClaimStandardAirdropInput = Static<
  typeof ClaimStandardAirdropSchema
>;
