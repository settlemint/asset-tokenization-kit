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
    burnEventCount: t.Number({
      description: "Number of burn events",
    }),
    mintEventCount: t.Number({
      description: "Number of mint events",
    }),
    transferEventCount: t.Number({
      description: "Number of transfer events",
    }),
    frozenEventCount: t.Number({
      description: "Number of token freezing events",
    }),
    unfrozenEventCount: t.Number({
      description: "Number of token unfreezing events",
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
