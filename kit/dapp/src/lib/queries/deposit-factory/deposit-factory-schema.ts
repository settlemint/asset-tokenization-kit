import { t, type StaticDecode } from "@/lib/utils/typebox";
/**
 * Input type for the getPredictedAddress function
 */
export const PredictAddressInputSchema = t.Object({
  assetName: t.String({
    description: "The name of the tokenized deposit",
  }),
  symbol: t.AssetSymbol({
    description: "The symbol for the tokenized deposit",
  }),
  decimals: t.Decimals({
    description: "The number of decimals for the tokenized deposit",
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
  DepositFactory: t.Object({
    predictAddress: t.Object({
      predicted: t.EthereumAddress(),
    }),
  }),
});

export type PredictedAddress = StaticDecode<typeof PredictedAddressSchema>;

export const DepositExistsSchema = t.Object({
  deposit: t.MaybeEmpty(
    t.Object({
      id: t.String(),
    })
  ),
});

export type DepositExists = StaticDecode<typeof DepositExistsSchema>;
