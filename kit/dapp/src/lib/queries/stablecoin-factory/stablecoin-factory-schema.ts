import { t, type StaticDecode } from "@/lib/utils/typebox";
/**
 * Input type for the getPredictedAddress function
 */
export const PredictAddressInputSchema = t.Object({
  assetName: t.String({
    description: "The name of the stablecoin",
  }),
  symbol: t.AssetSymbol({
    description: "The symbol for the stablecoin",
  }),
  decimals: t.Decimals({
    description: "The number of decimals for the stablecoin",
  }),
  collateralLivenessValue: t.Number({
    description: "The collateral liveness value",
    minimum: 1,
  }),
  collateralLivenessTimeUnit: t.TimeUnit({
    description: "The time unit for the collateral liveness period",
  }),
});

export type PredictAddressInput = StaticDecode<
  typeof PredictAddressInputSchema
>;

export const PredictedAddressSchema = t.Object({
  StableCoinFactory: t.Object({
    predictAddress: t.Object({
      predicted: t.EthereumAddress(),
    }),
  }),
});

export type PredictedAddress = StaticDecode<typeof PredictedAddressSchema>;

export const StableCoinExistsSchema = t.Object({
  stableCoin: t.Optional(
    t.Object({
      id: t.String(),
    })
  ),
});

export type StableCoinExists = StaticDecode<typeof StableCoinExistsSchema>;
