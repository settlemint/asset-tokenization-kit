import { PermissionSchema } from "@/lib/queries/asset/asset-users-schema";
import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating asset balance data
 */
export const AssetBalanceSchema = t.Object(
  {
    blocked: t.Boolean({
      description: "Whether the account is blocked from using this asset",
    }),
    frozen: t.BigDecimal({
      description: "Amount of tokens that are frozen and cannot be transferred",
    }),
    value: t.BigDecimal({
      description: "Total balance amount",
    }),
    lastActivity: t.Timestamp({
      description: "Timestamp of the last activity for this balance",
    }),
    account: t.Object(
      {
        id: t.EthereumAddress({
          description: "Ethereum address of the account holder",
        }),
        lastActivity: t.Timestamp({
          description: "Timestamp of the account's last activity",
        }),
      },
      {
        description: "Account information for the balance holder",
      }
    ),
    asset: t.Object(
      {
        id: t.EthereumAddress({
          description: "Ethereum address of the asset contract",
        }),
        name: t.String({
          description: "Name of the asset",
        }),
        symbol: t.AssetSymbol({
          description: "Symbol of the asset",
        }),
        decimals: t.Number({
          description: "Number of decimals for the asset",
        }),
        type: t.AssetType({
          description: "Type of asset",
        }),
        creator: t.Object(
          {
            id: t.EthereumAddress({
              description: "Ethereum address of the asset creator",
            }),
          },
          {
            description: "Information about the asset creator",
          }
        ),
        admins: t.Array(PermissionSchema, {
          description: "Accounts with admin permissions for the asset",
        }),
        supplyManagers: t.Array(PermissionSchema, {
          description: "Accounts that can manage the asset supply",
        }),
        userManagers: t.Array(PermissionSchema, {
          description:
            "Accounts that can manage user permissions for the asset",
        }),
        paused: t.Optional(
          t.Boolean({
            description: "Whether the asset contract is paused",
            default: false,
          })
        ),
      },
      {
        description: "Information about the asset",
      }
    ),
  },
  {
    description: "Asset balance data for an account",
  }
);

/**
 * Type definition for asset balance data
 */
export type AssetBalance = StaticDecode<typeof AssetBalanceSchema>;

/**
 * Schema for Asset Balance Distribution Item
 */
export const AssetDistributionItemSchema = t.Object(
  {
    asset: t.Object(
      {
        type: t.AssetType({
          description: "Type of the asset",
        }),
      },
      {
        description: "Asset type information",
      }
    ),
    value: t.String({
      description: "Balance value as a string",
    }),
    percentage: t.Number({
      description: "Percentage of the total portfolio this asset represents",
    }),
  },
  {
    description: "Distribution data for an asset type in a portfolio",
  }
);

export type AssetDistributionItem = StaticDecode<
  typeof AssetDistributionItemSchema
>;

/**
 * Schema for Asset Balance Portfolio
 */
export const AssetBalancePortfolioSchema = t.Object(
  {
    balances: t.Array(AssetBalanceSchema, {
      description: "List of individual asset balances",
    }),
    distribution: t.Array(AssetDistributionItemSchema, {
      description: "Distribution of assets by type",
    }),
    total: t.String({
      description: "Total portfolio value as a string",
    }),
  },
  {
    description: "Complete portfolio data with balances and distribution",
  }
);

export type AssetBalancePortfolio = StaticDecode<
  typeof AssetBalancePortfolioSchema
>;
