import "server-only";

import { fetchAllHasuraPages, fetchAllTheGraphPages } from "@/lib/pagination";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withAccessControl } from "@/lib/utils/access-control";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse, t } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
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
export const getUserList = withTracing(
  "queries",
  "getUserList",
  cache(
    withAccessControl(
      {
        requiredPermissions: {
          user: ["list"],
        },
      },
      async () => {
        "use cache";
        cacheTag("user-activity");
        const [users, accounts] = await Promise.all([
          fetchAllHasuraPages(async (pageLimit, offset) => {
            const result = await hasuraClient.request(
              UserList,
              {
                limit: pageLimit,
                offset,
              },
              {
                "X-GraphQL-Operation-Name": "UserList",
                "X-GraphQL-Operation-Type": "query",
                cache: "force-cache",
              }
            );
            return safeParse(t.Array(UserSchema), result.user || []);
          }),
          fetchAllTheGraphPages(async (first, skip) => {
            const result = await theGraphClientKit.request(
              UserActivity,
              {
                first,
                skip,
              },
              {
                "X-GraphQL-Operation-Name": "UserActivity",
                "X-GraphQL-Operation-Type": "query",
                cache: "force-cache",
              }
            );
            return safeParse(t.Array(AccountSchema), result.accounts || []);
          }),
        ]);

        // Create a map of accounts by address for quick lookup
        const accountsById = new Map(
          accounts.map((account) => [getAddress(account.id), account])
        );

        // Combine user data with account data and calculate fields
        return users.map((user) => {
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
      }
    )
  )
);
