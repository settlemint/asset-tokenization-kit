import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * TypeBox schema for fixed yield data
 *
 * Provides validation for fixed yield schedule information including
 * token details, rates, dates, and period information
 */
export const FixedYieldSchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The contract address of the fixed yield schedule",
    }),
    token: t.Object(
      {
        id: t.EthereumAddress({
          description: "The contract address of the token",
        }),
        name: t.String({
          description: "The name of the token",
        }),
        symbol: t.AssetSymbol({
          description: "The symbol of the token",
        }),
      },
      {
        description:
          "Information about the token associated with this fixed yield schedule",
      }
    ),
    underlyingAsset: t.Object(
      {
        id: t.EthereumAddress({
          description: "The contract address of the underlying asset",
        }),
        name: t.String({
          description: "The name of the underlying asset",
        }),
        symbol: t.AssetSymbol({
          description: "The symbol of the underlying asset",
        }),
      },
      {
        description:
          "Information about the underlying asset that provides the yield",
      }
    ),
    startDate: t.StringifiedBigInt({
      description:
        "The start date of the fixed yield schedule as a UNIX timestamp",
    }),
    endDate: t.StringifiedBigInt({
      description:
        "The end date of the fixed yield schedule as a UNIX timestamp",
    }),
    rate: t.StringifiedBigInt({
      description: "The fixed yield rate",
    }),
    interval: t.StringifiedBigInt({
      description: "The interval between yield distributions in seconds",
    }),
    totalClaimed: t.BigDecimal({
      description:
        "The total amount of yield claimed in a human-readable decimal format",
    }),
    totalClaimedExact: t.StringifiedBigInt({
      description:
        "The exact total amount of yield claimed as a raw big integer value",
    }),
    unclaimedYield: t.BigDecimal({
      description:
        "The current unclaimed yield in a human-readable decimal format",
    }),
    unclaimedYieldExact: t.StringifiedBigInt({
      description:
        "The exact current unclaimed yield as a raw big integer value",
    }),
    underlyingBalance: t.BigDecimal({
      description:
        "The balance of the underlying asset in a human-readable decimal format",
    }),
    underlyingBalanceExact: t.StringifiedBigInt({
      description:
        "The exact balance of the underlying asset as a raw big integer value",
    }),
    periods: t.Array(
      t.Object(
        {
          id: t.String({
            description: "The unique identifier for this period",
          }),
          periodId: t.StringifiedBigInt({
            description: "The period ID as a number",
          }),
          startDate: t.StringifiedBigInt({
            description: "The start date of this period as a UNIX timestamp",
          }),
          endDate: t.StringifiedBigInt({
            description: "The end date of this period as a UNIX timestamp",
          }),
          rate: t.StringifiedBigInt({
            description: "The yield rate for this specific period",
          }),
          totalClaimed: t.BigDecimal({
            description:
              "The total amount claimed in this period in a human-readable decimal format",
          }),
          totalClaimedExact: t.StringifiedBigInt({
            description:
              "The exact total amount claimed in this period as a raw big integer value",
          }),
        },
        {
          description: "Information about a single yield period",
        }
      ),
      {
        description: "Array of yield periods within this fixed yield schedule",
      }
    ),
  },
  {
    description:
      "Complete fixed yield schedule data including token details, rates, and periods",
  }
);

export type FixedYield = StaticDecode<typeof FixedYieldSchema>;
