import { AirdropDistributionListSchema } from "@/lib/mutations/airdrop/create/common/airdrop-distribution-schema";
import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * Input type for the getPredictedAddress function for push airdrops
 */
export const PredictPushAirdropAddressInputSchema = t.Object({
  asset: t.Object({
    id: t.EthereumAddress({
      description: "The id of the asset to be distributed",
    }),
  }),
  distribution: AirdropDistributionListSchema,
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
