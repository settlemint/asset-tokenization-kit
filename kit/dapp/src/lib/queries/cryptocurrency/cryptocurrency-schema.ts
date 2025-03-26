import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * TypeBox schema for cryptocurrency data
 *
 * Provides validation for cryptocurrency token information including:
 * contract address, name, symbol, supply metrics, holders, and market data
 */
export const OnChainCryptoCurrencySchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The contract address of the cryptocurrency token",
    }),
    name: t.String({
      description: "The full name of the cryptocurrency token",
    }),
    symbol: t.AssetSymbol({
      description: "The trading symbol or ticker of the cryptocurrency token",
    }),
    decimals: t.Decimals({
      description:
        "The number of decimal places used to display the token amount",
    }),
    totalSupply: t.BigDecimal({
      description:
        "The total supply of the token in a human-readable decimal format",
    }),
    totalSupplyExact: t.StringifiedBigInt({
      description:
        "The exact total supply of the token as a raw big integer value",
    }),
    totalHolders: t.Number({
      description: "The total number of unique addresses holding the token",
    }),
    creator: t.Object(
      {
        id: t.EthereumAddress({
          description: "The Ethereum address of the token creator",
        }),
      },
      {
        description: "Information about the token creator",
      }
    ),
    concentration: t.BigDecimal({
      description:
        "The percentage of total supply held by the top holders, indicating ownership concentration",
    }),
  },
  {
    description:
      "On-chain data for cryptocurrency tokens including contract address, name, symbol, supply metrics, holders, and creator information",
  }
);
export type OnChainCryptoCurrency = StaticDecode<
  typeof OnChainCryptoCurrencySchema
>;

export const OffChainCryptoCurrencySchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The contract address of the cryptocurrency token",
    }),
    isin: t.Optional(
      t.MaybeEmpty(
        t.Isin({
          description:
            "International Securities Identification Number, if applicable to this token",
        })
      )
    ),
  },
  {
    description:
      "Off-chain data for cryptocurrency tokens including financial identifiers and market value information",
  }
);
export type OffChainCryptoCurrency = StaticDecode<
  typeof OffChainCryptoCurrencySchema
>;

export const CalculatedCryptoCurrencySchema = t.Object(
  {
    price: t.Price({
      description: "Price of the cryptocurrency",
    }),
  },
  {
    description: "Calculated fields for cryptocurrency tokens",
  }
);
export type CalculatedCryptoCurrency = StaticDecode<
  typeof CalculatedCryptoCurrencySchema
>;

export const CryptoCurrencySchema = t.Intersect(
  [OnChainCryptoCurrencySchema, t.Partial(OffChainCryptoCurrencySchema)],
  {
    description:
      "Combined schema for complete cryptocurrency details including on-chain data, off-chain data, and calculated fields",
  }
);
export type CryptoCurrency = StaticDecode<typeof CryptoCurrencySchema>;
