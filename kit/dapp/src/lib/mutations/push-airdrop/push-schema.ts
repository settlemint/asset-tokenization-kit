import { t } from "@/lib/utils/typebox";
import type { Static } from "@sinclair/typebox";

export const PushAirdropDistributeSchema = t.Object(
  {
    address: t.EthereumAddress({
      description: "The address of the push airdrop contract",
    }),
    amount: t.String({
      description: "The amount of tokens to distribute",
    }),
    decimals: t.Decimals({
      description: "The number of decimals of the token",
    }),
    recipient: t.EthereumAddress({
      description: "The address to receive tokens",
    }),
    merkleProof: t.Array(t.String(), {
      description: "The proof verifying this distribution",
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

export type PushAirdropDistributeInput = Static<
  typeof PushAirdropDistributeSchema
>;
