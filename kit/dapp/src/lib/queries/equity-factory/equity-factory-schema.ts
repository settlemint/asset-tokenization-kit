import { t, type StaticDecode } from "@/lib/utils/typebox";
/**
 * Input type for the getPredictedAddress function
 */
export const PredictAddressInputSchema = t.Object({
  assetName: t.String({
    description: "The name of the equity",
  }),
  symbol: t.AssetSymbol({
    description: "The symbol for the equity",
  }),
  decimals: t.Decimals({
    description: "The number of decimals for the equity",
  }),
  equityCategory: t.String({
    description: "The category of the equity",
  }),
  equityClass: t.String({
    description: "The class of the equity",
  }),
});

export type PredictAddressInput = StaticDecode<
  typeof PredictAddressInputSchema
>;

export const PredictedAddressSchema = t.Object({
  EquityFactory: t.Object({
    predictAddress: t.Object({
      predicted: t.EthereumAddress(),
    }),
  }),
});

export type PredictedAddress = StaticDecode<typeof PredictedAddressSchema>;

export const EquityExistsSchema = t.Object({
  equity: t.MaybeEmpty(
    t.Object({
      id: t.String(),
    })
  ),
});

export type EquityExists = StaticDecode<typeof EquityExistsSchema>;
