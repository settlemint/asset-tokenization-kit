import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * TypeBox schema for equity data
 *
 * Provides validation for equity token information including:
 * contract address, name, symbol, supply metrics, holders, and equity-specific properties
 */
export const OnChainEquitySchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The contract address of the equity token",
    }),
    name: t.String({
      description: "The full name of the equity token",
    }),
    symbol: t.AssetSymbol({
      description: "The trading symbol or ticker of the equity token",
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
    totalBurned: t.BigDecimal({
      description:
        "The total burned amount of the token in a human-readable decimal format",
    }),
    totalBurnedExact: t.StringifiedBigInt({
      description:
        "The exact total burned amount of the token as a raw big integer value",
    }),
    totalHolders: t.Number({
      description: "The total number of unique addresses holding the token",
    }),
    paused: t.Boolean({
      description: "Whether the equity token contract is currently paused",
    }),
    equityCategory: t.EquityCategory({
      description: "The category of the equity token",
    }),
    equityClass: t.EquityClass({
      description: "The class of the equity token",
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
      "On-chain data for equity tokens including contract address, name, symbol, supply metrics, holders, and equity-specific information",
  }
);
export type OnChainEquity = StaticDecode<typeof OnChainEquitySchema>;

export const OffChainEquitySchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The contract address of the equity token",
    }),
    isin: t.Optional(
      t.MaybeEmpty(
        t.Isin({
          description:
            "International Securities Identification Number for the equity token",
        })
      )
    ),
  },
  {
    description:
      "Off-chain data for equity tokens including financial identifiers and market value information",
  }
);
export type OffChainEquity = StaticDecode<typeof OffChainEquitySchema>;

export const CalculatedEquitySchema = t.Object(
  {
    price: t.Price({
      description: "Price of the equity",
    }),
  },
  {
    description: "Calculated fields for equity tokens",
  }
);
export type CalculatedEquity = StaticDecode<typeof CalculatedEquitySchema>;

export const EquitySchema = t.Intersect(
  [OnChainEquitySchema, t.Partial(OffChainEquitySchema)],
  {
    description:
      "Combined schema for complete equity details including on-chain data, off-chain data, and calculated fields",
  }
);
export type Equity = StaticDecode<typeof EquitySchema>;
