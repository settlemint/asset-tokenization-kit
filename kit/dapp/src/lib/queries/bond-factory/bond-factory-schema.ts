import { t, type StaticDecode } from "@/lib/utils/typebox";
/**
 * Input type for the getPredictedAddress function
 */
export const PredictAddressInputSchema = t.Object({
  assetName: t.String({
    description: "The name of the bond",
  }),
  symbol: t.AssetSymbol({
    description: "The symbol for the bond",
  }),
  decimals: t.Decimals({
    description: "The number of decimals for the bond",
  }),
  cap: t.Number({
    description: "The cap for the bond",
    minimum: 0,
  }),
  faceValue: t.Number({
    description: "The face value of the bond",
    minimum: 0,
  }),
  maturityDate: t.String({
    description: "The maturity date of the bond",
  }),
  underlyingAsset: t.Object(
    {
      id: t.String({
        description: "The ID of the underlying asset",
      }),
    },
    {
      description: "The underlying asset of the bond",
    }
  ),
});

export type PredictAddressInput = StaticDecode<
  typeof PredictAddressInputSchema
>;

export const PredictedAddressSchema = t.Object({
  BondFactory: t.Object({
    predictAddress: t.Object({
      predicted: t.EthereumAddress(),
    }),
  }),
});

export type PredictedAddress = StaticDecode<typeof PredictedAddressSchema>;

export const BondExistsSchema = t.Object({
  bond: t.Optional(
    t.Object({
      id: t.String(),
    })
  ),
});

export type BondExists = StaticDecode<typeof BondExistsSchema>;
