import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * TypeBox schema for on-chain tokenized deposit data
 *
 * Provides validation for tokenized deposit token information including:
 * contract address, name, symbol, supply metrics, holders, and deposit-specific properties
 */
export const OnChainTokenizedDepositSchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The contract address of the tokenized deposit token",
    }),
    name: t.String({
      description: "The full name of the tokenized deposit token",
    }),
    symbol: t.AssetSymbol({
      description:
        "The trading symbol or ticker of the tokenized deposit token",
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
        "The amount of collateral backing the tokenized deposit in a human-readable decimal format",
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
      description: "Whether the tokenized deposit contract is currently paused",
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
      "On-chain data for tokenized deposit tokens including contract address, name, symbol, supply metrics, holders, and deposit-specific information",
  }
);
export type OnChainTokenizedDeposit = StaticDecode<
  typeof OnChainTokenizedDepositSchema
>;

export const OffChainTokenizedDepositSchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The contract address of the tokenized deposit token",
    }),
    isin: t.Optional(
      t.MaybeEmpty(
        t.Isin({
          description:
            "International Securities Identification Number for the tokenized deposit token",
        })
      )
    ),
  },
  {
    description:
      "Off-chain data for tokenized deposit tokens including financial identifiers and market value information",
  }
);
export type OffChainTokenizedDeposit = StaticDecode<
  typeof OffChainTokenizedDepositSchema
>;

export const CalculatedTokenizedDepositSchema = t.Object(
  {
    collateralProofValidity: t.Optional(
      t.Date({
        description: "The date until which the collateral proof is valid",
      })
    ),
    price: t.Price({
      description: "Price of the tokenized deposit",
    }),
  },
  {
    description:
      "Calculated fields for tokenized deposit tokens including ownership concentration and collateral validity",
  }
);
export type CalculatedTokenizedDeposit = StaticDecode<
  typeof CalculatedTokenizedDepositSchema
>;

export const TokenizedDepositSchema = t.Intersect(
  [
    OnChainTokenizedDepositSchema,
    t.Partial(OffChainTokenizedDepositSchema),
    CalculatedTokenizedDepositSchema,
  ],
  {
    description:
      "Combined schema for complete tokenized deposit details including on-chain data, off-chain data, and calculated fields",
  }
);
export type TokenizedDeposit = StaticDecode<typeof TokenizedDepositSchema>;
