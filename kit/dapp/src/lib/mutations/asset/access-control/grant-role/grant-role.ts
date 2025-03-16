import { handleChallenge } from '@/lib/challenge';
import { type Role, getRoleIdentifier } from '@/lib/config/roles';
import { action } from '@/lib/mutations/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { safeParseWithLogging, z } from '@/lib/utils/zod';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { ResultOf, VariablesOf } from '@settlemint/sdk-portal';
import { GrantRoleSchema } from './grant-role-schema';

/**
 * GraphQL mutation for granting a role to a user for a stablecoin
 *
 * @remarks
 * Assigns permissions to an account for interacting with the stablecoin
 */
export const StableCoinGrantRole = portalGraphql(`
  mutation GrantRole($address: String!, $from: String!, $challengeResponse: String!, $input: StableCoinGrantRoleInput!) {
    GrantRole: StableCoinGrantRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for granting a role to a user for a bond
 *
 * @remarks
 * Assigns permissions to an account for interacting with the bond
 */
export const BondGrantRole = portalGraphql(`
  mutation GrantRole($address: String!, $from: String!, $challengeResponse: String!, $input: BondGrantRoleInput!) {
    GrantRole: BondGrantRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for granting a role to a user for a cryptocurrency
 *
 * @remarks
 * Assigns permissions to an account for interacting with the cryptocurrency
 */
export const CryptoCurrencyGrantRole = portalGraphql(`
  mutation GrantRole($address: String!, $from: String!, $challengeResponse: String!, $input: CryptoCurrencyGrantRoleInput!) {
    GrantRole: CryptoCurrencyGrantRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for granting a role to a user for a fund
 *
 * @remarks
 * Assigns permissions to an account for interacting with the fund
 */
export const FundGrantRole = portalGraphql(`
  mutation GrantRole($address: String!, $from: String!, $challengeResponse: String!, $input: FundGrantRoleInput!) {
    GrantRole: FundGrantRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for granting a role to a user for a equity
 *
 * @remarks
 * Assigns permissions to an account for interacting with the equity
 */
export const EquityGrantRole = portalGraphql(`
  mutation GrantRole($address: String!, $from: String!, $challengeResponse: String!, $input: EquityGrantRoleInput!) {
    GrantRole: EquityGrantRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

type GrantRoleInput = VariablesOf<
  | typeof StableCoinGrantRole
  | typeof BondGrantRole
  | typeof CryptoCurrencyGrantRole
  | typeof FundGrantRole
  | typeof EquityGrantRole
>;
type GrantRoleOutput = ResultOf<
  | typeof StableCoinGrantRole
  | typeof BondGrantRole
  | typeof CryptoCurrencyGrantRole
  | typeof FundGrantRole
  | typeof EquityGrantRole
>;

export type GrantRoleMutation = TypedDocumentNode<
  GrantRoleOutput,
  GrantRoleInput
>;

export const getGrantRoleAction = (grantRoleMutation: GrantRoleMutation) =>
  action
    .schema(GrantRoleSchema)
    .outputSchema(z.hashes())
    .action(
      async ({
        parsedInput: { address, roles, userAddress, pincode },
        ctx: { user },
      }) => {
        const selectedRoles = Object.entries(roles)
          .filter(([, enabled]) => enabled)
          .map(([role]) => role as Role);

        // Create an array of promises for each role granting request
        const grantPromises = selectedRoles.map(async (role) => {
          const response = await portalClient.request(grantRoleMutation, {
            address: address,
            from: user.wallet,
            input: {
              role: getRoleIdentifier(role),
              account: userAddress,
            },
            challengeResponse: await handleChallenge(user.wallet, pincode),
          });

          return response.GrantRole?.transactionHash;
        });

        // Execute all requests in parallel
        const results = await Promise.all(grantPromises);

        // Filter out any undefined values and return transaction hashes
        const transactions = results.filter(Boolean) as string[];

        return safeParseWithLogging(z.hashes(), transactions);
      }
    );
