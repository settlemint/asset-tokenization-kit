import {
  AccountFragment,
  AccountFragmentSchema,
} from "@/lib/queries/accounts/accounts-fragment";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParseWithLogging } from "@/lib/utils/zod";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { getAddress, type Address } from "viem";
import { UserFragment, UserFragmentSchema, type User } from "./user-fragment";

/**
 * GraphQL query to fetch a single user by ID from Hasura
 *
 * @remarks
 * Returns user details like name, email, wallet address, and timestamps
 */
const UserDetail = hasuraGraphql(
  `
  query UserDetail($id: String!) {
    user_by_pk(id: $id) {
      ...UserFragment
    }
  }
`,
  [UserFragment]
);

/**
 * GraphQL query to fetch a single user by ID from Hasura
 *
 * @remarks
 * Returns user details like name, email, wallet address, and timestamps
 */
const UserDetailByWallet = hasuraGraphql(
  `
  query UserDetailByWallet($address: String!) {
    user(limit: 1, where: {wallet: {_ilike: $address}}) {
      ...UserFragment
    }
  }
`,
  [UserFragment]
);

/**
 * GraphQL query to fetch user activity from TheGraph
 *
 * @remarks
 * Retrieves account with its last activity timestamp
 */
const UserActivity = theGraphGraphqlKit(
  `
  query UserActivity($id: ID!) {
    account(id: $id) {
      ...AccountFragment
    }
  }
`,
  [AccountFragment]
);

/**
 * Props interface for user detail components
 *
 */
export interface UserDetailProps {
  /** UUID of the user */
  id?: string;
  /** EVM address of the user */
  address?: Address;
}

/**
 * Fetches a user by ID
 *
 * @param params - Object containing the user ID
 * @throws Will throw an error if the user is not found
 */
export const getUserDetail = cache(async ({ id, address }: UserDetailProps) => {
  if (!id && !address) {
    throw new Error("Either id or address must be provided");
  }

  let userData: User;

  if (id) {
    const result = await unstable_cache(
      () => hasuraClient.request(UserDetail, { id }),
      ["user", "user-detail", id],
      {
        revalidate: 60 * 60 * 24, // 24 hours
        tags: ["user"],
      }
    )();
    if (!result.user_by_pk) {
      throw new Error(`User not found with ID ${id}`);
    }
    userData = UserFragmentSchema.parse(result.user_by_pk);
  } else if (address) {
    const result = await unstable_cache(
      () =>
        hasuraClient.request(UserDetailByWallet, {
          address: getAddress(address),
        }),
      ["user", "user-detail-by-wallet", address],
      {
        revalidate: 60 * 60 * 24, // 24 hours
        tags: ["user"],
      }
    )();
    if (!result.user || result.user.length === 0) {
      throw new Error(`User not found with wallet address ${address}`);
    }
    userData = UserFragmentSchema.parse(result.user[0]);
  } else {
    throw new Error("Either id or address must be provided");
  }

  // Fetch activity data if user has wallet address
  if (userData.wallet) {
    try {
      const activityResult = await unstable_cache(
        () =>
          theGraphClientKit.request(UserActivity, {
            id: userData.wallet.toLowerCase(),
          }),
        ["user", "user-activity", userData.wallet.toLowerCase()],
        {
          revalidate: 60 * 60 * 24, // 24 hours
          tags: ["user-activity"],
        }
      )();

      if (activityResult.account) {
        // Validate account data
        const validatedAccount = safeParseWithLogging(
          AccountFragmentSchema,
          activityResult.account,
          "account detail"
        );

        // Combine validated user data with validated activity data
        return {
          ...validatedAccount,
          ...userData,
          assetCount: validatedAccount.balancesCount ?? 0,
          transactionCount: validatedAccount.activityEventsCount ?? 0,
        };
      }
    } catch (error) {
      console.error("Error fetching user activity:", error);
    }
  }

  return {
    ...userData,
    assetCount: 0,
    transactionCount: 0,
  };
});

/**
 * Fetches a user by ID, returning null if not found
 *
 * @param params - Object containing the user ID
 */
export const getOptionalUserDetail = cache(
  async ({ id, address }: UserDetailProps) => {
    try {
      return await getUserDetail({ id, address });
    } catch {
      return null;
    }
  }
);
