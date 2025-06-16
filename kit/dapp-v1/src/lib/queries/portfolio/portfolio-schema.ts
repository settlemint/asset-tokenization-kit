import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * TypeBox schema for portfolio asset data
 */
export const PortfolioAssetSchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "Asset contract address",
    }),
    name: t.String({
      description: "Asset name",
    }),
    symbol: t.String({
      description: "Asset symbol",
    }),
    decimals: t.Number({
      description: "Asset decimals",
    }),
    type: t.AssetType({
      description: "Type of the asset",
    }),
  },
  { description: "Asset information" }
);
export type PortfolioAsset = StaticDecode<typeof PortfolioAssetSchema>;

/**
 * TypeBox schema for portfolio account data
 */
export const PortfolioAccountSchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "Account address",
    }),
  },
  { description: "Account information" }
);
export type PortfolioAccount = StaticDecode<typeof PortfolioAccountSchema>;

/**
 * TypeBox schema for portfolio stats data point
 */
export const PortfolioStatsSchema = t.Object(
  {
    timestamp: t.String({
      description: "Timestamp of the data point",
    }),
    account: PortfolioAccountSchema,
    asset: PortfolioAssetSchema,
    balance: t.String({
      description: "Balance at this timestamp in human-readable decimal format",
    }),
    balanceExact: t.String({
      description: "Exact balance at this timestamp as a raw big integer",
    }),
  },
  { description: "Portfolio stats data point" }
);
export type PortfolioStats = StaticDecode<typeof PortfolioStatsSchema>;

/**
 * TypeBox schema for portfolio stats collection
 */
export const PortfolioStatsCollectionSchema = t.Array(PortfolioStatsSchema, {
  description: "Collection of portfolio stats data points",
});
export type PortfolioStatsCollection = StaticDecode<
  typeof PortfolioStatsCollectionSchema
>;
