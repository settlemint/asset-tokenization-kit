import { t, type StaticDecode } from "@/lib/utils/typebox";
/**
 * Input type for the getPredictedAddress function
 */
export const PredictAddressInputSchema = t.Object({
  assetName: t.String({
    description: "The name of the cryptocurrency",
  }),
  symbol: t.AssetSymbol({
    description: "The symbol for the cryptocurrency",
  }),
  decimals: t.Decimals({
    description: "The number of decimals for the cryptocurrency",
  }),
  initialSupply: t.Number({
    description: "The initial supply of the cryptocurrency",
    minimum: 0,
  }),
});

export type PredictAddressInput = StaticDecode<
  typeof PredictAddressInputSchema
>;

export const PredictedAddressSchema = t.Object({
  CryptoCurrencyFactory: t.Object({
    predictAddress: t.Object({
      predicted: t.EthereumAddress(),
    }),
  }),
});

export type PredictedAddress = StaticDecode<typeof PredictedAddressSchema>;

export const CryptocurrencyExistsSchema = t.Object({
  cryptocurrency: t.Union([
    t.Object({
      id: t.String(),
    }),
    t.Null(),
  ]),
});

export type CryptocurrencyExists = StaticDecode<
  typeof CryptocurrencyExistsSchema
>;
