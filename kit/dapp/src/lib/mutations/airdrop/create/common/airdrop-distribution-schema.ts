import { t, type StaticDecode } from "@/lib/utils/typebox";

export const AirdropDistributionSchema = t.Array(
  t.Object({
    amount: t.BigDecimal({
      description: "The amount of the distribution",
    }),
    recipient: t.EthereumAddress({
      description: "The address of the recipient",
    }),
  })
);

export type AirdropDistribution = StaticDecode<
  typeof AirdropDistributionSchema
>;
