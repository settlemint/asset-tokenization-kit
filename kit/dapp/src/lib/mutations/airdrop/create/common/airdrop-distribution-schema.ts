import { t } from "@/lib/utils/typebox";
import type { StaticDecode } from "@sinclair/typebox";

export const AirdropDistributionSchema = t.Object({
  index: t.StringifiedBigInt({
    description: "The index of the recipient in the Merkle tree",
  }),
  amount: t.BigDecimal({
    description: "The amount of tokens for the recipient",
  }),
  amountExact: t.StringifiedBigInt({
    description: "The exact amount of tokens for the recipient",
  }),
  recipient: t.EthereumAddress({
    description: "The address of the recipient",
  }),
});

export type AirdropDistribution = StaticDecode<
  typeof AirdropDistributionSchema
>;

export const AirdropDistributionListSchema = t.Array(AirdropDistributionSchema);

export type AirdropDistributionList = StaticDecode<
  typeof AirdropDistributionListSchema
>;
