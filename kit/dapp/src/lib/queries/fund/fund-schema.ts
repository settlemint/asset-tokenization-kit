import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * TypeBox schema for fund data
 *
 * Provides validation for fund token information including:
 * contract address, name, symbol, supply metrics, holders, and fund-specific properties
 */
export const OnChainFundSchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The contract address of the fund token",
    }),
    name: t.String({
      description: "The full name of the fund token",
    }),
    symbol: t.AssetSymbol({
      description: "The trading symbol or ticker of the fund token",
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
      description: "Whether the fund token contract is currently paused",
    }),
    fundCategory: t.FundCategory({
      description: "The category of the fund token",
    }),
    fundClass: t.FundClass({
      description: "The class of the fund token",
    }),
    managementFeeBps: t.Number({
      description: "The management fee in basis points",
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
    asAccount: t.Object(
      {
        balances: t.Array(
          t.Object(
            {
              value: t.BigDecimal({
                description: "The balance value of an asset in the fund",
              }),
            },
            {
              description: "Information about a single asset balance",
            }
          ),
          {
            description: "Array of asset balances in the fund",
          }
        ),
      },
      {
        description: "Information about fund's own holdings as an account",
      }
    ),
  },
  {
    description:
      "On-chain data for fund tokens including contract address, name, symbol, supply metrics, holders, and fund-specific information",
  }
);
export type OnChainFund = StaticDecode<typeof OnChainFundSchema>;

export const OffChainFundSchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The contract address of the fund token",
    }),
    isin: t.Optional(
      t.MaybeEmpty(
        t.Isin({
          description:
            "International Securities Identification Number for the fund token",
        })
      )
    ),
    value_in_base_currency: t.Number({
      minimum: 0,
      description: "The token's value in terms of the base fiat currency",
    }),
  },
  {
    description:
      "Off-chain data for fund tokens including financial identifiers and market value information",
  }
);
export type OffChainFund = StaticDecode<typeof OffChainFundSchema>;

export const CalculatedFundSchema = t.Object(
  {
    concentration: t.Number({
      description:
        "The percentage of total supply held by the top holders, indicating ownership concentration",
    }),
    assetsUnderManagement: t.Number({
      description: "The total value of assets under management in the fund",
    }),
  },
  {
    description:
      "Calculated fields for fund tokens including ownership concentration and assets under management",
  }
);
export type CalculatedFund = StaticDecode<typeof CalculatedFundSchema>;

export const FundSchema = t.Intersect(
  [OnChainFundSchema, t.Partial(OffChainFundSchema), CalculatedFundSchema],
  {
    description:
      "Combined schema for complete fund details including on-chain data, off-chain data, and calculated fields",
  }
);
export type Fund = StaticDecode<typeof FundSchema>;
