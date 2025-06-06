import { t } from "@/lib/utils/typebox";
import type { Static } from "@sinclair/typebox";
import { AirdropDistributionListSchema } from "../common/airdrop-distribution-schema";

export const CreateStandardAirdropSchema = t.Object(
  {
    asset: t.Object(
      {
        id: t.EthereumAddress({
          minLength: 1,
          errorMessage: "error.asset-required",
        }),
        decimals: t.Number({
          description: "The number of decimal places for the asset",
        }),
        symbol: t.String({
          description: "The symbol for the asset",
        }),
      },
      {
        description: "Asset to transfer",
      }
    ),
    distribution: AirdropDistributionListSchema,
    owner: t.EthereumAddress({
      description: "The owner of the airdrop",
    }),
    startTime: t.Timestamp({
      description: "The start time of the airdrop",
    }),
    endTime: t.Timestamp({
      description: "The end time of the airdrop",
    }),
    verificationCode: t.VerificationCode({
      description:
        "The verification code (PIN, 2FA, or secret code) for signing the transaction",
    }),
    verificationType: t.VerificationType({
      description: "The type of verification",
    }),
    // predictedAddress: t.EthereumAddress({
    //   description: "The predicted address of the airdrop",
    // }),
    airdropType: t.AirdropType({
      description: "The type of airdrop",
    }),
  },
  {
    description: "Standard airdrop information",
  }
);

export type CreateStandardAirdropInput = Static<
  typeof CreateStandardAirdropSchema
>;
