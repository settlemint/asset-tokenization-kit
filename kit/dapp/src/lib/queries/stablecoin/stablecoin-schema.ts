import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * TypeBox schema for on-chain stablecoin data
 *
 * Provides validation for stablecoin token information including:
 * contract address, name, symbol, supply metrics, holders, and stablecoin-specific properties
 */
export const OnChainStableCoinSchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The contract address of the stablecoin token",
    }),
    name: t.String({
      description: "The full name of the stablecoin token",
    }),
    symbol: t.AssetSymbol({
      description: "The trading symbol or ticker of the stablecoin token",
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
    collateral: t.BigDecimal({
      description:
        "The amount of collateral backing the stablecoin in a human-readable decimal format",
    }),
    collateralRatio: t.BigDecimal({
      description:
        "The ratio of collateral to total supply, indicating the token's backing percentage",
    }),
    freeCollateral: t.BigDecimal({
      description:
        "The amount of unused/available collateral in a human-readable decimal format",
    }),
    lastCollateralUpdate: t.Timestamp({
      description: "The timestamp of the last collateral update",
    }),
    liveness: t.StringifiedBigInt({
      description:
        "The liveness period for collateral-related operations in seconds",
    }),
    paused: t.Boolean({
      description: "Whether the stablecoin contract is currently paused",
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
    holders: t.Array(
      t.Object(
        {
          valueExact: t.StringifiedBigInt({
            type: "string",
            description:
              "The exact amount of tokens held by this holder as a raw big integer",
          }),
        },
        {
          description: "Information about a single token holder",
        }
      ),
      {
        description: "Array of top token holders, ordered by amount held",
      }
    ),
  },
  {
    description:
      "On-chain data for stablecoin tokens including contract address, name, symbol, supply metrics, holders, and stablecoin-specific information",
  }
);
export type OnChainStableCoin = StaticDecode<typeof OnChainStableCoinSchema>;

export const OffChainStableCoinSchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The contract address of the stablecoin token",
    }),
    isin: t.Optional(
      t.MaybeEmpty(
        t.Isin({
          description:
            "International Securities Identification Number for the stablecoin token",
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
      "Off-chain data for stablecoin tokens including financial identifiers and market value information",
  }
);
export type OffChainStableCoin = StaticDecode<typeof OffChainStableCoinSchema>;

export const CalculatedStableCoinSchema = t.Object(
  {
    concentration: t.Number({
      description:
        "The percentage of total supply held by the top holders, indicating ownership concentration",
    }),
    collateralProofValidity: t.Optional(
      t.Date({
        description: "The date until which the collateral proof is valid",
      })
    ),
  },
  {
    description:
      "Calculated fields for stablecoin tokens including ownership concentration and collateral validity",
  }
);
export type CalculatedStableCoin = StaticDecode<
  typeof CalculatedStableCoinSchema
>;

export const StableCoinSchema = t.Intersect(
  [
    OnChainStableCoinSchema,
    t.Partial(OffChainStableCoinSchema),
    CalculatedStableCoinSchema,
  ],
  {
    description:
      "Combined schema for complete stablecoin details including on-chain data, off-chain data, and calculated fields",
  }
);
export type StableCoin = StaticDecode<typeof StableCoinSchema>;
