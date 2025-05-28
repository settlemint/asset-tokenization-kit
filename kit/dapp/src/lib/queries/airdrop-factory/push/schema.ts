import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * Input type for the getPredictedAddress function for push airdrops
 */
export const PredictPushAirdropAddressInputSchema = t.Object({
  tokenAddress: t.EthereumAddress({
    description: "The address of the token to be distributed",
  }),
  merkleRoot: t.Hash({
    description: "The Merkle root for verifying claims",
  }),
  owner: t.EthereumAddress({
    description: "The owner of the airdrop",
  }),
  distributionCap: t.Amount({
    description: "The distribution cap for the push airdrop",
  }),
});

export type PredictPushAirdropAddressInput = StaticDecode<
  typeof PredictPushAirdropAddressInputSchema
>;

export const PredictedPushAirdropAddressSchema = t.Object({
  AirdropFactory: t.Object({
    predictPushAirdropAddress: t.Object({
      predictedAddress: t.EthereumAddress(),
    }),
  }),
});

export const PushAirdropExistsSchema = t.Object({
  pushAirdrop: t.MaybeEmpty(
    t.Object({
      id: t.String(),
    })
  ),
});

export type PushAirdropExists = StaticDecode<typeof PushAirdropExistsSchema>;
