import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * Input type for the getPredictedAddress function for vesting airdrops
 */
export const PredictAddressInputSchema = t.Object({
  tokenAddress: t.EthereumAddress({
    description: "The address of the token to be distributed",
  }),
  merkleRoot: t.Hash({
    description: "The Merkle root for verifying claims",
  }),
  owner: t.EthereumAddress({
    description: "The owner of the airdrop",
  }),
  claimPeriodEnd: t.Timestamp({
    description: "The end of the claim period for the vesting airdrop",
  }),
  cliffDuration: t.Duration({
    description: "The cliff duration for the vesting airdrop",
  }),
  vestingDuration: t.Duration({
    description: "The vesting duration for the vesting airdrop",
  }),
});

export type PredictAddressInput = StaticDecode<
  typeof PredictAddressInputSchema
>;

export const PredictedAddressSchema = t.Object({
  AirdropFactory: t.Object({
    predictLinearVestingAirdropAddress: t.Object({
      predictedAirdropAddress: t.EthereumAddress(),
    }),
  }),
});

export const VestingAirdropExistsSchema = t.Object({
  vestingAirdrop: t.MaybeEmpty(
    t.Object({
      id: t.String(),
    })
  ),
});

export type VestingAirdropExists = StaticDecode<
  typeof VestingAirdropExistsSchema
>;
