import type { User } from "@/lib/auth/types";
import { fetchAllHasuraPages, fetchAllTheGraphPages } from "@/lib/pagination";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import { cache } from "react";
import { getAddress } from "viem";
import { userCalculateFields } from "./user-calculated";
import { AccountFragment, UserFragment } from "./user-fragment";
import { AccountSchema, UserSchema } from "./user-schema";

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
const UserActivity = theGraphGraphqlKit(
  `
  query UserActivity($first: Int, $skip: Int) {
    accounts(where: { isContract: false }, first: $first, skip: $skip) {
      ...AccountFragment
    }
  }
`,
  [AccountFragment]
);

/**
 * Fetches a list of users from Hasura with their last activity
 *
 * @remarks
 * This function fetches user data from Hasura and activity data from TheGraph,
 * then returns a combined list of users with their details and calculated fields.
 */
export const getUserList = cache((currentUser: Omit<User, "wallet">) => {
  return withAccessControl(
    {
      currentUser,
      requiredPermissions: {
        user: ["list"],
      },
    },
    async () => {
      const [users, accounts] = await Promise.all([
        fetchAllHasuraPages(async (pageLimit, offset) => {
          const result = await hasuraClient.request(UserList, {
            limit: pageLimit,
            offset,
          });
          return safeParse(t.Array(UserSchema), result.user || []);
        }),
        fetchAllTheGraphPages(async (first, skip) => {
          const result = await theGraphClientKit.request(UserActivity, {
            first,
            skip,
          });
          return safeParse(t.Array(AccountSchema), result.accounts || []);
        }),
      ]);

      // Create a map of accounts by address for quick lookup
      const accountsById = new Map(
        accounts.map((account) => [getAddress(account.id), account])
      );

      // Combine user data with account data and calculate fields
      const usersWithActivity = users.map((user) => {
        if (!user.wallet) {
          // Return user with default calculated fields if no wallet
          const calculatedFields = userCalculateFields(user);
          return {
            ...user,
            ...calculatedFields,
          };
        }

        const account = accountsById.get(getAddress(user.wallet));
        const calculatedFields = userCalculateFields(user, account);

        return {
          ...account,
          ...user,
          ...calculatedFields,
        };
      });

      return usersWithActivity;
    }
  );
});
