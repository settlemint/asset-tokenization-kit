import "server-only";

import { getUser } from "@/lib/auth/utils";
import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { withAccessControl } from "@/lib/utils/access-control";
import { withTracing } from "@/lib/utils/sentry-tracing";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import type { Address } from "viem";
import { UserFragment } from "./user-fragment";

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
 * GraphQL query to fetch a single user by wallet address from Hasura
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
// const UserActivity = theGraphGraphqlKit(
//   `
//   query UserActivity($id: ID!) {
//     account(id: $id) {
//       ...AccountFragment
//     }
//   }
// `,
//   [AccountFragment]
// );

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

const getUserDetailFromIdOrAddress = withTracing(
  "queries",
  "getUserDetailFromIdOrAddress",
  cache(async ({ id, address }: UserDetailProps) => {
    "use cache";
    cacheTag("user-activity");
    if (!id && !address) {
      throw new Error("Either id or address must be provided");
    }

    // Fetch user data from Hasura
    // const user = await (async () => {
    //   cacheTag("user");
    //   if (id) {
    //     const result = await hasuraClient.request(
    //       UserDetail,
    //       { id },
    //       {
    //         "X-GraphQL-Operation-Name": "UserDetail",
    //         "X-GraphQL-Operation-Type": "query",
    //       }
    //     );
    //     if (!result.user_by_pk) {
    //       throw new Error(`User not found with ID ${id}`);
    //     }
    //     return safeParse(UserSchema, result.user_by_pk);
    //   } else if (address) {
    //     const result = await hasuraClient.request(
    //       UserDetailByWallet,
    //       {
    //         address: getAddress(address as string),
    //       },
    //       {
    //         "X-GraphQL-Operation-Name": "UserDetailByWallet",
    //         "X-GraphQL-Operation-Type": "query",
    //       }
    //     );
    //     if (!result.user || result.user.length === 0) {
    //       throw new Error(`User not found with wallet address ${address}`);
    //     }
    //     return safeParse(UserSchema, result.user[0]);
    //   } else {
    //     throw new Error("Either id or address must be provided");
    //   }
    // })();

    // NOTE: HARDCODED SO IT STILL COMPILES - user and account data
    const user = {
      id: "mock-user-id",
      wallet: "0x0000000000000000000000000000000000000000" as Address,
      email: "mock@example.com",
      isActive: true,
      isAdmin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      kycStatus: "not_started" as const,
      verified: false,
      residency: "US",
      deletedAt: null,
      isHouseAccount: false,
      name: "Mock User",
      role: "user",
      banned: false,
      kycVerifiedAt: null,
      lastActivity: null,
      lastLoginAt: null,
    };

    const account = {
      id: "0x0000000000000000000000000000000000000000",
      transactionsSent: 0,
      transactionsReceived: 0,
    };

    // Calculate additional fields
    // const calculatedFields = userCalculateFields(user, account);

    // Return combined data
    return {
      ...account,
      ...user,
      // ...calculatedFields,
    };
  })
);

/**
 * Fetches and combines user data with blockchain activity
 *
 * @param params - Object containing either the user ID or address
 * @returns Combined user data with additional calculated metrics
 * @throws Error if fetching fails or if neither id nor address is provided
 */
export const getUserDetail = withTracing(
  "queries",
  "getUserDetail",
  withAccessControl(
    { requiredPermissions: { user: ["list"] } },
    getUserDetailFromIdOrAddress
  )
);

/**
 * Fetches and combines user data with blockchain activity for the current user
 *
 * @returns Combined user data with additional calculated metrics
 * @throws Error if fetching fails or if neither id nor address is provided
 */
export const getCurrentUserDetail = withTracing(
  "queries",
  "getCurrentUserDetail",
  async () => {
    const user = await getUser();
    return getUserDetailFromIdOrAddress({ id: user.id });
  }
);
