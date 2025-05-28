import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * Input type for the getPredictedAddress function for standard airdrops
 */
export const PredictStandardAirdropAddressInputSchema = t.Object({
  tokenAddress: t.EthereumAddress({
    description: "The address of the token to be distributed",
  }),
  merkleRoot: t.String({
    description: "The Merkle root for verifying claims",
    pattern: "^0x[a-fA-F0-9]{64}$",
  }),
  owner: t.EthereumAddress({
    description: "The owner of the airdrop",
  }),
  startTime: t.Timestamp({
    description: "The start time of the airdrop",
  }),
  endTime: t.Timestamp({
    description: "The end time of the airdrop",
  }),
});

export type PredictStandardAirdropAddressInput = StaticDecode<
  typeof PredictStandardAirdropAddressInputSchema
>;

export const PredictedStandardAirdropAddressSchema = t.Object({
  AirdropFactory: t.Object({
    predictStandardAirdropAddress: t.Object({
      predictedAddress: t.EthereumAddress(),
    }),
  }),
});

export const StandardAirdropExistsSchema = t.Object({
  standardAirdrop: t.MaybeEmpty(
    t.Object({
      id: t.String(),
    })
  ),
});

export type StandardAirdropExists = StaticDecode<
  typeof StandardAirdropExistsSchema
>;
