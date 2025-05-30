import { t } from "@/lib/utils/typebox";
import type { Static } from "@sinclair/typebox";

export const AirdropDistributionSchema = t.Object({
  index: t.Number({
    description: "The index of the recipient in the Merkle tree",
  }),
  amount: t.BigDecimal({
    description: "The amount of tokens for the recipient",
  }),
  recipient: t.EthereumAddress({
    description: "The address of the recipient",
  }),
});

export type AirdropDistribution = Static<typeof AirdropDistributionSchema>;

export const AirdropDistributionListSchema = t.Array(AirdropDistributionSchema);

export type AirdropDistributionList = Static<
  typeof AirdropDistributionListSchema
>;
