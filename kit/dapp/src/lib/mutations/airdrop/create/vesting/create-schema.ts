import { t, type StaticDecode } from "@/lib/utils/typebox";

export const CreateVestingAirdropSchema = t.Object(
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
    claimPeriodEnd: t.Timestamp({
      description: "The end of the claim period for the vesting airdrop",
    }),
    cliffDuration: t.Timestamp({
      description: "The cliff duration for the vesting airdrop",
    }),
    vestingDuration: t.Timestamp({
      description: "The vesting duration for the vesting airdrop",
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
    description: "Vesting airdrop information",
  }
);

export type CreateVestingAirdropInput = StaticDecode<
  typeof CreateVestingAirdropSchema
>;
