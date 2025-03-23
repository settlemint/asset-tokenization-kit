import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating permission data
 */
export const PermissionSchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "Ethereum address of the account",
    }),
    lastActivity: t.Timestamp({
      description: "Timestamp of the last activity for this account",
    }),
  },
  {
    description: "Account permission data for an asset",
  }
);

/**
 * Type definition for permission data
 */
export type Permission = StaticDecode<typeof PermissionSchema>;

/**
 * TypeBox schema for validating allowed user data
 */
export const AllowedUserSchema = t.Object(
  {
    id: t.String({
      description: "Unique identifier for the allowed user record",
    }),
    user: t.Object(
      {
        id: t.EthereumAddress({
          description: "Ethereum address of the allowed user",
        }),
      },
      {
        description: "User account information",
      }
    ),
    allowedAt: t.Timestamp({
      description: "Timestamp when the user was allowed",
    }),
  },
  {
    description: "Data for a user allowed to interact with an asset",
  }
);

/**
 * Type definition for allowed user data
 */
export type AllowedUser = StaticDecode<typeof AllowedUserSchema>;

/**
 * TypeBox schema for validating blocked user data
 */
export const BlockedUserSchema = t.Object(
  {
    id: t.String({
      description: "Unique identifier for the blocked user record",
    }),
    user: t.Object(
      {
        id: t.EthereumAddress({
          description: "Ethereum address of the blocked user",
        }),
      },
      {
        description: "User account information",
      }
    ),
    blockedAt: t.Timestamp({
      description: "Timestamp when the user was blocked",
    }),
  },
  {
    description: "Data for a user blocked from interacting with an asset",
  }
);

/**
 * Type definition for blocked user data
 */
export type BlockedUser = StaticDecode<typeof BlockedUserSchema>;

/**
 * TypeBox schema for validating holder data
 */
export const HolderSchema = t.Object(
  {
    id: t.String({
      description: "Unique identifier for the holder record",
    }),
    value: t.String({
      description: "Token balance amount",
    }),
    account: t.Object(
      {
        id: t.EthereumAddress({
          description: "Ethereum address of the holder account",
        }),
      },
      {
        description: "Account information for the holder",
      }
    ),
  },
  {
    description: "Data for an account holding tokens of an asset",
  }
);

/**
 * TypeBox schema for validating on-chain asset user data
 */
export const AssetUsersSchema = t.Object(
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
    type: t.AssetType({
      description: "Type of the asset",
    }),
    decimals: t.Number({
      description: "Number of decimals for the asset",
    }),
    admins: t.Array(PermissionSchema, {
      description: "Accounts with admin permissions for the asset",
    }),
    supplyManagers: t.Array(PermissionSchema, {
      description: "Accounts that can manage supply for the asset",
    }),
    userManagers: t.Array(PermissionSchema, {
      description: "Accounts that can manage users for the asset",
    }),
    holders: t.Array(HolderSchema, {
      description: "Accounts holding this asset",
    }),
    allowlist: t.Array(AllowedUserSchema, {
      description: "Users explicitly allowed to interact with the asset",
      default: [],
    }),
    blocklist: t.Array(BlockedUserSchema, {
      description: "Users explicitly blocked from interacting with the asset",
      default: [],
    }),
  },
  {
    description: "On-chain asset data with user permission relationships",
  }
);

/**
 * Type definition for on-chain asset user data
 */
export type AssetUsers = StaticDecode<typeof AssetUsersSchema>;

/**
 * TypeBox schema for validating off-chain asset data
 */
export const OffchainAssetSchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "Ethereum address of the asset contract",
    }),
    isin: t.Optional(
      t.Isin({
        description: "International Securities Identification Number",
      })
    ),
    value_in_base_currency: t.FiatCurrency({
      description: "Value of the asset in the base currency",
    }),
  },
  {
    description: "Off-chain metadata for assets stored in the database",
  }
);

/**
 * Type definition for off-chain asset data
 */
export type OffchainAsset = StaticDecode<typeof OffchainAssetSchema>;
