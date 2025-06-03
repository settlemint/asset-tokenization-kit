import { AirdropDistributionListSchema } from "@/lib/mutations/airdrop/create/common/airdrop-distribution-schema";
import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * Input type for the getPredictedAddress function for standard airdrops
 */
export const PredictStandardAirdropAddressInputSchema = t.Object({
  asset: t.Object({
    id: t.EthereumAddress({
      description: "The id of the asset to be distributed",
    }),
  }),
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
});

export type PredictStandardAirdropAddressInput = StaticDecode<
  typeof PredictStandardAirdropAddressInputSchema
>;

export const PredictedStandardAirdropAddressSchema = t.Object({
  AirdropFactory2: t.Object({
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
