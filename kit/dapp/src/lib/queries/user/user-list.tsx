import { fetchAllHasuraPages, fetchAllTheGraphPages } from "@/lib/pagination";
import {
    AccountFragment,
    AccountFragmentSchema,
} from "@/lib/queries/accounts/accounts-fragment";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
    theGraphClientKits,
    theGraphGraphqlKits,
} from "@/lib/settlemint/the-graph";
import { safeParseWithLogging } from "@/lib/utils/zod";
import { cache } from "react";
import { UserFragment, UserFragmentSchema } from "./user-fragment";

/**
 * GraphQL query to fetch user list from Hasura
 *
 * @remarks
 * Retrieves users ordered by creation date in descending order
 */
const UserList = hasuraGraphql(
  `
  query UserList($limit: Int, $offset: Int) {
    user(order_by: { created_at: desc }, limit: $limit, offset: $offset) {
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
 * Retrieves accounts with their last activity timestamp
 */
const UserActivity = theGraphGraphqlKits(
  `
  query UserActivity($first: Int, $skip: Int) {
    accounts(where: { isContract: false }, first: $first, skip: $skip) {
      ...AccountFragment
    }
  }
`,
  [AccountFragment]
);

interface UserActivityResponse {
  accounts: unknown[];
}

/**
 * Fetches a list of users from Hasura with their last activity
 *
 * @remarks
 * This function fetches user data from Hasura and activity data from TheGraph,
 * then returns a combined list of users with their details and last activity.
 */
export const getUserList = cache(async () => {
  const [users, accounts] = await Promise.all([
    fetchAllHasuraPages(async (pageLimit, offset) => {
      const result = await hasuraClient.request(UserList, {
        limit: pageLimit,
        offset,
      });
      return result.user || [];
    }),
    fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientKits.request<UserActivityResponse>(UserActivity, {
        first,
        skip,
      });
      return result.accounts || [];
    }),
  ]);

  // Validate each dataset with their respective schemas
  const validatedUsers = users.map((user) =>
    safeParseWithLogging(UserFragmentSchema, user, "user")
  );

  const validatedAccounts = accounts.map((account) =>
    safeParseWithLogging(AccountFragmentSchema, account, "account")
  );

  // Combine validated user data with validated activity data
  return validatedUsers.map((user) => {
    const matchingAccount = validatedAccounts.find(
      (account) => account.id.toLowerCase() === user.wallet?.toLowerCase()
    );

    if (matchingAccount) {
      // Full merge of user and matching account
      return {
        ...matchingAccount,
        ...user,
        assetCount: matchingAccount.balancesCount ?? 0,
        transactionCount: matchingAccount.activityEventsCount ?? 0,
      };
    }

    // Return original validated user if no match found
    return user;
  });
});
