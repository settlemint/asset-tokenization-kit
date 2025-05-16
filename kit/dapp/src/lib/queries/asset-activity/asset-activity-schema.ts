import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating asset activity data
 */
export const AssetActivitySchema = t.Object(
  {
    id: t.String({
      description: "Unique identifier for the asset activity data",
    }),
    assetType: t.AssetType({
      description: "Type of the asset",
    }),
    totalSupply: t.BigDecimal({
      description: "Total supply of the asset",
    }),
    burnEventCount: t.StringifiedBigInt({
      description: "Number of burn events",
    }),
    mintEventCount: t.StringifiedBigInt({
      description: "Number of mint events",
    }),
    transferEventCount: t.StringifiedBigInt({
      description: "Number of transfer events",
    }),
    frozenEventCount: t.StringifiedBigInt({
      description: "Number of token freezing events",
    }),
    unfrozenEventCount: t.StringifiedBigInt({
      description: "Number of token unfreezing events",
    }),
    clawbackEventCount: t.StringifiedBigInt({
      description: "Number of token clawback events",
    }),
  },
  {
    description:
      "Aggregated event counts for different types of asset activities",
  }
);

/**
 * Type definition for asset activity data
 */
export type AssetActivity = StaticDecode<typeof AssetActivitySchema>;
