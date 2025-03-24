import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse } from "@/lib/utils/typebox";
import { cache } from "react";
import { type Address, getAddress } from "viem";
import { userCalculateFields } from "./user-calculated";
import { AccountFragment, UserFragment } from "./user-fragment";
import { AccountSchema, UserSchema } from "./user-schema";

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
 * Fetches and combines user data with blockchain activity
 *
 * @param params - Object containing either the user ID or address
 * @returns Combined user data with additional calculated metrics
 * @throws Error if fetching fails or if neither id nor address is provided
 */
export const getUserDetail = cache(
  withAccessControl(
    { requiredPermissions: { user: ["list"] } },
    async ({ id, address }: UserDetailProps) => {
      if (!id && !address) {
        throw new Error("Either id or address must be provided");
      }

      // Fetch user data from Hasura
      const user = await (async () => {
        if (id) {
          const result = await hasuraClient.request(UserDetail, { id });
          if (!result.user_by_pk) {
            throw new Error(`User not found with ID ${id}`);
          }
          return safeParse(UserSchema, result.user_by_pk);
        } else if (address) {
          const result = await hasuraClient.request(UserDetailByWallet, {
            address: getAddress(address as string),
          });
          if (!result.user || result.user.length === 0) {
            throw new Error(`User not found with wallet address ${address}`);
          }
          return safeParse(UserSchema, result.user[0]);
        } else {
          throw new Error("Either id or address must be provided");
        }
      })();

      // Fetch blockchain account data if wallet address is available
      const account = user.wallet
        ? await (async () => {
            try {
              const result = await theGraphClientKit.request(UserActivity, {
                id: user.wallet.toLowerCase(),
              });
              if (!result.account) {
                return undefined;
              }
              return safeParse(AccountSchema, result.account);
            } catch (error) {
              console.error("Error fetching user activity:", error);
              return undefined;
            }
          })()
        : undefined;

      // Calculate additional fields
      const calculatedFields = userCalculateFields(user, account);

      // Return combined data
      return {
        ...account,
        ...user,
        ...calculatedFields,
      };
    }
  )
);
