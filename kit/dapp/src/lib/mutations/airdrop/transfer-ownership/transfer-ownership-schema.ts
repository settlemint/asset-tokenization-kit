import { t } from "@/lib/utils/typebox";
import { AirdropType } from "@/lib/utils/typebox/airdrop-types";
import type { Static } from "@sinclair/typebox";

export const AirdropTransferOwnershipSchema = t.Object(
  {
    address: t.EthereumAddress({
      description: "The address of the airdrop contract",
    }),
    type: AirdropType({
      description: "The type of airdrop contract",
    }),
    newOwner: t.EthereumAddress({
      description: "The new owner address of the airdrop contract",
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
    description: "Airdrop transfer ownership parameters",
  }
);

export type AirdropTransferOwnershipInput = Static<
  typeof AirdropTransferOwnershipSchema
>;
