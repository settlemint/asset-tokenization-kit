import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * TypeBox schema for asset statistics data
 *
 * Provides validation for asset statistics including supply metrics and transaction data
 */
export const AssetStatsSchema = t.Object(
  {
    totalBurned: t.BigDecimal({
      description:
        "The total amount of tokens burned in a human-readable decimal format",
    }),
    totalCollateral: t.BigDecimal({
      description:
        "The total amount of collateral held in a human-readable decimal format",
    }),
    totalFrozen: t.BigDecimal({
      description:
        "The total amount of tokens frozen in a human-readable decimal format",
    }),
    totalLocked: t.BigDecimal({
      description:
        "The total amount of tokens locked in a human-readable decimal format",
    }),
    totalMinted: t.BigDecimal({
      description:
        "The total amount of tokens minted in a human-readable decimal format",
    }),
    totalSupply: t.BigDecimal({
      description:
        "The current total supply in a human-readable decimal format",
    }),
    totalTransfers: t.BigDecimal({
      description:
        "The total number of transfer transactions in a human-readable decimal format",
    }),
    totalUnfrozen: t.BigDecimal({
      description:
        "The total amount of tokens unfrozen in a human-readable decimal format",
    }),
    totalVolume: t.BigDecimal({
      description:
        "The total transaction volume in a human-readable decimal format",
    }),
    timestamp: t.Timestamp({
      description: "The timestamp when these statistics were recorded",
    }),
  },
  {
    description:
      "Asset statistics including supply metrics and transaction data",
  }
);

export type AssetStats = StaticDecode<typeof AssetStatsSchema>;
