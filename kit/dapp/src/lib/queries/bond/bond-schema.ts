import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * TypeBox schema for bond data
 *
 * Provides validation for bond token information including:
 * contract address, name, symbol, supply metrics, holders, and bond-specific properties
 */
export const OnChainBondSchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The contract address of the bond token",
    }),
    name: t.String({
      description: "The full name of the bond token",
    }),
    symbol: t.AssetSymbol({
      description: "The trading symbol or ticker of the bond token",
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
      description: "Whether the bond token contract is currently paused",
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
    underlyingAsset: t.Object(
      {
        id: t.EthereumAddress({
          description: "The address of the underlying asset",
        }),
        symbol: t.String({
          description: "The symbol of the underlying asset",
        }),
        decimals: t.Decimals({
          description: "The number of decimal places used by the underlying asset",
        }),
        type: t.AssetType({
          description: "The type of the underlying asset",
        }),
      },
      {
        description: "Information about the underlying asset",
      }
    ),
    maturityDate: t.Optional(
      t.StringifiedBigInt({
        description: "The maturity date of the bond as a timestamp",
      })
    ),
    isMatured: t.Boolean({
      description: "Whether the bond has matured",
    }),
    hasSufficientUnderlying: t.Boolean({
      description:
        "Whether the bond has sufficient underlying assets to cover obligations",
    }),
    yieldSchedule: t.Optional(
      t.Nullable(
        t.Object(
          {
            id: t.EthereumAddress({
              description: "The address of the yield schedule",
            }),
            startDate: t.StringifiedBigInt({
              description:
                "The start date of the yield schedule as a timestamp",
            }),
            endDate: t.StringifiedBigInt({
              description: "The end date of the yield schedule as a timestamp",
            }),
            rate: t.StringifiedBigInt({
              description: "The yield rate",
            }),
            interval: t.StringifiedBigInt({
              description: "The yield payment interval",
            }),
            totalClaimed: t.BigDecimal({
              description:
                "The total claimed yield in a human-readable decimal format",
            }),
            totalClaimedExact: t.StringifiedBigInt({
              description: "The exact total claimed yield as a raw big integer",
            }),
            unclaimedYield: t.BigDecimal({
              description:
                "The unclaimed yield in a human-readable decimal format",
            }),
            unclaimedYieldExact: t.StringifiedBigInt({
              description: "The exact unclaimed yield as a raw big integer",
            }),
            underlyingAsset: t.Object(
              {
                id: t.EthereumAddress({
                  description:
                    "The address of the underlying asset for yield payments",
                }),
                symbol: t.String({
                  description: "The symbol of the underlying asset",
                }),
                decimals: t.Decimals({
                  description:
                    "The number of decimal places used by the underlying asset",
                }),
                type: t.AssetType({
                  description: "The type of the underlying asset",
                }),
              },
              {
                description:
                  "Information about the underlying asset for yield payments",
              }
            ),
            underlyingBalance: t.BigDecimal({
              description:
                "The underlying asset balance in a human-readable decimal format",
            }),
            underlyingBalanceExact: t.StringifiedBigInt({
              description:
                "The exact underlying asset balance as a raw big integer",
            }),
            periods: t.Array(
              t.Object(
                {
                  id: t.String({
                    description: "The unique identifier of the yield period",
                  }),
                  periodId: t.StringifiedBigInt({
                    description: "The sequential ID of the yield period",
                  }),
                  startDate: t.StringifiedBigInt({
                    description:
                      "The start date of the yield period as a timestamp",
                  }),
                  endDate: t.StringifiedBigInt({
                    description:
                      "The end date of the yield period as a timestamp",
                  }),
                  rate: t.StringifiedBigInt({
                    description: "The yield rate for this period",
                  }),
                  totalClaimed: t.BigDecimal({
                    description:
                      "The total claimed yield for this period in a human-readable decimal format",
                  }),
                  totalClaimedExact: t.StringifiedBigInt({
                    description:
                      "The exact total claimed yield for this period as a raw big integer",
                  }),
                },
                {
                  description: "Information about a single yield period",
                }
              ),
              {
                description: "Array of yield periods",
              }
            ),
          },
          {
            description: "Information about the bond's yield schedule",
          }
        )
      )
    ),
    redeemedAmount: t.StringifiedBigInt({
      description: "The amount of tokens that have been redeemed",
    }),
    faceValue: t.StringifiedBigInt({
      description: "The face value of the bond",
    }),
    underlyingBalance: t.StringifiedBigInt({
      description: "The underlying asset balance",
    }),
    totalUnderlyingNeeded: t.BigDecimal({
      description:
        "The total underlying assets needed in a human-readable decimal format",
    }),
    totalUnderlyingNeededExact: t.StringifiedBigInt({
      description:
        "The exact total underlying assets needed as a raw big integer",
    }),
    cap: t.StringifiedBigInt({
      description: "The maximum supply cap",
    }),
    deployedOn: t.StringifiedBigInt({
      description: "The timestamp when the bond was deployed",
    }),
    concentration: t.BigDecimal({
      description:
        "The percentage of total supply held by the top holders, indicating ownership concentration",
    }),
  },
  {
    description:
      "On-chain data for bond tokens including contract address, name, symbol, supply metrics, holders, and bond-specific information",
  }
);
export type OnChainBond = StaticDecode<typeof OnChainBondSchema>;

export const OffChainBondSchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The contract address of the bond token",
    }),
    isin: t.Optional(
      t.MaybeEmpty(
        t.Isin({
          description:
            "International Securities Identification Number for the bond token",
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
      "Off-chain data for bond tokens including financial identifiers and market value information",
  }
);
export type OffChainBond = StaticDecode<typeof OffChainBondSchema>;

export const BondSchema = t.Intersect(
  [OnChainBondSchema, t.Partial(OffChainBondSchema)],
  {
    description:
      "Combined schema for complete bond details including on-chain data, off-chain data, and calculated fields",
  }
);
export type Bond = StaticDecode<typeof BondSchema>;

export const YieldDistributionItemSchema = t.Object({
  timestamp: t.Number({
    description: "The timestamp in milliseconds for the data point",
  }),
  totalYield: t.Number({
    description: "The total yield accumulated up to this point",
  }),
  claimed: t.Number({
    description: "The amount of yield claimed up to this point",
  }),
});
export type YieldDistributionItem = StaticDecode<
  typeof YieldDistributionItemSchema
>;

export const YieldCoverageSchema = t.Object({
  yieldCoverage: t.Number({
    description: "The percentage of yield coverage by underlying assets",
  }),
  hasYieldSchedule: t.Boolean({
    description: "Whether the bond has a yield schedule",
  }),
  isRunning: t.Boolean({
    description: "Whether the yield schedule is currently active",
  }),
});
export type YieldCoverage = StaticDecode<typeof YieldCoverageSchema>;
