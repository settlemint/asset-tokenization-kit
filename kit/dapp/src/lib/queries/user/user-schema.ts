import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * TypeBox schema for Hasura user data
 *
 * Provides validation for user information including:
 * ID, name, email, wallet address, and timestamps
 */
export const UserSchema = t.Object(
  {
    id: t.String({
      description: "The unique identifier of the user",
    }),
    name: t.String({
      description: "The full name of the user",
    }),
    email: t.String({
      format: "email",
      description: "The email address of the user",
    }),
    wallet: t.EthereumAddress({
      description: "The Ethereum wallet address of the user",
    }),
    created_at: t.Date({
      description: "The timestamp when the user was created",
    }),
    updated_at: t.Optional(
      t.Date({
        description: "The timestamp when the user was last updated",
      })
    ),
    kyc_verified_at: t.MaybeEmpty(
      t.String({
        description: "The timestamp when the user's KYC was verified",
      })
    ),
    role: t.String({
      description: "The role of the user in the system",
    }),
    banned: t.MaybeEmpty(
      t.Boolean({
        description: "Whether the user is banned from the platform",
      })
    ),
    ban_reason: t.MaybeEmpty(
      t.String({
        description: "The reason why the user was banned",
      })
    ),
    ban_expires: t.MaybeEmpty(
      t.Date({
        description: "The timestamp when the user's ban expires",
      })
    ),
    last_login_at: t.Optional(
      t.String({
        description: "The timestamp of the user's last login",
      })
    ),
    image: t.MaybeEmpty(
      t.String({
        description: "The URL of the user's profile image",
      })
    ),
    currency: t.FiatCurrency({
      description: "The preferred currency of the user",
    }),
  },
  {
    description:
      "User data from Hasura including identity and status information",
  }
);
export type User = StaticDecode<typeof UserSchema>;

/**
 * TypeBox schema for blockchain account data related to a user
 */
export const AccountSchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The Ethereum address of the account",
    }),
    balancesCount: t.Optional(
      t.Number({
        description:
          "The number of token balances associated with this account",
      })
    ),
    activityEventsCount: t.Optional(
      t.Number({
        description:
          "The number of activity events associated with this account",
      })
    ),
    lastActivity: t.String({
      description: "The timestamp of the user's last activity",
    }),
  },
  {
    description: "Blockchain account data related to a user from The Graph",
  }
);
export type Account = StaticDecode<typeof AccountSchema>;

/**
 * TypeBox schema for calculated user fields
 */
export const CalculatedUserSchema = t.Object(
  {
    assetCount: t.Number({
      description: "The number of assets held by the user",
    }),
    transactionCount: t.Number({
      description: "The number of transactions made by the user",
    }),
  },
  {
    description: "Calculated fields for user data",
  }
);
export type CalculatedUser = StaticDecode<typeof CalculatedUserSchema>;

/**
 * Combined schema for complete user details
 */
export const UserDetailSchema = t.Intersect(
  [UserSchema, t.Partial(t.Omit(AccountSchema, ["id"])), CalculatedUserSchema],
  {
    description:
      "Combined schema for complete user details including Hasura data, account data, and calculated fields",
  }
);
export type UserDetail = StaticDecode<typeof UserDetailSchema>;

/**
 * TypeBox schema for user count results
 */
export const UserCountSchema = t.Object(
  {
    count: t.Number({
      description: "The number of users",
      default: 0,
    }),
  },
  {
    description: "Count of users",
  }
);
export type UserCount = StaticDecode<typeof UserCountSchema>;
