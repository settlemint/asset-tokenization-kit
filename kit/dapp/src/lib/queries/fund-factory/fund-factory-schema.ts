import { t, type StaticDecode } from "@/lib/utils/typebox";
/**
 * Input type for the getPredictedAddress function
 */
export const PredictAddressInputSchema = t.Object({
  assetName: t.String({
    description: "The name of the fund",
  }),
  symbol: t.AssetSymbol({
    description: "The symbol for the fund",
  }),
  decimals: t.Decimals({
    description: "The number of decimals for the fund",
  }),
  fundCategory: t.String({
    description: "The category of the fund",
  }),
  fundClass: t.String({
    description: "The class of the fund",
  }),
  managementFeeBps: t.Integer({
    description: "The management fee in basis points",
    minimum: 0,
    maximum: 10000,
  }),
});

export type PredictAddressInput = StaticDecode<
  typeof PredictAddressInputSchema
>;

export const PredictedAddressSchema = t.Object({
  FundFactory: t.Object({
    predictAddress: t.Object({
      predicted: t.EthereumAddress(),
    }),
  }),
});

export type PredictedAddress = StaticDecode<typeof PredictedAddressSchema>;

export const FundExistsSchema = t.Object({
  fund: t.MaybeEmpty(
    t.Object({
      id: t.String(),
    })
  ),
});

export type FundExists = StaticDecode<typeof FundExistsSchema>;
