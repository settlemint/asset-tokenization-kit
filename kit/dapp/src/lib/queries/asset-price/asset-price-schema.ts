import { type StaticDecode, t } from "@/lib/utils/typebox";

export const AssetPriceSchema = t.Object(
  {
    id: t.String({
      description: "The id of the asset",
    }),
    amount: t.Number({
      description: "The amount of the price",
    }),
    currency: t.FiatCurrency({
      description: "The currency of the price",
    }),
  },
  {
    description: "The price of an asset",
  }
);
export type AssetPrice = StaticDecode<typeof AssetPriceSchema>;
