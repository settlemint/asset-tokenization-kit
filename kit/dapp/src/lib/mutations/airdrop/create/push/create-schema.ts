import { t, type StaticDecode } from "@/lib/utils/typebox";

export const CreatePushAirdropSchema = t.Object(
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
    merkleRoot: t.String({
      description: "The merkle root of the airdrop",
    }),
    owner: t.EthereumAddress({
      description: "The owner of the airdrop",
    }),
    distributionCap: t.Amount({
      description: "The distribution cap for the push airdrop",
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
    description: "Push airdrop information",
  }
);

export type CreatePushAirdropInput = StaticDecode<
  typeof CreatePushAirdropSchema
>;
