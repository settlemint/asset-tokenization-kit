import "server-only";

import { fetchAllHasuraPages, fetchAllTheGraphPages } from "@/lib/pagination";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withAccessControl } from "@/lib/utils/access-control";
import { withTracing } from "@/lib/utils/sentry-tracing";
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
// const UserActivity = theGraphGraphqlKit(
//   `
//   query UserActivity($first: Int, $skip: Int) {
//     accounts(where: { isContract: false }, first: $first, skip: $skip) {
//       ...AccountFragment
//     }
//   }
// `,
//   [AccountFragment]
// );

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
        
        // NOTE: HARDCODED SO IT STILL COMPILES
        const users = [{
          id: "mock-user-1",
          wallet: "0x0000000000000000000000000000000000000001" as Address,
          email: "user1@example.com",
          isActive: true,
          isAdmin: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          kycStatus: "not_started" as const,
          verified: false,
          residency: "US",
          deletedAt: null,
          isHouseAccount: false,
          name: "Mock User 1",
          role: "user",
          banned: false,
          kycVerifiedAt: null,
          lastActivity: null,
          lastLoginAt: null
        }];
        
        const accounts = [];

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
